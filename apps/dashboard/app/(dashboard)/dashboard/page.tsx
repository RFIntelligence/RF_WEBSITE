"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import type { DashboardData } from "@/app/types/dashboard";
import type { Insight }       from "@/app/types/insight";
import type { Project }       from "@/app/types/project";

import { MetricCard }         from "@/app/components/dashboard/metric-card";
import { ActiveProjectsList } from "@/app/components/dashboard/active-projects-list";
import { InsightsFeed }       from "@/app/components/dashboard/insights-feed";
import { AlertsPanel }        from "@/app/components/dashboard/alerts-panel";
import { AskRFWidget }        from "@/app/components/dashboard/ask-rf-widget";
import { RecentMessages }     from "@/app/components/dashboard/recent-messages";
import { QuickActionsRow }    from "@/app/components/dashboard/quick-actions-row";
import { Separator }          from "@/app/components/ui/separator";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-[var(--surface-elevated)] rounded" />
        <div className="h-7 w-48 bg-[var(--surface-elevated)] rounded" />
        <div className="h-4 w-72 bg-[var(--surface-elevated)] rounded" />
      </div>
      <div className="h-12 w-full bg-[var(--surface-elevated)] rounded-xl" />
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-[var(--surface-elevated)] rounded-xl" />
        ))}
      </div>
      <div className="h-24 w-full bg-[var(--surface-elevated)] rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="h-64 bg-[var(--surface-elevated)] rounded-xl" />
          <div className="h-64 bg-[var(--surface-elevated)] rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="h-44 bg-[var(--surface-elevated)] rounded-xl" />
          <div className="h-48 bg-[var(--surface-elevated)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // Track in-flight refetch to avoid duplicate calls
  const refetching = useRef(false);

  // ── Full fetch ──────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (refetching.current) return;
    refetching.current = true;
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json() as DashboardData);
    } catch {
      // Keep stale data on refetch failure; only blank on first load
    } finally {
      refetching.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchDashboard(); }, [fetchDashboard]);

  // ── Insight actioned — update insight in place, then refetch metrics+alerts ─
  //
  // We have the server-authoritative updated insight from the action response,
  // so we splice it in immediately (zero-latency). Then we do a background
  // refetch so the metric cards and alerts recompute from the DB without
  // making the user wait.
  const handleInsightUpdated = useCallback((updated: Insight) => {
    setData((prev) => {
      if (!prev) return prev;
      const newInsights = prev.insights.map((i) =>
        i.id === updated.id ? updated : i,
      );
      const newUnread = newInsights.filter((i) => !i.read).length;
      return { ...prev, insights: newInsights, unreadInsightCount: newUnread };
    });
    // Background refetch: refreshes metric cards + alerts derived from the
    // new insight state without blocking the UI.
    void fetchDashboard();
  }, [fetchDashboard]);

  // ── Project created — prepend optimistic entry, background-refetch rest ─────
  //
  // The Projects page already handles its own optimistic UI; the dashboard
  // widget just needs to stay in sync. We listen via a CustomEvent dispatched
  // by the Projects page after a successful POST response.
  useEffect(() => {
    function onProjectCreated(e: Event) {
      const project = (e as CustomEvent<Project>).detail;
      setData((prev) => {
        if (!prev) return prev;
        // Prepend the new project, cap at 5 so the widget doesn't grow
        const newProjects = [project, ...prev.projects].slice(0, 5);
        return { ...prev, projects: newProjects };
      });
      // Background refetch to pick up updated metric cards (project count changed)
      void fetchDashboard();
    }
    window.addEventListener("rf:project-created", onProjectCreated);
    return () => window.removeEventListener("rf:project-created", onProjectCreated);
  }, [fetchDashboard]);

  // ── Greeting ─────────────────────────────────────────────────────────────────
  const hour = new Date().getUTCHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;

  // Graceful empty state if the fetch failed entirely on first load
  if (!data) {
    return (
      <div className="mx-auto max-w-[1200px] flex items-center justify-center py-24 text-xs text-[var(--text-muted)] gap-2">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Unable to load dashboard. Please refresh.
      </div>
    );
  }

  const firstName = data.userName.split(" ")[0];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">

      {/* ── Greeting ─────────────────────────────────────────────────────── */}
      <div>
        <p className="dash-eyebrow mb-1">/ overview</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Here&apos;s what RF is tracking across your workspace today.
          {data.unreadInsightCount > 0 && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {data.unreadInsightCount} new insight{data.unreadInsightCount !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* ── Quick actions (static nav — no DB data) ───────────────────── */}
      <QuickActionsRow />

      <Separator className="bg-[var(--border)]" />

      {/* ── Metric cards — 5 across, min 160 px each ─────────────────── */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {data.metricCards.map((card) => (
          <MetricCard key={card.id} card={card} />
        ))}
      </div>

      <Separator className="bg-[var(--border)]" />

      {/* ── Alerts — derived server-side from at-risk projects + insights ─ */}
      <AlertsPanel alerts={data.alerts} />

      {/* ── Main two-column grid ─────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

        {/* Left: active projects + insights feed */}
        <div className="space-y-8 min-w-0">
          <ActiveProjectsList projects={data.projects} />
          <Separator className="bg-[var(--border)]" />
          <InsightsFeed
            insights={data.insights}
            onInsightUpdated={handleInsightUpdated}
          />
        </div>

        {/* Right sidebar: Ask RF + recent conversations */}
        <div className="space-y-6 min-w-0">
          <AskRFWidget />
          <RecentMessages conversations={data.recentConversations} />
        </div>
      </div>
    </div>
  );
}
