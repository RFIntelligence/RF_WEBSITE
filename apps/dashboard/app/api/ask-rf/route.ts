import { getSession } from "@/app/lib/session";
import { retrieveContext } from "@/app/lib/retrieval";
import { askDeepSeek, DeepSeekConfigError } from "@/app/lib/deepseek";
import { rateLimit } from "@/app/lib/rate-limit";
import { prisma } from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION_LENGTH = 2000;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function json(
  body: unknown,
  status = 200,
  headers?: Record<string, string>,
): Response {
  return Response.json(body, { status, headers });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Identity comes exclusively from the signed session cookie. The client
  //    can never supply or override the user or organization id.
  const session = await getSession();
  if (!session) {
    return json({ error: "Unauthorized" }, 401);
  }

  // 2. Only `question` is read from the body. Any `organizationId` / `userId`
  //    sent by the client is ignored on purpose.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const question =
    typeof payload === "object" && payload !== null && "question" in payload
      ? String((payload as { question?: unknown }).question ?? "").trim()
      : "";

  if (!question) {
    return json({ error: "A non-empty 'question' is required" }, 400);
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return json(
      { error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer` },
      400,
    );
  }

  // 3. Per-user rate limiting.
  const limit = rateLimit(
    `ask-rf:${session.userId}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.allowed) {
    return json({ error: "Too many requests. Please slow down." }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  // 4. Tenant-scoped retrieval. `session.organizationId` is the only tenant
  //    identifier that ever reaches the data layer.
  const sources = await retrieveContext(session.organizationId, question);

  // 5. Only the retrieved context is sent to DeepSeek.
  let answer: string;
  try {
    answer = await askDeepSeek(question, sources);
  } catch (error) {
    if (error instanceof DeepSeekConfigError) {
      return json({ error: "Ask RF is not configured." }, 503);
    }
    console.error("Ask RF: DeepSeek request failed", error);
    return json(
      { error: "Ask RF is temporarily unavailable. Please try again." },
      502,
    );
  }

  // 6. Audit trail: question, answer and the exact source ids used.
  try {
    await prisma.askRfQuery.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        queryText: question,
        answerText: answer,
        sourcesJson: JSON.stringify(sources.map((source) => source.id)),
      },
    });
  } catch (error) {
    console.error("Ask RF: failed to persist query log", error);
  }

  return json({
    answer,
    sources: sources.map((source, index) => ({
      id: source.id,
      type: source.type,
      title: source.title,
      label: `S${index + 1}`,
    })),
  });
}
