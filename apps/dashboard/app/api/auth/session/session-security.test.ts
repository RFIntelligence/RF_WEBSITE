import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, verifySessionToken, getSession } from "@/app/lib/session";

const h = vi.hoisted(() => {
  const users = [
    {
      id: "usr_alice",
      organizationId: "org_acme",
      name: "Alice Smith",
      email: "alice@acme.com",
      role: "ADMIN",
    },
    {
      id: "usr_bob",
      organizationId: "org_globex",
      name: "Bob Jones",
      email: "bob@globex.com",
      role: "MEMBER",
    },
  ];

  const organizations = [
    { id: "org_acme", name: "Acme Corp", plan: "Enterprise" },
    { id: "org_globex", name: "Globex Corporation", plan: "Pro" },
  ];

  const cookiesStore = new Map<string, string>();

  return { users, organizations, cookiesStore };
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const val = h.cookiesStore.get(name);
      return val ? { value: val } : undefined;
    },
  }),
}));

vi.mock("@/app/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async (args: { where: { id: string }; select?: any }) => {
        const u = h.users.find((user) => user.id === args.where.id);
        if (!u) return null;
        const org = h.organizations.find((o) => o.id === u.organizationId) ?? null;
        return {
          ...u,
          organization: org,
        };
      }),
    },
    organization: {
      findUnique: vi.fn(async (args: { where: { id: string } }) =>
        h.organizations.find((o) => o.id === args.where.id) ?? null
      ),
    },
  },
}));

import { GET as getSessionRoute } from "./route";

describe("Session & Tenant Isolation Security", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "test_super_secret_key_1234567890_32bytes";
    h.cookiesStore.clear();
    vi.clearAllMocks();
  });

  describe("Session Token Integrity", () => {
    it("binds organizationId exclusively to the database record for the authenticated user", async () => {
      // Create session for Alice (org_acme)
      const token = createSessionToken("usr_alice");
      h.cookiesStore.set("rf_session", token);

      const session = await getSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe("usr_alice");
      expect(session?.organizationId).toBe("org_acme");
    });

    it("prevents tampering with the token payload to claim another organizationId or userId", async () => {
      const validToken = createSessionToken("usr_alice");

      // Attacker attempts to modify payload part of 'payload.signature'
      const [payloadPart, sigPart] = validToken.split(".");
      const decoded = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));

      // Tamper: change uid to Bob (org_globex)
      decoded.uid = "usr_bob";
      const tamperedPayload = Buffer.from(JSON.stringify(decoded)).toString("base64url");
      const tamperedToken = `${tamperedPayload}.${sigPart}`;

      // Verification must fail signature check
      const verified = verifySessionToken(tamperedToken);
      expect(verified).toBeNull();

      // getSession with tampered token returns null (Unauthorized)
      h.cookiesStore.set("rf_session", tamperedToken);
      const session = await getSession();
      expect(session).toBeNull();
    });

    it("ignores arbitrary client headers attempting to override organizationId", async () => {
      const token = createSessionToken("usr_alice");
      h.cookiesStore.set("rf_session", token);

      // Simulated request containing malicious headers trying to switch tenant to org_globex
      const req = new Request("http://localhost/api/auth/session", {
        headers: {
          "x-organization-id": "org_globex",
          "x-tenant-id": "org_globex",
        },
      });

      const res = await getSessionRoute();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.user.id).toBe("usr_alice");
      // Must strictly match Alice's DB organization (org_acme), ignoring headers
      expect(json.organization.id).toBe("org_acme");
      expect(json.organization.name).toBe("Acme Corp");
    });
  });
});
