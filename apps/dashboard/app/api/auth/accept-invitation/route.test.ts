import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── hoisted mocks ────────────────────────────────────────────────────────────

const h = vi.hoisted(() => {
  const invitation = {
    id: "inv_1",
    organizationId: "org_a",
    email: "invitee@acme.com",
    role: "MEMBER",
    status: "PENDING",
    expiresAt: new Date(Date.now() + 7 * 86_400_000),
  };

  const invFindUnique = vi.fn(async (args: { where: { id: string } }) =>
    args.where.id === "inv_1" ? { ...invitation } : null,
  );
  const invUpdate = vi.fn(async () => ({}));

  const userFindUnique = vi.fn(async (args: { where: { email: string } }) =>
    args.where.email === "taken@acme.com" ? { id: "usr_taken" } : null,
  );

  const txUser = {
    id: "usr_new",
    name: "New User",
    email: "invitee@acme.com",
    role: "MEMBER",
    organizationId: "org_a",
  };

  // $transaction executes the callback with the same prisma-like object
  const $transaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      user: {
        create: vi.fn(async () => txUser),
      },
      invitation: {
        update: vi.fn(async () => ({})),
      },
      notificationPreference: {
        create: vi.fn(async () => ({})),
      },
    };
    return fn(tx);
  });

  const auditCreate = vi.fn(async () => ({}));
  const setSessionCookie = vi.fn(async () => {});
  const getSession = vi.fn(async (): Promise<{ userId: string; organizationId: string; name: string; email: string; role: string } | null> => null);

  // verifyInviteToken returns a valid payload by default
  const verifyInviteToken = vi.fn(() => ({ iid: "inv_1", iat: Date.now() }) as { iid: string; iat: number } | null);

  return {
    invitation,
    invFindUnique,
    invUpdate,
    userFindUnique,
    txUser,
    $transaction,
    auditCreate,
    setSessionCookie,
    getSession,
    verifyInviteToken,
    prisma: {
      invitation: { findUnique: invFindUnique, update: invUpdate },
      user: { findUnique: userFindUnique },
      auditLog: { create: auditCreate },
      $transaction,
    },
  };
});

vi.mock("@/app/lib/session", () => ({
  getSession: h.getSession,
  setSessionCookie: h.setSessionCookie,
}));
vi.mock("@/app/lib/db", () => ({ prisma: h.prisma }));
vi.mock("@/app/lib/invite-token", () => ({
  verifyInviteToken: h.verifyInviteToken,
}));

import { POST } from "./route";

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/accept-invitation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  token: "valid_token",
  name: "New User",
  password: "securepassword",
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/accept-invitation", () => {
  it("creates a user, marks invitation accepted, and sets a session cookie", async () => {
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(201);
    const data = (await res.json()) as { user: { email: string; role: string } };
    expect(data.user.email).toBe("invitee@acme.com");
    expect(data.user.role).toBe("MEMBER");

    // Transaction ran
    expect(h.$transaction).toHaveBeenCalled();

    // Audit logged
    expect(h.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "INVITATION_ACCEPTED" }),
      }),
    );

    // Session cookie set
    expect(h.setSessionCookie).toHaveBeenCalledWith("usr_new");
  });

  it("returns 400 for an invalid token signature", async () => {
    h.verifyInviteToken.mockReturnValueOnce(null);
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(400);
    expect(h.$transaction).not.toHaveBeenCalled();
  });

  it("returns 404 when the invitation row doesn't exist", async () => {
    h.verifyInviteToken.mockReturnValueOnce({ iid: "inv_ghost", iat: Date.now() });
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(404);
  });

  it("returns 410 for an already-accepted invitation", async () => {
    h.invFindUnique.mockResolvedValueOnce({ ...h.invitation, status: "ACCEPTED" });
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(410);
    expect(h.$transaction).not.toHaveBeenCalled();
  });

  it("returns 410 for an expired invitation", async () => {
    h.invFindUnique.mockResolvedValueOnce({
      ...h.invitation,
      expiresAt: new Date(Date.now() - 1000),
    });
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(410);
    expect(h.$transaction).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already taken (race condition guard)", async () => {
    h.userFindUnique.mockResolvedValueOnce({ id: "usr_taken" });
    // Override to return the invitation's email
    h.invFindUnique.mockResolvedValueOnce({
      ...h.invitation,
      email: "taken@acme.com",
    });
    h.verifyInviteToken.mockReturnValueOnce({ iid: "inv_1", iat: Date.now() });
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(409);
    expect(h.$transaction).not.toHaveBeenCalled();
  });

  it("returns 400 when the token is missing", async () => {
    const res = await POST(postRequest({ name: "New", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(postRequest({ token: "valid_token", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await POST(postRequest({ token: "valid_token", name: "User", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when already authenticated", async () => {
    h.getSession.mockResolvedValueOnce({
      userId: "usr_existing",
      organizationId: "org_a",
      name: "Existing",
      email: "e@acme.com",
      role: "MEMBER" as const,
    });
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(409);
    expect(h.$transaction).not.toHaveBeenCalled();
  });
});
