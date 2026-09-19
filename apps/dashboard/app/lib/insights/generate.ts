/**
 * Insight generation for a single organization.
 *
 * Security contract (matches Ask RF / retrieval.ts):
 *   Every Prisma query carries `organizationId` in its WHERE clause.
 *   The organizationId is ALWAYS sourced from the verified session or the
 *   Inngest event payload (set server-side) — never from user-supplied input.
 *   No query in this file can return rows from another organization.
 */

import { prisma } from "@/app/lib/db";
import { deliverNotifications } from "@/app/lib/notifications";
import { publishToChannel } from "@/app/lib/realtime/server";
import { orgChannel, REALTIME_EVENTS } from "@/app/lib/realtime/channels";

// ─── LLM call ─────────────────────────────────────────────────────────────────

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

class InsightLLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsightLLMError";
  }
}

// ─── Data collection ──────────────────────────────────────────────────────────

const PER_TYPE_LIMIT = 30;

interface OrgContext {
  organizationId: string;
  organizationName: string;
  projects: Array<{
    id: string;
    name: string;
    accountName: string;
    status: string;
    progress: number;
    dueDate: Date;
    openTasksCount: number;
    activities: Array<{ action: string; type: string; createdAt: Date }>;
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    linkedAccount: string | null;
    metadataJson: string | null;
  }>;
  conversations: Array<{
    id: string;
    topic: string;
    contextLabel: string;
    updatedAt: Date;
  }>;
  members: Array<{ id: string }>;
}

/**
 * Pulls all org-scoped data needed for analysis.
 * SECURITY: every query includes `organizationId` in WHERE.
 */
