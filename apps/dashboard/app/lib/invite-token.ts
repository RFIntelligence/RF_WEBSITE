import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Invitation token format:
 *   <base64url-payload>.<hmac-sha256-signature>
 *
 * Payload: { iid: invitationId, iat: issuedAtMs }
 *
 * The invitation id is also stored in the DB row so the token can be
 * invalidated (revoked / already accepted) without relying solely on the
 * cryptographic signature.
 */

interface InviteTokenPayload {
  iid: string; // invitation id
  iat: number; // issued-at ms
}

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not configured");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createInviteToken(
  invitationId: string,
  now: number = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify({ iid: invitationId, iat: now } satisfies InviteTokenPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyInviteToken(
  token: string,
  now: number = Date.now(),
): InviteTokenPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return null;
  }

  let decoded: InviteTokenPayload;
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof decoded.iid !== "string" || typeof decoded.iat !== "number") return null;
  if (now - decoded.iat > INVITE_TTL_MS) return null;

  return decoded;
}

/** Generate a random opaque nonce (for the DB `token` uniqueness index). */
export function generateInviteNonce(): string {
  return randomBytes(32).toString("base64url");
}
