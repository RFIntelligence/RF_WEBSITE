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

export async function createOrgTokenRequest(
  organizationId: string,
  clientId: string,
): Promise<unknown> {
  const rest = getRestClient();
  const pattern = `rf-intel:org:${organizationId}:*`;
  // Always request a fresh tokenRequest with unique nonce to prevent Ably 40105 replay errors
  return rest.auth.createTokenRequest({
    clientId,
    capability: JSON.stringify({ [pattern]: ["subscribe"] }),
  });
}

/**
 * Issues an Ably token request scoped to a single channel. The caller MUST have
 * already verified that the session belongs to the channel's organization.
 * Generates a fresh tokenRequest every time with a new nonce (never cached).
 */
export async function createChannelTokenRequest(
  channel: string,
  clientId: string,
): Promise<unknown> {
  const rest = getRestClient();
  // Always request a fresh tokenRequest with unique nonce to prevent Ably 40105 replay errors
  return rest.auth.createTokenRequest({
    clientId,
    capability: JSON.stringify({ [channel]: ["subscribe"] }),
  });
}
