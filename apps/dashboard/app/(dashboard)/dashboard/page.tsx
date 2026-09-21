"use client";

import { useDashboard } from "@/app/lib/use-dashboard";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { BentoChartsGrid } from "@/app/components/dashboard/BentoChartsGrid";
import { AlertsPanel } from "@/app/components/dashboard/alerts-panel";
import { Separator } from "@/app/components/ui/separator";

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
  const { data, isLoading, mutate } = useDashboard();

  if (isLoading && !data) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="mx-auto max-w-[1200px] flex flex-col items-center justify-center py-24 text-xs text-[var(--text-muted)] gap-3">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>Unable to reach dashboard data.</span>
        </div>
        <button
          type="button"
          onClick={() => void mutate()}
          className="px-3 py-1.5 rounded-md bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-primary)] border border-white/10 text-xs font-mono transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Active project count from metricCards or projects list
  const activeProjectsCount =
    data.metricCards?.find((c) => c.id === "mc_projects")?.rawValue ??
    data.projects?.filter((p) => p.status !== "COMPLETED").length ?? 0;

  return (
    <div className="mx-auto max-w-[1200px] space-y-10">
      {/* 1. Header */}
      <DashboardHeader
        userName={data.userName}
        activeProjectsCount={activeProjectsCount}
        alertsCount={data.alerts?.length ?? 0}
        unreadInsightCount={data.unreadInsightCount ?? 0}
      />

      <Separator className="bg-[var(--border)]" />

      {/* 2. Bento Stats Grid */}
      <BentoChartsGrid data={data} />

      <Separator className="bg-[var(--border)]" />

      {/* 3. Alerts Section */}
      <AlertsPanel alerts={data.alerts ?? []} />
    </div>
  );
}
