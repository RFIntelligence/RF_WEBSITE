import {
  metricCards,
  activeProjects,
  insights,
  alerts,
  recentMessages,
  quickActions,
  currentUser,
} from "@/app/lib/mock-data";
import { MetricCard }          from "@/app/components/dashboard/metric-card";
import { ActiveProjectsList }  from "@/app/components/dashboard/active-projects-list";
import { InsightsFeed }        from "@/app/components/dashboard/insights-feed";
import { AlertsPanel }         from "@/app/components/dashboard/alerts-panel";
import { AskRFWidget }         from "@/app/components/dashboard/ask-rf-widget";
import { RecentMessages }      from "@/app/components/dashboard/recent-messages";
import { QuickActionsRow }     from "@/app/components/dashboard/quick-actions-row";
import { Separator }           from "@/app/components/ui/separator";

// ─── Page ─────────────────────────────────────────────────────────────────────
// Layout (1440 reference):
//
//  ┌─────────────────────────────────────────────────────────────────────────┐
//  │  Greeting + eyebrow                                                     │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │  Quick-actions row (5 icon buttons)                                     │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │  Metric cards (5 across, responsive auto-fill)                          │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │  Alerts (full-width, collapses when all dismissed)                      │
//  ├──────────────────────────────────┬──────────────────────────────────────┤
//  │  Active Projects (left, 2/3)     │  Ask RF Widget + Recent Messages     │
//  │  Insights Feed (left, 2/3)       │  (right sidebar, 1/3)                │
//  └──────────────────────────────────┴──────────────────────────────────────┘

export default function DashboardPage() {
  const firstName = currentUser.name.split(" ")[0];

  // Hour-of-day greeting (server-rendered at request time)
  const hour = new Date().getUTCHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div>
        <p className="dash-eyebrow mb-1">/ overview</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Here&apos;s what RF is tracking across your workspace today.
        </p>
      </div>

      {/* ── Quick actions ──────────────────────────────────────────────────── */}
      <QuickActionsRow actions={quickActions} />

      <Separator className="bg-[var(--border)]" />

      {/* ── Metric cards — 5 across, min 160px each ───────────────────────── */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {metricCards.map((card) => (
          <MetricCard key={card.id} card={card} />
        ))}
      </div>

      <Separator className="bg-[var(--border)]" />

      {/* ── Alerts (full-width, disappears when all dismissed) ─────────────── */}
      <AlertsPanel alerts={alerts} />

      {/* ── Main two-column grid ───────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

        {/* Left column: projects + insights feed */}
        <div className="space-y-8 min-w-0">
          <ActiveProjectsList projects={activeProjects} />
          <Separator className="bg-[var(--border)]" />
          <InsightsFeed insights={insights} />
        </div>

        {/* Right sidebar: Ask RF + Recent Messages */}
        <div className="space-y-6 min-w-0">
          <AskRFWidget />
          <RecentMessages messages={recentMessages} />
        </div>
      </div>
    </div>
  );
}
