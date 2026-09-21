import { getSession } from "@/app/lib/session";
import { retrieveContext } from "@/app/lib/retrieval";
import { rateLimit } from "@/app/lib/rate-limit";
import { prisma } from "@/app/lib/db";
import { getOrgDataVersion } from "@/app/lib/data-sync";
import {
  OUT_OF_SCOPE_MESSAGE,
  DOCUMENT_RELEVANCE_THRESHOLD,
  PRODUCT_KNOWLEDGE,
  PROMPT_VERSION,
} from "@/lib/ask-rf/domain-config";
import { buildSystemPrompt } from "@/lib/ask-rf/system-prompt";
import { classifyRequest, type RequestCategory } from "@/lib/ask-rf/classifier";
import {
  computeCacheKey,
  getFromCache,
  saveToCache,
} from "@/lib/ask-rf/cache";
import {
  executeGetTeamMembers,
  executeGetProjects,
  executeGetInsights,
  executeGetCustomerConversations,
  executeGetReports,
  executeSearchDocuments,
  executeGetAccountInfo,
  type ToolContext,
} from "@/lib/ask-rf/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION_LENGTH = 4000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function sanitizeInput(text: string): string {
  // Strip control characters except newline and tab
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

function json(
  body: unknown,
  status = 200,
  headers?: Record<string, string>,
): Response {
  return Response.json(body, { status, headers });
}

