import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import type { Insight, InsightActionStatus, ChartDataPoint } from "@/app/types/insight";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseChartData(json: string): ChartDataPoint[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as ChartDataPoint[]) : [];
  } catch {
    return [];
  }
}

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

/**
 * GET /api/insights/:id
 * Retrieve a single insight with organization isolation.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: insightId } = await params;
  if (!insightId) {
    return Response.json({ error: "Insight ID is required" }, { status: 400 });
  }

  const row = await prisma.insight.findFirst({
    where: {
      id: insightId,
      organizationId: session.organizationId,
    },
    select: INSIGHT_SELECT,
  });

  if (!row) {
    return Response.json({ error: "Insight not found" }, { status: 404 });
  }

  const latestAction = row.actions[0] ?? null;
  const serialized: Insight = {
    id: row.id,
    organizationId: row.organizationId,
    type: row.type as Insight["type"],
    severity: row.severity as Insight["severity"],
    title: row.title,
    body: row.body,
    accountName: row.accountName,
    ctaHref: row.ctaHref,
    ctaLabel: row.ctaLabel,
    read: row.read,
    actionStatus: latestAction
      ? (latestAction.actionStatus as InsightActionStatus)
      : null,
    createdAt: row.createdAt.toISOString(),
    detail: {
      whatHappened: row.whatHappened,
      whyDetected: row.whyDetected,
      chartTitle: row.chartTitle,
      chartType: row.chartType as Insight["detail"]["chartType"],
      chartData: parseChartData(row.chartDataJson),
      businessImpact: row.businessImpact,
      recommendedAction: row.recommendedAction,
    },
  };

  return Response.json({ insight: serialized });
}
