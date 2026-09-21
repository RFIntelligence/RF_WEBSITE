import * as Ably from "ably";

/**
 * Server-side realtime operations (Ably).
 *
 * Realtime is optional: when `ABLY_API_KEY` is not configured the app degrades
 * gracefully — `publishToChannel` becomes a no-op and clients fall back to
 * polling. Channel authorization is always performed here so a subscriber can
 * never be granted access to another organization's channel.
 */

export function isRealtimeConfigured(): boolean {
  return Boolean(process.env.ABLY_API_KEY?.trim());
}

let restClient: Ably.Rest | null = null;

function getRestClient(): Ably.Rest {
  const key = process.env.ABLY_API_KEY?.trim();
  if (!key) throw new Error("ABLY_API_KEY is not configured");
  if (!restClient) {
    restClient = new Ably.Rest({ key });
  }
  return restClient;
}

export async function publishToChannel(
  channel: string,
  event: string,
  data: unknown,
): Promise<boolean> {
  if (!isRealtimeConfigured()) return false;

  try {
    await getRestClient().channels.get(channel).publish(event, data);
    return true;
  } catch (error) {
    console.error("realtime: publish failed", error);
    return false;
  }
}

// Token request cache per channel + clientId (valid for ~50 minutes, Ably default TTL is 1 hr)
interface CachedToken {
  tokenRequest: unknown;
  expiresAt: number;
}
const tokenCache = new Map<string, CachedToken>();
const TOKEN_TTL_MS = 50 * 60 * 1000; // 50 minutes

export async function createOrgTokenRequest(
  organizationId: string,
  clientId: string,
): Promise<unknown> {
  const cacheKey = `org:${organizationId}::${clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tokenRequest;
  }

  const rest = getRestClient();
  const pattern = `rf-intel:org:${organizationId}:*`;
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId,
    capability: JSON.stringify({ [pattern]: ["subscribe"] }),
  });

  tokenCache.set(cacheKey, {
    tokenRequest,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });

  return tokenRequest;
}

/**
 * Issues an Ably token request scoped to a single channel. The caller MUST have
 * already verified that the session belongs to the channel's organization.
 * Caches token requests per channel+clientId until near expiry.
 */
export async function createChannelTokenRequest(
  channel: string,
  clientId: string,
): Promise<unknown> {
  const cacheKey = `${channel}::${clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tokenRequest;
  }

  const rest = getRestClient();
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId,
    capability: JSON.stringify({ [channel]: ["subscribe"] }),
  });

  tokenCache.set(cacheKey, {
    tokenRequest,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });

  return tokenRequest;
}
