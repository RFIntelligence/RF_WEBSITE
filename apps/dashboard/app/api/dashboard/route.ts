/**
 * GET /api/dashboard
 *
 * Single round-trip that returns every dataset the Dashboard Overview page
 * needs. All queries are scoped by organizationId from the verified session.
 *
 * Shape:
 *   { userName, metricCards[], projects[], insights[], unreadInsightCount,
 *     alerts[], recentConversations[] }
 */

import { getSession } from "@/app/lib/session";
import { prisma }     from "@/app/lib/db";
import type { DashboardData, MetricCard, DashboardAlert, RecentConversation } from "@/app/types/dashboard";
import type { Project }  from "@/app/types/project";
import type { Insight, InsightActionStatus, ChartDataPoint } from "@/app/types/insight";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days  === 1) return "Yesterday";
  return `${days} days ago`;
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function parseChartData(json: string): ChartDataPoint[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? (v as ChartDataPoint[]) : [];
  } catch { return []; }
}

// ─── Metric card computation ──────────────────────────────────────────────────
//
// Counts are derived from live DB rows. Deltas compare the current 30-day
// window against the prior 30-day window so they stay meaningful over time.

async function buildMetricCards(
  orgId: string,
  now: Date,
): Promise<MetricCard[]> {
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 86_400_000);
  const sixtyDaysAgo   = new Date(now.getTime() - 60 * 86_400_000);
  const yesterday      = new Date(now.getTime() -      86_400_000);

  const [
    activeProjectCount,
    prevProjectCount,
    openConvCount,
    prevConvCount,
    insightCount30d,
    insightCount60d,
    memberCount,
    prevMemberCount,
  ] = await Promise.all([
    // Active projects now
    prisma.project.count({
      where: { organizationId: orgId, status: { not: "COMPLETED" } },
    }),
    // Active projects before last 30 days (as a "last month" baseline)
    prisma.project.count({
      where: {
        organizationId: orgId,
        status: { not: "COMPLETED" },
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    // Open (unread) conversations
    prisma.conversation.count({
      where: { organizationId: orgId, unread: true },
    }),
    // Open conversations older than yesterday (i.e., "since yesterday" delta)
    prisma.conversation.count({
      where: { organizationId: orgId, unread: true, createdAt: { lt: yesterday } },
    }),
    // AI insights last 30 days
    prisma.insight.count({
      where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
    }),
    // AI insights 30–60 days ago (prior window)
    prisma.insight.count({
      where: {
        organizationId: orgId,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    // Current team size
    prisma.user.count({ where: { organizationId: orgId } }),
    // Team size 30 days ago (created before then)
    prisma.user.count({
      where: { organizationId: orgId, createdAt: { lt: thirtyDaysAgo } },
    }),
  ]);

  // Renewal rate: accepted insights / total insights with actions in last quarter
  const quarterAgo = new Date(now.getTime() - 90 * 86_400_000);
  const [totalActioned, acceptedActioned] = await Promise.all([
    prisma.insightAction.count({
      where: { organizationId: orgId, performedAt: { gte: quarterAgo } },
    }),
    prisma.insightAction.count({
      where: {
        organizationId: orgId,
        actionStatus:   "ACCEPTED",
        performedAt:    { gte: quarterAgo },
      },
    }),
  ]);
  const renewalRate    = totalActioned > 0
    ? Math.round((acceptedActioned / totalActioned) * 100)
    : 0;
  const prevQuarterAgo = new Date(now.getTime() - 180 * 86_400_000);
  const [prevTotal, prevAccepted] = await Promise.all([
    prisma.insightAction.count({
      where: {
        organizationId: orgId,
        performedAt: { gte: prevQuarterAgo, lt: quarterAgo },
      },
    }),
    prisma.insightAction.count({
      where: {
        organizationId: orgId,
        actionStatus:   "ACCEPTED",
        performedAt:    { gte: prevQuarterAgo, lt: quarterAgo },
      },
    }),
  ]);
  const prevRenewalRate = prevTotal > 0
    ? Math.round((prevAccepted / prevTotal) * 100)
    : 0;
  const renewalDelta = renewalRate - prevRenewalRate;

  const projectDelta = activeProjectCount - prevProjectCount;
  const convDelta    = openConvCount      - prevConvCount;
  const insightDelta = insightCount30d    - insightCount60d;
  const memberDelta  = memberCount        - prevMemberCount;

  return [
    {
      id:         "mc_projects",
      label:      "Active Projects",
      value:      String(activeProjectCount),
      rawValue:   activeProjectCount,
      delta:      signed(projectDelta),
      deltaValue: projectDelta,
      trend:      projectDelta > 0 ? "up" : projectDelta < 0 ? "down" : "flat",
      chipColor:  "blue",
      iconKey:    "folder-kanban",
      period:     "vs last month",
    },
    {
      id:         "mc_conversations",
      label:      "Open Conversations",
      value:      String(openConvCount),
      rawValue:   openConvCount,
      delta:      signed(convDelta),
      deltaValue: convDelta,
      trend:      convDelta > 0 ? "up" : convDelta < 0 ? "down" : "flat",
      chipColor:  "violet",
      iconKey:    "messages-square",
      period:     "since yesterday",
    },
    {
      id:         "mc_insights",
      label:      "AI Insights",
      value:      String(insightCount30d),
      rawValue:   insightCount30d,
      delta:      signed(insightDelta),
      deltaValue: insightDelta,
      trend:      insightDelta > 0 ? "up" : insightDelta < 0 ? "down" : "flat",
      chipColor:  "red",
      iconKey:    "sparkles",
      period:     "last 30 days",
    },
    {
      id:         "mc_renewal",
      label:      "Acceptance Rate",
      value:      `${renewalRate}%`,
      rawValue:   renewalRate,
      delta:      signed(renewalDelta) + "%",
      deltaValue: renewalDelta,
      trend:      renewalDelta > 0 ? "up" : renewalDelta < 0 ? "down" : "flat",
      chipColor:  "green",
      iconKey:    "trending-up",
      period:     "this quarter",
    },
    {
      id:         "mc_team",
      label:      "Team Members",
      value:      String(memberCount),
      rawValue:   memberCount,
      delta:      memberDelta === 0 ? "0" : signed(memberDelta),
      deltaValue: memberDelta,
      trend:      memberDelta > 0 ? "up" : memberDelta < 0 ? "down" : "flat",
      chipColor:  "amber",
      iconKey:    "users",
      period:     "in this workspace",
    },
  ];
}

// ─── Alerts — derived from at-risk projects + critical unread insights ────────

async function buildAlerts(orgId: string): Promise<DashboardAlert[]> {
  const [atRiskProjects, criticalInsights] = await Promise.all([
    prisma.project.findMany({
      where:   { organizationId: orgId, status: { in: ["AT_RISK", "BLOCKED"] } },
      orderBy: { updatedAt: "desc" },
      take:    3,
      select:  { id: true, name: true, status: true, accountName: true, dueDate: true },
    }),
    prisma.insight.findMany({
      where: {
        organizationId: orgId,
        severity: "CRITICAL",
        read: false,
        actions: { none: { actionStatus: { in: ["DISMISSED", "ACCEPTED"] } } },
      },
      orderBy: { createdAt: "desc" },
      take:    3,
      select:  { id: true, title: true, body: true, accountName: true },
    }),
  ]);

  const alerts: DashboardAlert[] = [];

  for (const p of atRiskProjects) {
    const daysLeft = Math.ceil((p.dueDate.getTime() - Date.now()) / 86_400_000);
    const duePart  = daysLeft <= 0
      ? "overdue"
      : daysLeft === 1 ? "due tomorrow"
      : `due in ${daysLeft} days`;

    alerts.push({
      id:          `alert_proj_${p.id}`,
      severity:    p.status === "BLOCKED" ? "critical" : "warning",
      title:       `${p.name} is ${p.status === "BLOCKED" ? "blocked" : "at risk"}`,
      body:        `${p.accountName} — ${duePart}.`,
      ctaLabel:    "Go to project",
      ctaHref:     "/projects",
      dismissible: true,
    });
  }

  for (const ins of criticalInsights) {
    alerts.push({
      id:          `alert_ins_${ins.id}`,
      severity:    "critical",
      title:       ins.title,
      body:        ins.accountName ? `${ins.accountName} — ${ins.body}` : ins.body,
      ctaLabel:    "View insight",
      ctaHref:     "/ai-insights",
      dismissible: true,
    });
  }

  return alerts;
}

// ─── Recent conversations ─────────────────────────────────────────────────────

async function buildRecentConversations(orgId: string): Promise<RecentConversation[]> {
  const rows = await prisma.conversation.findMany({
    where:   { organizationId: orgId },
    orderBy: { updatedAt: "desc" },
    take:    5,
    select: {
      id:           true,
      topic:        true,
      contextLabel: true,
      rfLead:       true,
      unread:       true,
      updatedAt:    true,
      messages: {
        orderBy: { createdAt: "desc" },
        take:    1,
        select:  {
          content:   true,
          createdAt: true,
          sender: { select: { name: true, avatarInitials: true } },
        },
      },
    },
  });

  return rows.map((row) => {
    const lastMsg    = row.messages[0] ?? null;
    const senderName = lastMsg?.sender.name ?? row.rfLead;
    const initials   = lastMsg?.sender.avatarInitials
      ?? row.rfLead
           .split(" ")
           .map((w) => w[0])
           .join("")
           .toUpperCase()
           .slice(0, 2);

    return {
      id:           row.id,
      senderName,
      senderInitials: initials,
      preview:      lastMsg?.content ?? row.topic,
      relativeTime: relativeTime(lastMsg?.createdAt ?? row.updatedAt),
      updatedAt:    row.updatedAt.toISOString(),
      unread:       row.unread,
      contextLabel: row.contextLabel,
    };
  });
}

// ─── Projects (top 5, re-uses same select as /api/projects) ──────────────────

import { PROJECT_SELECT, serializeProject, type ProjectRow } from "@/app/api/projects/route";

// ─── Insights (top 5, re-uses same select as /api/insights) ──────────────────

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
    take:    1,
    select:  { actionStatus: true },
  },
} as const;

type RawInsight = NonNullable<
  Awaited<ReturnType<typeof prisma.insight.findFirst<{ select: typeof INSIGHT_SELECT }>>>
> & { actions: Array<{ actionStatus: string }> };

function serializeInsight(r: RawInsight): Insight {
  return {
    id:             r.id,
    organizationId: r.organizationId,
    type:           r.type as Insight["type"],
    severity:       r.severity as Insight["severity"],
    title:          r.title,
    body:           r.body,
    accountName:    r.accountName,
    ctaHref:        r.ctaHref,
    ctaLabel:       r.ctaLabel,
    read:           r.read,
    actionStatus:   r.actions[0]
      ? (r.actions[0].actionStatus as InsightActionStatus)
      : null,
    createdAt:      r.createdAt.toISOString(),
    detail: {
      whatHappened:      r.whatHappened,
      whyDetected:       r.whyDetected,
      chartTitle:        r.chartTitle,
      chartType:         r.chartType as Insight["detail"]["chartType"],
      chartData:         parseChartData(r.chartDataJson),
      businessImpact:    r.businessImpact,
      recommendedAction: r.recommendedAction,
    },
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.organizationId;
  const now   = new Date();

  // All queries run in parallel — single DB round-trip fan-out
  const [
    user,
    metricCards,
    rawProjects,
    rawInsights,
    unreadInsightCount,
    alerts,
    recentConversations,
  ] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: session.userId },
      select: { name: true },
    }),
    buildMetricCards(orgId, now),
    prisma.project.findMany({
      where:   { organizationId: orgId },
      orderBy: { updatedAt: "desc" },
      take:    5,
      select:  PROJECT_SELECT,
    }),
    prisma.insight.findMany({
      where:   { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take:    5,
      select:  INSIGHT_SELECT,
    }),
    prisma.insight.count({
      where: { organizationId: orgId, read: false },
    }),
    buildAlerts(orgId),
    buildRecentConversations(orgId),
  ]);

  const payload: DashboardData = {
    userName:           user?.name ?? "there",
    metricCards,
    projects:           rawProjects.map((p) => serializeProject(p as ProjectRow)),
    insights:           rawInsights.map((r) => serializeInsight(r as RawInsight)),
    unreadInsightCount,
    alerts,
    recentConversations,
  };

  return Response.json(payload);
}
