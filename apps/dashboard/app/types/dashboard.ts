/**
 * Canonical types for the GET /api/dashboard response.
 * No mock-data shapes leak through here — these mirror DB-derived values only.
 */

import type { Insight } from "@/app/types/insight";
import type { Project } from "@/app/types/project";

// ─── Metric cards ─────────────────────────────────────────────────────────────

export type TrendDirection = "up" | "down" | "flat";
export type ChipColor = "red" | "blue" | "green" | "amber" | "violet";
export type MetricIconKey =
  | "folder-kanban"
  | "messages-square"
  | "sparkles"
  | "users"
  | "trending-up";

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  delta: string;
  deltaValue: number;
  trend: TrendDirection;
  chipColor: ChipColor;
  iconKey: MetricIconKey;
  period: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";

export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  dismissible: boolean;
}

// ─── Recent conversations (displayed as "messages") ───────────────────────────

export interface RecentConversation {
  id: string;
  /** Used as sender name in the UI */
  senderName: string;
  senderInitials: string;
  /** Last message preview */
  preview: string;
  relativeTime: string;
  /** ISO timestamp of last activity */
  updatedAt: string;
  /** True when conversation.unread === true */
  unread: boolean;
  /** Conversation topic shown as context label */
  contextLabel: string;
}

// ─── Dashboard API response ───────────────────────────────────────────────────

export interface SectionErrors {
  projects?: boolean;
  insights?: boolean;
  metrics?: boolean;
  alerts?: boolean;
  conversations?: boolean;
  counts?: {
    projects?: boolean;
    conversations?: boolean;
    insights?: boolean;
    renewal?: boolean;
    team?: boolean;
  };
}

export interface DashboardData {
  /** Greeting name from the signed-in user's profile */
  userName: string;
  metricCards: MetricCard[];
  /** Up to 5 most-recently-updated projects */
  projects: Project[];
  /** Up to 5 most-recent insights */
  insights: Insight[];
  unreadInsightCount: number;
  alerts: DashboardAlert[];
  /** Up to 5 most-recently-updated conversations */
  recentConversations: RecentConversation[];
  /** Per-section error flags indicating which sections failed to load (e.g. timeout or P1001) */
  errors?: SectionErrors;
}
