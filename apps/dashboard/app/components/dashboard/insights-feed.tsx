"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Filter,
  CheckCircle,
  XCircle,
  PlusSquare,
  RefreshCw,
  Zap,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Insight, InsightType, InsightSeverity, InsightActionStatus } from "@/app/types/insight";
import { InsightModal } from "./insight-modal";

// ─── Config maps ──────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<InsightType, React.ElementType> = {
  RISK:        AlertTriangle,
  OPPORTUNITY: TrendingUp,
  ANOMALY:     AlertTriangle,
  SUMMARY:     FileText,
};

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  { chipBg: string; chipText: string; iconColor: string }
> = {
  CRITICAL: {
    chipBg:    "rgba(242,78,75,0.12)",
    chipText:  "var(--dash-status-error)",
    iconColor: "var(--dash-status-error)",
  },
  WARNING: {
    chipBg:    "rgba(250,204,21,0.12)",
    chipText:  "var(--dash-status-paused)",
    iconColor: "var(--dash-status-paused)",
  },
  INFO: {
    chipBg:    "rgba(96,165,250,0.12)",
    chipText:  "var(--dash-chart-secondary)",
    iconColor: "var(--dash-chart-secondary)",
  },
};

const SEVERITY_LABELS: Record<InsightSeverity, string> = {
  CRITICAL: "Critical",
  WARNING:  "Warning",
  INFO:     "Info",
};

