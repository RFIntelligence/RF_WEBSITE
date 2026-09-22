import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function parseLimit(raw: string | null): number {
  const parsed = raw === null || raw.trim() === "" ? NaN : Number(raw);
  return Number.isFinite(parsed)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(parsed)))
    : DEFAULT_LIMIT;
}

import { withTiming } from "@/app/lib/timing";

// ─── 15s Server Cache & In-flight Promise per user ───────────────────────────

interface CachedNotifications {
  data: { notifications: any[]; unreadCount: number };
  expiresAt: number;
}

const notificationsCache = new Map<string, CachedNotifications>();
const notificationsInFlight = new Map<string, Promise<{ notifications: any[]; unreadCount: number }>>();
const NOTIFICATIONS_CACHE_TTL_MS = 15_000;

export function invalidateNotificationsCache(userId?: string) {
  if (userId) {
    notificationsCache.delete(userId);
    notificationsInFlight.delete(userId);
  } else {
    notificationsCache.clear();
    notificationsInFlight.clear();
  }
}

export async function GET(request: Request): Promise<Response> {
  return withTiming("GET /api/notifications", async () => {
    const session = await getSession();
    if (!session) return json({ error: "Unauthorized" }, 401);

    const limit = parseLimit(new URL(request.url).searchParams.get("limit"));
    const cacheKey = `${session.userId}::${limit}`;

    const cached = notificationsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return json(cached.data);
    }

    const inFlight = notificationsInFlight.get(cacheKey);
    if (inFlight) {
      const data = await inFlight;
      return json(data);
    }

    const fetchPromise = (async () => {
      try {
        const [notifications, unreadCount] = await Promise.all([
          prisma.notification.findMany({
            where: { organizationId: session.organizationId, userId: session.userId },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
              id: true,
              title: true,
              body: true,
              read: true,
              createdAt: true,
            },
          }),
          prisma.notification.count({
            where: {
              organizationId: session.organizationId,
              userId: session.userId,
              read: false,
            },
          }),
        ]);

        const result = { notifications, unreadCount };
        notificationsCache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + NOTIFICATIONS_CACHE_TTL_MS,
        });
        return result;
      } finally {
        notificationsInFlight.delete(cacheKey);
      }
    })();

    notificationsInFlight.set(cacheKey, fetchPromise);
    const data = await fetchPromise;
    return json(data);
  });
}

/**
 * Marks notifications as read. Only the signed-in user's own notifications can
 * be touched — the update is scoped by both organization and user id.
 */
export async function PATCH(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const read = typeof body.read === "boolean" ? body.read : true;
  const markAll = body.all === true;
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((value): value is string => typeof value === "string")
    : [];

  if (!markAll && ids.length === 0) {
    return json({ error: "Provide notification ids or set all=true" }, 400);
  }

  const result = await prisma.notification.updateMany({
    where: {
      organizationId: session.organizationId,
      userId: session.userId,
      ...(markAll ? {} : { id: { in: ids } }),
    },
    data: { read },
  });

  const unreadCount = await prisma.notification.count({
    where: {
      organizationId: session.organizationId,
      userId: session.userId,
      read: false,
    },
  });

  invalidateNotificationsCache(session.userId);

  return json({ updated: result.count, unreadCount });
}
