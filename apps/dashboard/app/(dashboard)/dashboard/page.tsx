"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import type { DashboardData } from "@/app/types/dashboard";
import type { Insight }       from "@/app/types/insight";
import type { Project }       from "@/app/types/project";

import { DashboardHeader }    from "@/app/components/dashboard/DashboardHeader";
import { BentoChartsGrid }    from "@/app/components/dashboard/BentoChartsGrid";
import { AlertsPanel }        from "@/app/components/dashboard/alerts-panel";
import { Separator }          from "@/app/components/ui/separator";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-3.5 w-24 bg-[var(--surface-elevated)] rounded" />
        <div className="h-10 w-72 sm:w-96 bg-[var(--surface-elevated)] rounded-lg" />
        <div className="h-4 w-60 bg-[var(--surface-elevated)] rounded" />
      </div>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 lg:col-span-8 h-64 bg-[var(--surface-elevated)] rounded-xl border border-white/5" />
        <div className="md:col-span-5 lg:col-span-4 h-64 bg-[var(--surface-elevated)] rounded-xl border border-white/5" />
        <div className="md:col-span-12 lg:col-span-5 h-60 bg-[var(--surface-elevated)] rounded-xl border border-white/5" />
        <div className="md:col-span-6 lg:col-span-4 h-60 bg-[var(--surface-elevated)] rounded-xl border border-white/5" />
        <div className="md:col-span-6 lg:col-span-3 h-60 bg-[var(--surface-elevated)] rounded-xl border border-white/5" />
      </div>

      {/* Alerts skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-28 bg-[var(--surface-elevated)] rounded" />
        <div className="h-20 w-full bg-[var(--surface-elevated)] rounded-lg border border-white/5" />
        <div className="h-20 w-full bg-[var(--surface-elevated)] rounded-lg border border-white/5" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const refetching            = useRef(false);

  // ── Full fetch ──────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (refetching.current) return;
    refetching.current = true;
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((await res.json()) as DashboardData);
    } catch {
      // Keep stale data on refetch failure; blank only on first load
    } finally {
      refetching.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  // ── Reactive project event ──────────────────────────────────────────────────
  useEffect(() => {
    function onProjectCreated(e: Event) {
      const project = (e as CustomEvent<Project>).detail;
      setData((prev) => {
        if (!prev) return prev;
        const newProjects = [project, ...prev.projects].slice(0, 5);
        return { ...prev, projects: newProjects };
      });
      void fetchDashboard();
    }
    window.addEventListener("rf:project-created", onProjectCreated);
    return () => window.removeEventListener("rf:project-created", onProjectCreated);
  }, [fetchDashboard]);

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="mx-auto max-w-[1200px] flex items-center justify-center py-24 text-xs text-[var(--text-muted)] gap-2">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Unable to load dashboard. Please refresh.
      </div>
    );
  }

  // Active project count from metricCards or projects list
  const activeProjectsCount =
    data.metricCards.find((c) => c.id === "mc_projects")?.rawValue ??
    data.projects.filter((p) => p.status !== "COMPLETED").length;

  return (
    <div className="mx-auto max-w-[1200px] space-y-10">
      {/* 1. Header (Eyebrow, time-aware greeting, contextual line, insights pill, desktop date) */}
      <DashboardHeader
        userName={data.userName}
        activeProjectsCount={activeProjectsCount}
        alertsCount={data.alerts.length}
        unreadInsightCount={data.unreadInsightCount}
      />

      <Separator className="bg-[var(--border)]" />

      {/* 2. Bento Stats Grid (5 Cards: Active Projects, Acceptance Rate, AI Insights, Open Conversations, Team Members) */}
      <BentoChartsGrid data={data} />

      <Separator className="bg-[var(--border)]" />

      {/* 3. Alerts Section */}
      <AlertsPanel alerts={data.alerts} />
    </div>
  );
}
