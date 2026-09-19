import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { serializeConversationSummary } from "@/app/lib/conversations";
import { orgChannel, REALTIME_EVENTS } from "@/app/lib/realtime/channels";
import { publishToChannel } from "@/app/lib/realtime/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_TOPIC_LENGTH = 160;
const MAX_CONTEXT_LENGTH = 160;
const DEFAULT_RF_LEAD = "RF Intelligence Support";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function parseLimit(raw: string | null): number {
  const parsed = raw === null || raw.trim() === "" ? NaN : Number(raw);
  return Number.isFinite(parsed)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(parsed)))
    : DEFAULT_LIMIT;
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  const limit = parseLimit(new URL(request.url).searchParams.get("limit"));

  const conversations = await prisma.conversation.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    },
  });

  return json({
    conversations: conversations.map(serializeConversationSummary),
  });
}

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const contextLabel =
    typeof body.contextLabel === "string" ? body.contextLabel.trim() : "";
  const rfLead =
    typeof body.rfLead === "string" && body.rfLead.trim().length > 0
      ? body.rfLead.trim()
      : DEFAULT_RF_LEAD;

  if (!topic) return json({ error: "A topic is required" }, 400);
  if (topic.length > MAX_TOPIC_LENGTH) {
    return json(
      { error: `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer` },
      400,
    );
  }
  if (!contextLabel) return json({ error: "A context label is required" }, 400);
  if (contextLabel.length > MAX_CONTEXT_LENGTH) {
    return json(
      {
        error: `Context label must be ${MAX_CONTEXT_LENGTH} characters or fewer`,
      },
      400,
    );
  }

  const conversation = await prisma.conversation.create({
    data: {
      organizationId: session.organizationId,
      topic,
      contextLabel,
      rfLead,
    },
  });

  await publishToChannel(
    orgChannel(session.organizationId, "messages"),
    REALTIME_EVENTS.conversationCreated,
    {
      conversation: {
        id: conversation.id,
        topic: conversation.topic,
        contextLabel: conversation.contextLabel,
        rfLead: conversation.rfLead,
        unread: conversation.unread,
        createdAt: conversation.createdAt,
      },
    },
  );

  return json({ conversation }, 201);
}
