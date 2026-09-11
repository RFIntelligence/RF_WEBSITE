/**
 * RF Intelligence Dashboard — Mock Data
 * ─────────────────────────────────────────────────────────────────────────────
 * Structured as real API response shapes so Part 2 is a clean swap:
 *   • Replace the export with `await fetch("/api/…")` and the components
 *     need zero changes — the shape contracts are the same.
 *
 * Naming convention: every export is the plural noun of its type, e.g.
 *   MetricCardData[]    → metricCards
 *   ActiveProject[]     → activeProjects
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Shared primitives ────────────────────────────────────────────────────────

/** ISO 8601 date-time string — what a real API would return */
type ISODateString = string;

export type TrendDirection = "up" | "down" | "flat";
export type StatusLevel   = "on_track" | "at_risk" | "blocked" | "completed";
export type AlertSeverity = "critical" | "warning" | "info";
export type InsightType   = "risk" | "opportunity" | "anomaly" | "summary";

// ─── User / org (shared across features) ─────────────────────────────────────

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  role: string;
}

export interface OrgSummary {
  id: string;
  name: string;
  plan: "Enterprise" | "Pro" | "Starter";
}

export const currentUser: UserSummary = {
  id: "usr_jordan",
  name: "Jordan Ellis",
  email: "jordan.ellis@acmecorp.com",
  avatarInitials: "JE",
  role: "Admin",
};

export const orgs: OrgSummary[] = [
  { id: "org_acme",      name: "Acme Corp",       plan: "Enterprise" },
  { id: "org_northstar", name: "Northstar Labs",   plan: "Pro"        },
  { id: "org_rfdemo",    name: "RF Demo Org",      plan: "Starter"    },
];

// ─── Metric cards ─────────────────────────────────────────────────────────────
// Drives the top KPI row. `iconKey` maps to a lucide icon name in the component.

export interface MetricCardData {
  id: string;
  label: string;
  value: string;
  /** Raw numeric for accessibility / aria-label */
  rawValue: number;
  delta: string;
  deltaValue: number;       // positive = up, negative = down, 0 = flat
  trend: TrendDirection;
  /** Tailwind-compatible color token for the icon chip bg + icon */
  chipColor: "red" | "blue" | "green" | "amber" | "violet";
  iconKey: "folder-kanban" | "messages-square" | "sparkles" | "users" | "trending-up";
  /** Period label shown under the delta */
  period: string;
}

export const metricCards: MetricCardData[] = [
  {
    id:        "mc_projects",
    label:     "Active Projects",
    value:     "14",
    rawValue:  14,
    delta:     "+2",
    deltaValue: 2,
    trend:     "up",
    chipColor: "blue",
    iconKey:   "folder-kanban",
    period:    "vs last month",
  },
  {
    id:        "mc_conversations",
    label:     "Open Conversations",
    value:     "38",
    rawValue:  38,
    delta:     "+5",
    deltaValue: 5,
    trend:     "up",
    chipColor: "violet",
    iconKey:   "messages-square",
    period:    "since yesterday",
  },
  {
    id:        "mc_insights",
    label:     "AI Insights",
    value:     "127",
    rawValue:  127,
    delta:     "+23",
    deltaValue: 23,
    trend:     "up",
    chipColor: "red",
    iconKey:   "sparkles",
    period:    "last 30 days",
  },
  {
    id:        "mc_renewal",
    label:     "Renewal Rate",
    value:     "94%",
    rawValue:  94,
    delta:     "+3%",
    deltaValue: 3,
    trend:     "up",
    chipColor: "green",
    iconKey:   "trending-up",
    period:    "this quarter",
  },
  {
    id:        "mc_team",
    label:     "Team Members",
    value:     "9",
    rawValue:  9,
    delta:     "0",
    deltaValue: 0,
    trend:     "flat",
    chipColor: "amber",
    iconKey:   "users",
    period:    "across 3 orgs",
  },
];

// ─── Active projects ──────────────────────────────────────────────────────────

export interface ActiveProject {
  id: string;
  name: string;
  accountName: string;
  status: StatusLevel;
  /** 0–100 */
  progress: number;
  dueDate: ISODateString;
  ownerInitials: string;
  ownerName: string;
  /** Count of open tasks */
  openTasks: number;
}

