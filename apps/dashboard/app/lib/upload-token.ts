import { createHmac, timingSafeEqual } from "node:crypto";

export interface UploadTokenPayload {
  key: string;
  organizationId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  size: number;
  exp: number;
}

const TOKEN_TTL_MS = 15 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createUploadToken(
  payload: Omit<UploadTokenPayload, "exp">,
  now: number = Date.now(),
): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: now + TOKEN_TTL_MS }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyUploadToken(
  token: string,
  now: number = Date.now(),
): UploadTokenPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return null;
  }

  let payload: UploadTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof payload.key !== "string" ||
    typeof payload.organizationId !== "string" ||
    typeof payload.userId !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return null;
  }
  if (now > payload.exp) return null;

  return payload;
}
