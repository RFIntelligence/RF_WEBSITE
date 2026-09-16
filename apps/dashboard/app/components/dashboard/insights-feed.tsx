"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { InsightItem, InsightType, AlertSeverity } from "@/app/lib/mock-data";
import { InsightModal } from "./insight-modal";

// ─── Config maps ──────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<InsightType, React.ElementType> = {
  risk:        AlertTriangle,
  opportunity: TrendingUp,
  anomaly:     AlertTriangle,
  summary:     FileText,
};

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { chipBg: string; chipText: string; iconColor: string }
> = {
  critical: {
    chipBg:   "rgba(242,78,75,0.12)",
    chipText: "var(--dash-status-error)",
    iconColor:"var(--dash-status-error)",
  },
  warning: {
    chipBg:   "rgba(250,204,21,0.12)",
    chipText: "var(--dash-status-paused)",
    iconColor:"var(--dash-status-paused)",
  },
  info: {
    chipBg:   "rgba(96,165,250,0.12)",
    chipText: "var(--dash-chart-secondary)",
    iconColor:"var(--dash-chart-secondary)",
  },
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  warning:  "Warning",
  info:     "Info",
};

const TYPE_LABELS: Record<InsightType, string> = {
  risk:        "Risk",
  opportunity: "Opportunity",
  anomaly:     "Anomaly",
  summary:     "Summary",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface InsightsFeedProps {
  insights: InsightItem[];
}

export function InsightsFeed({ insights: initialInsights }: InsightsFeedProps) {
  const [items, setItems] = useState<InsightItem[]>(initialInsights);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");

  const [activeModalInsight, setActiveModalInsight] = useState<InsightItem | null>(null);

  // Filtered insights list
  const filteredInsights = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.type !== selectedCategory) {
        return false;
      }
      // Priority filter (severity)
      if (selectedPriority !== "all" && item.severity !== selectedPriority) {
        return false;
      }
      // Timeframe filter
      if (selectedTimeframe === "today") {
        const isToday = item.relativeTime.includes("min") || item.relativeTime.includes("hr");
        if (!isToday) return false;
      } else if (selectedTimeframe === "yesterday") {
        if (!item.relativeTime.toLowerCase().includes("yesterday")) return false;
      }
      return true;
    });
  }, [items, selectedCategory, selectedPriority, selectedTimeframe]);

  // Handle action buttons (Accept, Dismiss, Create task)
  const handleInsightAction = (
    id: string,
    status: "accepted" | "dismissed" | "task_created"
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, read: true } : item
      )
    );
    if (activeModalInsight?.id === id) {
      setActiveModalInsight((prev) => (prev ? { ...prev, status, read: true } : null));
    }
  };

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

      {/* Filter Controls Row */}
      <div className="mb-3 flex items-center gap-2 flex-wrap border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mr-1">
          <Filter className="size-3.5" />
          <span>Filter by:</span>
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Categories</option>
          <option value="risk">Risk</option>
          <option value="opportunity">Opportunity</option>
          <option value="anomaly">Anomaly</option>
          <option value="summary">Summary</option>
        </select>

        {/* Priority filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        {/* Date / Timeframe filter */}
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
        </select>

        {(selectedCategory !== "all" ||
          selectedPriority !== "all" ||
          selectedTimeframe !== "all") && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedPriority("all");
              setSelectedTimeframe("all");
            }}
            className="text-xs text-[var(--accent)] hover:underline ml-auto"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* List Feed */}
      {filteredInsights.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--text-muted)]">
          No AI insights match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredInsights.map((item) => {
            const Icon  = TYPE_ICONS[item.type];
            const sev   = SEVERITY_CONFIG[item.severity];

            return (
              <article
                key={item.id}
                aria-label={item.title}
                onClick={() => setActiveModalInsight(item)}
                className={cn(
                  "group relative cursor-pointer rounded-lg border p-3.5 transition-all duration-150",
                  "hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]",
                  item.read
                    ? "border-[var(--border)] bg-[var(--surface)]"
                    : "border-[var(--border-strong)] bg-[var(--surface)] shadow-xs",
                )}
              >
                {/* Status indicator tag if acted upon */}
                {item.status && item.status !== "active" && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border)]">
                    {item.status === "accepted" && <CheckCircle className="size-3 text-emerald-400" />}
                    {item.status === "dismissed" && <XCircle className="size-3 text-zinc-400" />}
                    {item.status === "task_created" && <PlusSquare className="size-3 text-blue-400" />}
                    <span className="capitalize">{item.status.replace("_", " ")}</span>
                  </div>
                )}

                {/* Top: icon chip + title + unread dot */}
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
                        <span
                          aria-label="Unread"
                          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                        />
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

                {/* Footer: tags + time + CTA */}
                <div className="mt-2.5 flex items-center justify-between gap-2 pl-[calc(1.75rem+0.625rem)]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Severity chip */}
                    <span
                      className="rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide uppercase"
                      style={{ background: sev.chipBg, color: sev.chipText }}
                    >
                      {SEVERITY_LABELS[item.severity]}
                    </span>
                    {/* Type chip */}
                    <span className="rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide uppercase bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                      {TYPE_LABELS[item.type]}
                    </span>
                    {item.accountName && (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        · {item.accountName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {item.relativeTime}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalInsight(item);
                      }}
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

      {/* Slide-over / Modal Detail View */}
      <InsightModal
        insight={activeModalInsight}
        onClose={() => setActiveModalInsight(null)}
        onAction={handleInsightAction}
      />
    </section>
  );
}