async function collectOrgContext(organizationId: string): Promise<OrgContext> {
  if (!organizationId) throw new Error("organizationId is required");

  const [org, projects, documents, conversations, members] = await Promise.all([
    prisma.organization.findUniqueOrThrow({
      where:  { id: organizationId },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({
      where:   { organizationId },
      orderBy: { updatedAt: "desc" },
      take:    PER_TYPE_LIMIT,
      select: {
        id: true,
        name: true,
        accountName: true,
        status: true,
        progress: true,
        dueDate: true,
        openTasksCount: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { action: true, type: true, createdAt: true },
        },
      },
    }),
    prisma.document.findMany({
      where:   { organizationId, processingStatus: "PROCESSED" },
      orderBy: { createdAt: "desc" },
      take:    PER_TYPE_LIMIT,
      select: {
        id: true,
        fileName: true,
        linkedAccount: true,
        metadataJson: true,
      },
    }),
    prisma.conversation.findMany({
      where:   { organizationId },
      orderBy: { updatedAt: "desc" },
      take:    PER_TYPE_LIMIT,
      select: { id: true, topic: true, contextLabel: true, updatedAt: true },
    }),
    prisma.user.findMany({
      where:  { organizationId },
      select: { id: true },
    }),
  ]);

  return {
    organizationId,
    organizationName: org.name,
    projects,
    documents,
    conversations,
    members,
  };
}

// ─── Prompt construction ──────────────────────────────────────────────────────

function buildAnalysisPrompt(ctx: OrgContext): string {
  const now = new Date().toISOString().slice(0, 10);

  const projectLines = ctx.projects.map((p) => {
    const due      = p.dueDate.toISOString().slice(0, 10);
    const daysLeft = Math.ceil((p.dueDate.getTime() - Date.now()) / 86_400_000);
    const acts     = p.activities.map((a) => `    - [${a.type}] ${a.action}`).join("\n");
    return [
      `  Project: "${p.name}" | Account: ${p.accountName} | Status: ${p.status}`,
      `    Progress: ${p.progress}% | Due: ${due} (${daysLeft} days) | Open tasks: ${p.openTasksCount}`,
      acts ? `    Recent activity:\n${acts}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const docLines = ctx.documents.map(
    (d) => `  Document: "${d.fileName}"${d.linkedAccount ? ` (account: ${d.linkedAccount})` : ""}`,
  );

  const convLines = ctx.conversations.map(
    (c) => `  Conversation: "${c.topic}" | Context: ${c.contextLabel} | Last updated: ${c.updatedAt.toISOString().slice(0, 10)}`,
  );

  return `You are RF Intelligence, an AI analyst for the "${ctx.organizationName}" organization.
Today is ${now}. Analyze the following organization data and produce a JSON array of insights.

DATA:
Projects (${ctx.projects.length}):
${projectLines.join("\n") || "  (none)"}

Documents (${ctx.documents.length}):
${docLines.join("\n") || "  (none)"}

Conversations (${ctx.conversations.length}):
${convLines.join("\n") || "  (none)"}

TASK:
Generate between 1 and 6 insight objects. Focus on:
- Pipeline / account concentration risk
- Projects with sentiment drops or stalled activity
- Renewal timing risks (due dates within 30 days with low progress)
- Anomalies in task counts or progress
- Expansion or upsell opportunities
- Cross-project summaries

Each insight MUST reference only data listed above — never invent accounts, names, or numbers.

Respond with ONLY a valid JSON array. No markdown, no prose. Each element:
{
  "type":              "RISK" | "OPPORTUNITY" | "ANOMALY" | "SUMMARY",
  "severity":          "CRITICAL" | "WARNING" | "INFO",
  "title":             string (≤80 chars),
  "body":              string (≤200 chars — the feed card summary),
  "accountName":       string | null,
  "ctaHref":           "/ai-insights" | "/projects" | "/conversations" | "/reports",
  "ctaLabel":          string (≤30 chars),
  "whatHappened":      string (2–4 sentences),
  "whyDetected":       string (1–3 sentences explaining the signal),
  "chartTitle":        string,
  "chartType":         "bar" | "line" | "area",
  "chartData":         [{ "label": string, "value": number, "benchmark"?: number }],
  "businessImpact":    string (1–3 sentences),
  "recommendedAction": string (1–3 sentences)
}`;
}

// ─── LLM call ─────────────────────────────────────────────────────────────────

interface RawInsight {
  type: string;
  severity: string;
  title: string;
  body: string;
  accountName: string | null;
  ctaHref: string;
  ctaLabel: string;
  whatHappened: string;
  whyDetected: string;
  chartTitle: string;
  chartType: string;
  chartData: Array<{ label: string; value: number; benchmark?: number }>;
  businessImpact: string;
  recommendedAction: string;
}

const VALID_TYPES     = new Set(["RISK", "OPPORTUNITY", "ANOMALY", "SUMMARY"]);
const VALID_SEVERITIES = new Set(["CRITICAL", "WARNING", "INFO"]);
const VALID_CHART_TYPES = new Set(["bar", "line", "area"]);
const VALID_CTA_HREFS   = new Set(["/ai-insights", "/projects", "/conversations", "/reports"]);

function isValidRaw(r: unknown): r is RawInsight {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    VALID_TYPES.has(o.type as string) &&
    VALID_SEVERITIES.has(o.severity as string) &&
    typeof o.title === "string" && o.title.length > 0 &&
    typeof o.body === "string" && o.body.length > 0 &&
    (o.accountName === null || typeof o.accountName === "string") &&
    VALID_CTA_HREFS.has(o.ctaHref as string) &&
    typeof o.ctaLabel === "string" &&
    typeof o.whatHappened === "string" &&
    typeof o.whyDetected === "string" &&
    typeof o.chartTitle === "string" &&
    VALID_CHART_TYPES.has(o.chartType as string) &&
    Array.isArray(o.chartData) &&
    typeof o.businessImpact === "string" &&
    typeof o.recommendedAction === "string"
  );
}

async function callLLM(prompt: string): Promise<RawInsight[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new InsightLLMError("DEEPSEEK_API_KEY is not configured");

  const model = process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role:    "system",
          content:
            "You are an analytical AI that produces JSON only. Never output markdown or prose.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      stream:      false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new InsightLLMError(`DeepSeek API ${response.status}: ${detail.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!raw) throw new InsightLLMError("DeepSeek returned empty content");

  // Strip any accidental markdown fences
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new InsightLLMError(`LLM returned non-JSON: ${clean.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new InsightLLMError("LLM response was not a JSON array");
  }

  const valid = parsed.filter(isValidRaw);
  if (valid.length === 0) {
    throw new InsightLLMError("LLM returned no valid insight objects");
  }

  return valid;
}

// ─── DB write ─────────────────────────────────────────────────────────────────

async function persistInsights(
  organizationId: string,
  raws: RawInsight[],
): Promise<string[]> {
  const ids: string[] = [];
  for (const r of raws) {
    // Skip exact duplicates (same title created within the last 24 h)
    const exists = await prisma.insight.findFirst({
      where: {
        organizationId,
        title: r.title,
        createdAt: { gte: new Date(Date.now() - 86_400_000) },
      },
      select: { id: true },
    });
    if (exists) continue;

    const created = await prisma.insight.create({
      data: {
        organizationId,
        type:              r.type as "RISK" | "OPPORTUNITY" | "ANOMALY" | "SUMMARY",
        severity:          r.severity as "CRITICAL" | "WARNING" | "INFO",
        title:             r.title.slice(0, 200),
        body:              r.body.slice(0, 500),
        accountName:       r.accountName ?? null,
        ctaHref:           r.ctaHref,
        ctaLabel:          r.ctaLabel.slice(0, 60),
        whatHappened:      r.whatHappened,
        whyDetected:       r.whyDetected,
        chartTitle:        r.chartTitle,
        chartType:         r.chartType,
        chartDataJson:     JSON.stringify(r.chartData),
        businessImpact:    r.businessImpact,
        recommendedAction: r.recommendedAction,
      },
      select: { id: true },
    });
    ids.push(created.id);
  }
  return ids;
}

// ─── Notification + realtime publish ─────────────────────────────────────────

async function notifyOrgMembers(
  organizationId: string,
  memberIds: string[],
  count: number,
): Promise<void> {
  const title = count === 1
    ? "1 new AI insight ready"
    : `${count} new AI insights ready`;
  const body  = "RF Intelligence has surfaced new findings for your workspace.";

  // In-app notifications (preference-aware)
  await deliverNotifications({
    organizationId,
    recipientIds: memberIds,
    title,
    body,
    category: "riskSignals",
  });

  // Push realtime event so the topbar bell updates instantly
  await publishToChannel(
    orgChannel(organizationId, "notifications"),
    REALTIME_EVENTS.notificationCreated,
    { title, body, count },
  );
}

// ─── Public entry point ───────────────────────────────────────────────────────

export interface GenerateInsightsResult {
  organizationId: string;
  generated: number;
  skippedDuplicates: number;
  notified: boolean;
  error?: string;
}

/**
 * Full pipeline for one organization:
 *   collect → prompt → LLM → validate → persist → notify
 *
 * Safe to call from Inngest (scheduled or event-triggered). Any error is
 * returned in the result rather than thrown so Inngest can log it cleanly.
 */
export async function generateInsightsForOrg(
  organizationId: string,
): Promise<GenerateInsightsResult> {
  if (!organizationId) {
    return { organizationId, generated: 0, skippedDuplicates: 0, notified: false, error: "organizationId is required" };
  }

  let ctx: OrgContext;
  try {
    ctx = await collectOrgContext(organizationId);
  } catch (err) {
    return {
      organizationId,
      generated: 0,
      skippedDuplicates: 0,
      notified: false,
      error: `Data collection failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Nothing to analyse yet
  if (ctx.projects.length === 0 && ctx.conversations.length === 0 && ctx.documents.length === 0) {
    return { organizationId, generated: 0, skippedDuplicates: 0, notified: false };
  }

  let raws: RawInsight[];
  try {
    raws = await callLLM(buildAnalysisPrompt(ctx));
  } catch (err) {
    return {
      organizationId,
      generated: 0,
      skippedDuplicates: 0,
      notified: false,
      error: `LLM call failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const beforeCount = raws.length;
  const ids = await persistInsights(organizationId, raws);
  const skippedDuplicates = beforeCount - ids.length;

  let notified = false;
  if (ids.length > 0) {
    try {
      await notifyOrgMembers(
        organizationId,
        ctx.members.map((m) => m.id),
        ids.length,
      );
      notified = true;
    } catch (err) {
      // Non-fatal: insights are persisted regardless
      console.error("insights: notification failed", err);
    }
  }

  return { organizationId, generated: ids.length, skippedDuplicates, notified };
}
