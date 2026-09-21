import { getSession } from "@/app/lib/session";
import { parseOrganizationFromChannel } from "@/app/lib/realtime/channels";
import {
  createChannelTokenRequest,
  createOrgTokenRequest,
  isRealtimeConfigured,
} from "@/app/lib/realtime/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function channelFrom(
  request: Request,
  body: Record<string, unknown>,
): string | null {
  const fromQuery = new URL(request.url).searchParams.get("channel");
  if (fromQuery) return fromQuery;

  const fromBody = body.channel;
  return typeof fromBody === "string" && fromBody.length > 0 ? fromBody : null;
}

/**
 * Authorizes a realtime subscription.
 *
 * The organization embedded in the channel name is compared against the
 * organization resolved from the signed session. A subscriber can therefore
 * only ever be granted access to their own organization's channel.
 */
import { withTiming } from "@/app/lib/timing";

async function authorize(
  request: Request,
  body: Record<string, unknown>,
): Promise<Response> {
  return withTiming("REALTIME AUTH /api/realtime/auth", async () => {
    const session = await getSession();
    if (!session) return json({ error: "Unauthorized" }, 401);

    const channel = channelFrom(request, body);
    if (!channel) {
      if (!isRealtimeConfigured()) {
        return json(
          { error: "Realtime is not configured", configured: false },
          503,
        );
      }
      try {
        const tokenRequest = await createOrgTokenRequest(
          session.organizationId,
          session.userId,
        );
        return Response.json(tokenRequest);
      } catch (error) {
        console.error("realtime: failed to authorize org token", error);
        return json({ error: "Could not authorize channel" }, 500);
      }
    }

    const channelOrganizationId = parseOrganizationFromChannel(channel);
    if (!channelOrganizationId) return json({ error: "Unknown channel" }, 400);

    if (channelOrganizationId !== session.organizationId) {
      return json({ error: "Forbidden" }, 403);
    }

    if (!isRealtimeConfigured()) {
      return json(
        { error: "Realtime is not configured", configured: false },
        503,
      );
    }

    try {
      const tokenRequest = await createChannelTokenRequest(
        channel,
        session.userId,
      );
      // Ably's auth URL expects a bare TokenRequest/TokenDetails document.
      return Response.json(tokenRequest);
    } catch (error) {
      console.error("realtime: failed to authorize channel", error);
      return json({ error: "Could not authorize channel" }, 500);
    }
  });
}

export async function GET(request: Request): Promise<Response> {
  return authorize(request, {});
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await request.json();
    if (parsed && typeof parsed === "object") {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    // Ably may POST without a JSON body; the query param still applies.
  }
  return authorize(request, body);
}
