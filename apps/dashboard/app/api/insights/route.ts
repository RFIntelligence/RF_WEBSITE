import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import type { Insight, InsightActionStatus, ChartDataPoint } from "@/app/types/insight";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parseLimit(raw: string | null): number {
  const n = raw === null ? NaN : Number(raw);
  return Number.isFinite(n) ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(n))) : DEFAULT_LIMIT;
}

function parseChartData(json: string): ChartDataPoint[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as ChartDataPoint[]) : [];
  } catch {
    return [];
  }
}

/**
 * Serialise a raw DB insight row to the API shape.
 * The latest InsightAction (if any) is surfaced as `actionStatus`.
 */
function serialize(row: RawInsightRow): Insight {
  const latestAction = row.actions[0] ?? null;
  return {
    id:             row.id,
    organizationId: row.organizationId,
    type:           row.type as Insight["type"],
    severity:       row.severity as Insight["severity"],
    title:          row.title,
    body:           row.body,
    accountName:    row.accountName,
    ctaHref:        row.ctaHref,
    ctaLabel:       row.ctaLabel,
    read:           row.read,
    actionStatus:   latestAction
      ? (latestAction.actionStatus as InsightActionStatus)
      : null,
    createdAt:      row.createdAt.toISOString(),
    detail: {
      whatHappened:      row.whatHappened,
      whyDetected:       row.whyDetected,
      chartTitle:        row.chartTitle,
      chartType:         row.chartType as Insight["detail"]["chartType"],
      chartData:         parseChartData(row.chartDataJson),
      businessImpact:    row.businessImpact,
      recommendedAction: row.recommendedAction,
    },
  };
}

// ─── Prisma select shape ──────────────────────────────────────────────────────

const INSIGHT_SELECT = {
  id: true,
  organizationId: true,
  type: true,
  severity: true,
  title: true,
  body: true,
  accountName: true,
  ctaHref: true,
  ctaLabel: true,
  read: true,
  whatHappened: true,
  whyDetected: true,
  chartTitle: true,
  chartType: true,
  chartDataJson: true,
  businessImpact: true,
  recommendedAction: true,
  createdAt: true,
  actions: {
    orderBy: { performedAt: "desc" as const },
    take: 1,
    select: { actionStatus: true },
  },
} as const;

type RawInsightRow = Awaited<
  ReturnType<typeof prisma.insight.findFirst<{ select: typeof INSIGHT_SELECT }>>
> & object;

// ─── GET /api/insights ────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url   = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));

  const rows = await prisma.insight.findMany({
    where:   { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
    take:    limit,
    select:  INSIGHT_SELECT,
  });

  const unreadCount = await prisma.insight.count({
    where: { organizationId: session.organizationId, read: false },
  });

  return Response.json({
    insights: rows.map((r) => serialize(r as RawInsightRow)),
    unreadCount,
  });
}