export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  let stageLatencies: Record<string, number> = {};

  // 1. Session Authentication & Scoping
  const session = await getSession();
  if (!session) {
    return json({ error: "Unauthorized" }, 401);
  }

  // Fetch full user record to verify role and name
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true, organization: { select: { id: true, name: true } } },
  });

  if (!user || !user.organization) {
    return json({ error: "User or organization not found" }, 401);
  }

  const toolCtx: ToolContext = {
    organizationId: user.organization.id,
    userId: user.id,
    userRole: user.role,
  };

  // 2. Parse & Validate Payload
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as {
    question?: unknown;
    regenerate?: unknown;
    history?: Array<{ sender: string; text: string }>;
  };

  const rawQuestion = typeof body.question === "string" ? body.question : "";
  const question = sanitizeInput(rawQuestion);
  const isRegenerate = Boolean(body.regenerate);
  const history = Array.isArray(body.history) ? body.history : [];

  if (!question) {
    return json({ error: "A non-empty 'question' is required" }, 400);
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return json(
      { error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer` },
      400,
    );
  }

  // 3. Per-user Rate Limiting (20 req / min)
  const limit = rateLimit(
    `ask-rf:${user.id}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.allowed) {
    return json({ error: "Too many requests. Please slow down." }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const modelId = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const orgDataVersion = getOrgDataVersion(user.organization.id);

  // 4. Cache Lookup (Phase 6)
  const cacheKey = computeCacheKey({
    prompt: question,
    organizationId: user.organization.id,
    userId: user.id,
    userRole: user.role,
    modelId,
    history,
  });

  if (!isRegenerate) {
    const cachedEntry = getFromCache(cacheKey, user.organization.id);
    if (cachedEntry) {
      return json(
        {
          answer: cachedEntry.answer,
          sources: cachedEntry.sources,
          tier: cachedEntry.tier,
          cached: true,
          dataVersion: orgDataVersion,
        },
        200,
        { "X-Ask-Cache": "HIT" }
      );
    }
  }

  const classifyStart = Date.now();
  // 5. Classification (A, B, C, D)
  const category: RequestCategory = await classifyRequest(question);
  stageLatencies.classification = Date.now() - classifyStart;

  // 6. Handling Category D: OUT_OF_SCOPE
  if (category === "OUT_OF_SCOPE") {
    const refusalEntry = {
      answer: OUT_OF_SCOPE_MESSAGE,
      sources: [],
      tier: "OUT_OF_SCOPE",
      dataVersion: orgDataVersion,
      ttlMs: 24 * 3600 * 1000, // 24h
    };
    saveToCache(cacheKey, refusalEntry);

    return json(
      {
        answer: OUT_OF_SCOPE_MESSAGE,
        sources: [],
        tier: "OUT_OF_SCOPE",
        cached: false,
        dataVersion: orgDataVersion,
      },
      200,
      { "X-Ask-Cache": "MISS" }
    );
  }

  const systemPrompt = buildSystemPrompt({
    orgName: user.organization.name,
    userName: user.name,
    userRole: user.role,
    currentDate: new Date().toISOString().slice(0, 10),
  });

  let answer = "";
  let finalSources: Array<{ id: string; type: string; title: string; label: string }> = [];
  let tier: string = category;
  let cacheTtlMs = 10 * 60 * 1000; // default 10m

  // 7. Category A: WORKSPACE_DATA with deterministic tools / retrieval
  if (category === "WORKSPACE_DATA") {
    const qLower = question.toLowerCase();
    let toolResultContext = "";

    if (qLower.includes("team") || qLower.includes("member") || qLower.includes("who is on")) {
      const teamData = await executeGetTeamMembers(toolCtx);
      toolResultContext = `TEAM MEMBERS TABLE (Total: ${teamData.total})\n` +
        `| Name | Role | Email | Status | Joined |\n` +
        `| --- | --- | --- | --- | --- |\n` +
        teamData.members.map((m) => `| ${m.name} | ${m.role} | ${m.email} | ${m.status} | ${m.joined} |`).join("\n") +
        `\nTotal: ${teamData.total} members`;
    } else if (qLower.includes("project") || qLower.includes("task")) {
      const projData = await executeGetProjects(toolCtx, {});
      toolResultContext = `PROJECTS (Total: ${projData.total})\n` +
        projData.projects.map((p) => `- ${p.name} (${p.accountName}): ${p.status}, ${p.progressPercent}% complete, due ${p.dueDate}, ${p.openTasks} open tasks`).join("\n");
    } else if (qLower.includes("insight") || qLower.includes("risk") || qLower.includes("opportunity")) {
      const insightData = await executeGetInsights(toolCtx, {});
      toolResultContext = `INSIGHTS (Total: ${insightData.total})\n` +
        insightData.insights.map((i) => `- [${i.severity}] ${i.title}: ${i.impact}. Recommendation: ${i.recommendation}`).join("\n");
    } else if (qLower.includes("account") || qLower.includes("plan") || qLower.includes("organization")) {
      const accData = await executeGetAccountInfo(toolCtx);
      toolResultContext = `ACCOUNT INFO:\nOrganization: ${accData.organizationName}, Plan: ${accData.plan}, Member Since: ${accData.memberSince}`;
    }

    // Also pull relevant workspace sources
    const sources = await retrieveContext(user.organization.id, question);
    finalSources = sources.map((s, idx) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      label: `S${idx + 1}`,
    }));

    const fullContext = [
      toolResultContext ? `TOOL RESULTS:\n${toolResultContext}` : "",
      sources.length > 0
        ? `WORKSPACE CONTEXT:\n` + sources.map((s, idx) => `[S${idx + 1}] (${s.type}) ${s.title}: ${s.summary}`).join("\n\n")
        : "",
    ].filter(Boolean).join("\n\n");

    answer = await callDeepSeekWithPrompt(systemPrompt, question, fullContext);
  } else if (category === "PRODUCT_HELP") {
    // 8. Category B: PRODUCT_HELP
    answer = await callDeepSeekWithPrompt(systemPrompt, question, `PRODUCT KNOWLEDGE:\n${PRODUCT_KNOWLEDGE}`);
    cacheTtlMs = 6 * 3600 * 1000;
  } else {
    // 9. Category C: DOMAIN_TOPIC (Search documents first)
    const sources = await retrieveContext(user.organization.id, question);
    if (sources.length > 0) {
      finalSources = sources.map((s, idx) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        label: `S${idx + 1}`,
      }));
      const contextStr = sources.map((s, idx) => `[S${idx + 1}] (${s.type}) ${s.title}: ${s.summary}`).join("\n\n");
      answer = await callDeepSeekWithPrompt(systemPrompt, question, `WORKSPACE DOCUMENTS:\n${contextStr}`);
    } else {
      // General domain answer with opening disclosure
      const domainAnswer = await callDeepSeekWithPrompt(
        systemPrompt,
        question,
        "No matching internal workspace documents were found. Answer from general knowledge within RF's domain and begin with: 'This is not from your workspace documents.'"
      );
      answer = domainAnswer.startsWith("This is not from your workspace documents")
        ? domainAnswer
        : `This is not from your workspace documents. ${domainAnswer}`;
      cacheTtlMs = 6 * 3600 * 1000;
    }
  }

  // 10. Cache Answer
  saveToCache(cacheKey, {
    answer,
    sources: finalSources,
    tier,
    dataVersion: orgDataVersion,
    ttlMs: cacheTtlMs,
  });

  // Observability logging
  const totalDuration = Date.now() - startTime;
  console.log(JSON.stringify({
    event: "ask_rf_query",
    tier,
    cached: false,
    durationMs: totalDuration,
    orgId: user.organization.id,
    userId: user.id,
  }));

  return json(
    {
      answer,
      sources: finalSources,
      tier,
      cached: false,
      dataVersion: orgDataVersion,
    },
    200,
    { "X-Ask-Cache": "MISS" }
  );
}

async function callDeepSeekWithPrompt(
  systemPrompt: string,
  question: string,
  context: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return "Ask RF is currently operating in offline mode. Please configure DEEPSEEK_API_KEY for generative responses.";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}` },
        ],
        temperature: 0.2,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() || "No response generated.";
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

