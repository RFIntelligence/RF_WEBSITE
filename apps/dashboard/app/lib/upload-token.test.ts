import { beforeAll, describe, expect, it } from "vitest";
import { createUploadToken, verifyUploadToken } from "@/app/lib/upload-token";

const PAYLOAD = {
  key: "org_a/2026/abc-contract.pdf",
  organizationId: "org_a",
  userId: "usr_a",
  fileName: "contract.pdf",
  mimeType: "application/pdf",
  size: 2048,
};

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret";
});

describe("upload token", () => {
  it("round-trips a valid token", () => {
    const token = createUploadToken(PAYLOAD);
    const verified = verifyUploadToken(token);
    expect(verified?.organizationId).toBe("org_a");
    expect(verified?.userId).toBe("usr_a");
    expect(verified?.key).toBe(PAYLOAD.key);
  });

  it("rejects a tampered payload", () => {
    const token = createUploadToken(PAYLOAD);
    const [body, signature] = token.split(".");
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    const forged = Buffer.from(
      JSON.stringify({ ...decoded, organizationId: "org_b" }),
    ).toString("base64url");
    expect(verifyUploadToken(`${forged}.${signature}`)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = createUploadToken(PAYLOAD, 0);
    expect(verifyUploadToken(token, 16 * 60 * 1000)).toBeNull();
  });
});
