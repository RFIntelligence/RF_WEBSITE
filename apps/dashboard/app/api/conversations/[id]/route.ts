import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/conversations/[id]">,
): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  const { id } = await ctx.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const unread = typeof body.unread === "boolean" ? body.unread : false;

  const existing = await prisma.conversation.findFirst({
    where: { id, organizationId: session.organizationId },
    select: { id: true },
  });
  if (!existing) return json({ error: "Conversation not found" }, 404);

  const conversation = await prisma.conversation.update({
    where: { id },
    data: { unread },
    select: { id: true, unread: true },
  });

  return json({ conversation });
}
