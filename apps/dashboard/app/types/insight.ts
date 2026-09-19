/**
 * Canonical insight types shared between API routes, feed component, and modal.
 * These mirror the DB schema exactly — uppercase enum values, chartDataJson as
 * a parsed array rather than a raw string.
 */

export type InsightType     = "RISK" | "OPPORTUNITY" | "ANOMALY" | "SUMMARY";
export type InsightSeverity = "CRITICAL" | "WARNING" | "INFO";
export type InsightActionStatus = "ACCEPTED" | "DISMISSED" | "TASK_CREATED";

export interface ChartDataPoint {
  label: string;
  value: number;
  benchmark?: number;
}

export interface InsightDetail {
  whatHappened: string;
  whyDetected: string;
  chartTitle: string;
  chartType: "bar" | "line" | "area";
  chartData: ChartDataPoint[];
  businessImpact: string;
  recommendedAction: string;
}

export interface Insight {
  id: string;
  organizationId: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  accountName: string | null;
  ctaHref: string;
  ctaLabel: string;
  read: boolean;
  /** Latest action taken on this insight, if any */
  actionStatus: InsightActionStatus | null;
  createdAt: string; // ISO
  detail: InsightDetail;
}