export const activeProjects: ActiveProject[] = [
  {
    id:            "proj_horizon",
    name:          "Horizon v2 Launch",
    accountName:   "Meridian Health",
    status:        "on_track",
    progress:      72,
    dueDate:       "2026-09-28T00:00:00Z",
    ownerInitials: "PS",
    ownerName:     "Priya Sharma",
    openTasks:     4,
  },
  {
    id:            "proj_renewal_acme",
    name:          "Acme Renewal Prep",
    accountName:   "Acme Corp",
    status:        "at_risk",
    progress:      45,
    dueDate:       "2026-09-20T00:00:00Z",
    ownerInitials: "JE",
    ownerName:     "Jordan Ellis",
    openTasks:     9,
  },
  {
    id:            "proj_onboard_ns",
    name:          "Northstar Onboarding",
    accountName:   "Northstar Labs",
    status:        "on_track",
    progress:      91,
    dueDate:       "2026-09-15T00:00:00Z",
    ownerInitials: "TK",
    ownerName:     "Tom Kwan",
    openTasks:     1,
  },
  {
    id:            "proj_qbr_globalfin",
    name:          "GlobalFin QBR Deck",
    accountName:   "GlobalFin",
    status:        "blocked",
    progress:      30,
    dueDate:       "2026-09-18T00:00:00Z",
    ownerInitials: "AR",
    ownerName:     "Ana Reyes",
    openTasks:     6,
  },
  {
    id:            "proj_datasync_exp",
    name:          "DataSync Expansion",
    accountName:   "DataSync Solutions",
    status:        "on_track",
    progress:      58,
    dueDate:       "2026-10-05T00:00:00Z",
    ownerInitials: "ML",
    ownerName:     "Marcus Lee",
    openTasks:     7,
  },
];

// ─── AI Insights feed ─────────────────────────────────────────────────────────

export interface InsightItem {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  accountName: string | null;
  severity: AlertSeverity;
  /** Relative string for display; real API would return createdAt ISO + client formats it */
  relativeTime: string;
  createdAt: ISODateString;
  /** Deep link target within the app */
  ctaHref: string;
  ctaLabel: string;
  read: boolean;
}

export const insights: InsightItem[] = [
  {
    id:           "ins_pipeline_conc",
    type:         "risk",
    title:        "Pipeline concentration risk",
    body:         "3 accounts represent 61% of Q4 ARR. Diversification recommended before close period.",
    accountName:  null,
    severity:     "critical",
    relativeTime: "10 min ago",
    createdAt:    "2026-09-11T08:52:00Z",
    ctaHref:      "/ai-insights",
    ctaLabel:     "View analysis",
    read:         false,
  },
  {
    id:           "ins_renewal_vel",
    type:         "opportunity",
    title:        "Renewal velocity above target",
    body:         "Q3 renewal rate hit 94%, up 3 pts QoQ. 2 expansion opportunities identified in Meridian Health.",
    accountName:  "Meridian Health",
    severity:     "info",
    relativeTime: "1 hr ago",
    createdAt:    "2026-09-11T08:02:00Z",
    ctaHref:      "/ai-insights",
    ctaLabel:     "See opportunities",
    read:         false,
  },
  {
    id:           "ins_sentiment_drop",
    type:         "anomaly",
    title:        "Sentiment drop — Acme Corp",
    body:         "Last 3 calls scored below 0.5. Executive sponsor changed 2 weeks ago. Renewal in 9 days.",
    accountName:  "Acme Corp",
    severity:     "warning",
    relativeTime: "3 hr ago",
    createdAt:    "2026-09-11T06:02:00Z",
    ctaHref:      "/conversations",
    ctaLabel:     "Review calls",
    read:         true,
  },
  {
    id:           "ins_qbr_summary",
    type:         "summary",
    title:        "Q3 QBR deck auto-generated",
    body:         "RF compiled 8-slide deck for GlobalFin from call transcripts and CRM data. Ready for review.",
    accountName:  "GlobalFin",
    severity:     "info",
    relativeTime: "Yesterday",
    createdAt:    "2026-09-10T14:00:00Z",
    ctaHref:      "/reports",
    ctaLabel:     "Open deck",
    read:         true,
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  dismissible: boolean;
}

export const alerts: AlertItem[] = [
  {
    id:          "alert_renewal_acme",
    severity:    "critical",
    title:       "Acme Corp renewal in 9 days",
    body:        "Contract value $480K. Sentiment trending negative. No exec touchpoint in 14 days.",
    ctaLabel:    "Open account",
    ctaHref:     "/conversations",
    dismissible: true,
  },
  {
    id:          "alert_globalfin_blocked",
    severity:    "warning",
    title:       "GlobalFin QBR deck is blocked",
    body:        "Ana Reyes flagged a blocker: missing Q2 usage data from integrations team.",
    ctaLabel:    "Go to project",
    ctaHref:     "/projects",
    dismissible: true,
  },
  {
    id:          "alert_datasync_overdue",
    severity:    "warning",
    title:       "3 tasks overdue across DataSync Expansion",
    body:        "Tasks were due Sep 8. Marcus Lee has not logged activity in 4 days.",
    ctaLabel:    "View tasks",
    ctaHref:     "/projects",
    dismissible: true,
  },
];

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  preview: string;
  relativeTime: string;
  sentAt: ISODateString;
  read: boolean;
  /** Optional: account or project this message is scoped to */
  contextLabel: string | null;
}

