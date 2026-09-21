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

export async function GET(request: Request): Promise<Response> {
  return withTiming("GET /api/notifications", async () => {
    const session = await getSession();
    if (!session) return json({ error: "Unauthorized" }, 401);

    const limit = parseLimit(new URL(request.url).searchParams.get("limit"));

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

    return json({ notifications, unreadCount });
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

  return json({ updated: result.count, unreadCount });
}