const TYPE_LABELS: Record<InsightType, string> = {
  RISK:        "Risk",
  OPPORTUNITY: "Opportunity",
  ANOMALY:     "Anomaly",
  SUMMARY:     "Summary",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InsightsFeedProps {
  insights: Insight[];
  /** Whether to show the "Analyze now" button (only on the full AI Insights page) */
  showAnalyzeTrigger?: boolean;
  /** Called after a successful action so the parent can update its copy */
  onInsightUpdated?: (updated: Insight) => void;
  /** Called when user clicks "Analyze now" */
  onAnalyze?: () => void;
  analyzing?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InsightsFeed({
  insights: initialInsights,
  showAnalyzeTrigger = false,
  onInsightUpdated,
  onAnalyze,
  analyzing = false,
}: InsightsFeedProps) {
  const [items, setItems]               = useState<Insight[]>(initialInsights);
  const [selectedCategory, setCategory] = useState<string>("all");
  const [selectedPriority, setPriority] = useState<string>("all");
  const [selectedTimeframe, setTimeframe] = useState<string>("all");
  const [activeModal, setActiveModal]   = useState<Insight | null>(null);
  const [actionPending, setPending]     = useState<string | null>(null); // insightId being actioned

  // Keep local items in sync when parent refreshes
  useState(() => { setItems(initialInsights); });

  const filteredInsights = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== "all" && item.type !== selectedCategory) return false;
      if (selectedPriority !== "all" && item.severity !== selectedPriority) return false;
      if (selectedTimeframe === "today") {
        const hrs = (Date.now() - new Date(item.createdAt).getTime()) / 3_600_000;
        if (hrs > 24) return false;
      } else if (selectedTimeframe === "yesterday") {
        const hrs = (Date.now() - new Date(item.createdAt).getTime()) / 3_600_000;
        if (hrs < 24 || hrs > 48) return false;
      }
      return true;
    });
  }, [items, selectedCategory, selectedPriority, selectedTimeframe]);

  /**
   * Calls POST /api/insights/:id/action, replaces the item in local state
   * from the server response (not from the action value), and propagates
   * the update to the parent so dashboard counts stay in sync.
   */
  const handleInsightAction = useCallback(
    async (id: string, action: InsightActionStatus) => {
      setPending(id);
      try {
        const res = await fetch(`/api/insights/${id}/action`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ action }),
        });
        if (!res.ok) {
          console.error("insight action failed", res.status);
          return;
        }
        const data = (await res.json()) as { insight: Insight };
        const updated = data.insight;

        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));

        if (activeModal?.id === id) {
          setActiveModal(updated);
        }

        onInsightUpdated?.(updated);
      } finally {
        setPending(null);
      }
    },
    [activeModal, onInsightUpdated],
  );

  return (
    <section aria-labelledby="insights-heading">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="dash-eyebrow">/ ai insights</p>
          <h2
            id="insights-heading"
            className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]"
          >
            Recent findings ({filteredInsights.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {showAnalyzeTrigger && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <RefreshCw className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Zap className="size-3.5 text-[var(--accent)]" aria-hidden />
              )}
              {analyzing ? "Analyzing…" : "Analyze now"}
            </button>
          )}
          <Link
            href="/ai-insights"
            className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group"
          >
            All insights
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-3 flex items-center gap-2 flex-wrap border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mr-1">
          <Filter className="size-3.5" aria-hidden />
          <span>Filter by:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Categories</option>
          <option value="RISK">Risk</option>
          <option value="OPPORTUNITY">Opportunity</option>
          <option value="ANOMALY">Anomaly</option>
          <option value="SUMMARY">Summary</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>

        <select
          value={selectedTimeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
        </select>

        {(selectedCategory !== "all" || selectedPriority !== "all" || selectedTimeframe !== "all") && (
          <button
            onClick={() => { setCategory("all"); setPriority("all"); setTimeframe("all"); }}
            className="text-xs text-[var(--accent)] hover:underline ml-auto"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Feed */}
      {filteredInsights.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--text-muted)]">
          No AI insights match the selected filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredInsights.map((item) => {
            const Icon = TYPE_ICONS[item.type];
            const sev  = SEVERITY_CONFIG[item.severity];
            const isPending = actionPending === item.id;

            return (
              <article
                key={item.id}
                aria-label={item.title}
                onClick={() => !isPending && setActiveModal(item)}
                className={cn(
                  "group relative cursor-pointer rounded-lg border p-3.5 transition-all duration-150",
                  "hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]",
                  item.read
                    ? "border-[var(--border)] bg-[var(--surface)]"
                    : "border-[var(--border-strong)] bg-[var(--surface)] shadow-xs",
                  isPending && "opacity-60 pointer-events-none",
                )}
              >
                {/* Action status tag */}
                {item.actionStatus && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border)]">
                    {item.actionStatus === "ACCEPTED"     && <CheckCircle className="size-3 text-emerald-400" />}
                    {item.actionStatus === "DISMISSED"    && <XCircle     className="size-3 text-zinc-400"    />}
                    {item.actionStatus === "TASK_CREATED" && <PlusSquare  className="size-3 text-blue-400"    />}
                    <span className="capitalize">{item.actionStatus.toLowerCase().replace("_", " ")}</span>
                  </div>
                )}

                {/* Icon + title */}
                <div className="flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{ background: sev.chipBg }}
                  >
                    <Icon className="size-3.5" style={{ color: sev.iconColor }} />
                  </span>

                  <div className="flex-1 min-w-0 pr-16">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {!item.read && (
                        <span aria-label="Unread" className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      )}
                      <p className="truncate text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2.5 flex items-center justify-between gap-2 pl-[calc(1.75rem+0.625rem)]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide uppercase"
                      style={{ background: sev.chipBg, color: sev.chipText }}
                    >
                      {SEVERITY_LABELS[item.severity]}
                    </span>
                    <span className="rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide uppercase bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                      {TYPE_LABELS[item.type]}
                    </span>
                    {item.accountName && (
                      <span className="text-[10px] text-[var(--text-muted)]">· {item.accountName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {relativeTime(item.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveModal(item); }}
                      className="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      {item.ctaLabel} →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <InsightModal
        insight={activeModal}
        onClose={() => setActiveModal(null)}
        onAction={handleInsightAction}
        actionPending={actionPending}
      />
    </section>
  );
}