export const recentMessages: MessageItem[] = [
  {
    id:             "msg_1",
    senderId:       "usr_priya",
    senderName:     "Priya Sharma",
    senderInitials: "PS",
    preview:        "Can we sync on the renewal deck before EOD? I have some concerns about slide 4.",
    relativeTime:   "8 min ago",
    sentAt:         "2026-09-11T08:54:00Z",
    read:           false,
    contextLabel:   "Acme Renewal Prep",
  },
  {
    id:             "msg_2",
    senderId:       "usr_tom",
    senderName:     "Tom Kwan",
    senderInitials: "TK",
    preview:        "Northstar onboarding is basically done. Final checklist attached.",
    relativeTime:   "45 min ago",
    sentAt:         "2026-09-11T08:17:00Z",
    read:           false,
    contextLabel:   "Northstar Onboarding",
  },
  {
    id:             "msg_3",
    senderId:       "usr_ana",
    senderName:     "Ana Reyes",
    senderInitials: "AR",
    preview:        "Blocked on GlobalFin QBR — need the usage export from integrations.",
    relativeTime:   "2 hr ago",
    sentAt:         "2026-09-11T07:02:00Z",
    read:           true,
    contextLabel:   "GlobalFin QBR Deck",
  },
  {
    id:             "msg_4",
    senderId:       "usr_marcus",
    senderName:     "Marcus Lee",
    senderInitials: "ML",
    preview:        "DataSync Expansion: added 3 tasks to the backlog after yesterday's call.",
    relativeTime:   "Yesterday",
    sentAt:         "2026-09-10T16:30:00Z",
    read:           true,
    contextLabel:   "DataSync Expansion",
  },
];

// ─── Quick actions ────────────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  /** Lucide icon key */
  iconKey: "plus" | "message-circle-question" | "file-plus" | "user-plus" | "upload";
  href: string;
  description: string;
}

export const quickActions: QuickAction[] = [
  {
    id:          "qa_new_project",
    label:       "New Project",
    iconKey:     "plus",
    href:        "/projects",
    description: "Start a new project for an account",
  },
  {
    id:          "qa_ask_rf",
    label:       "Ask RF",
    iconKey:     "message-circle-question",
    href:        "/ask-rf",
    description: "Query RF with a natural language question",
  },
  {
    id:          "qa_new_report",
    label:       "New Report",
    iconKey:     "file-plus",
    href:        "/reports",
    description: "Generate or upload a report",
  },
  {
    id:          "qa_add_member",
    label:       "Add Member",
    iconKey:     "user-plus",
    href:        "/team",
    description: "Invite a team member to this workspace",
  },
  {
    id:          "qa_upload",
    label:       "Upload Doc",
    iconKey:     "upload",
    href:        "/reports",
    description: "Upload a document for RF to analyse",
  },
];

// ─── Notification bell (topbar) ───────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  relativeTime: string;
  createdAt: ISODateString;
  read: boolean;
}

export const notifications: NotificationItem[] = [
  {
    id:           "notif_1",
    title:        "New AI insight ready",
    body:         "Q3 pipeline analysis is complete.",
    relativeTime: "2 min ago",
    createdAt:    "2026-09-11T09:00:00Z",
    read:         false,
  },
  {
    id:           "notif_2",
    title:        "Project updated",
    body:         "Horizon v2 milestones were updated by Priya.",
    relativeTime: "18 min ago",
    createdAt:    "2026-09-11T08:44:00Z",
    read:         false,
  },
  {
    id:           "notif_3",
    title:        "Message from Priya S.",
    body:         "Can we sync on the renewal deck?",
    relativeTime: "1 hr ago",
    createdAt:    "2026-09-11T08:02:00Z",
    read:         true,
  },
  {
    id:           "notif_4",
    title:        "Report exported",
    body:         "Q2 Customer Health report is ready to download.",
    relativeTime: "3 hr ago",
    createdAt:    "2026-09-11T06:02:00Z",
    read:         true,
  },
];

// ─── Legacy re-exports (kept so TopBar / old imports don't break) ─────────────
export const MOCK_USER         = currentUser;
export const MOCK_ORGS         = orgs;
export const MOCK_NOTIFICATIONS = notifications;
