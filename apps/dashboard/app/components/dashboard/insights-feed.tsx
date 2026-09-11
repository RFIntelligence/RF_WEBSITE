import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { InsightItem, InsightType, AlertSeverity } from "@/app/lib/mock-data";

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

export function InsightsFeed({ insights }: InsightsFeedProps) {
  return (
    <section aria-labelledby="insights-heading">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="dash-eyebrow">/ ai insights</p>
          <h2
            id="insights-heading"
            className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]"
          >
            Recent findings
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

      <div className="space-y-2">
        {insights.map((item) => {
          const Icon  = TYPE_ICONS[item.type];
          const sev   = SEVERITY_CONFIG[item.severity];

          return (
            <article
              key={item.id}
              aria-label={item.title}
              className={cn(
                "rounded-lg border p-3.5 transition-colors",
                "hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]",
                item.read
                  ? "border-[var(--border)] bg-[var(--surface)]"
                  : "border-[var(--border-strong)] bg-[var(--surface)]",
              )}
            >
              {/* Top: icon chip + title + unread dot */}
              <div className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{ background: sev.chipBg }}
                >
                  <Icon className="size-3.5" style={{ color: sev.iconColor }} />
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {!item.read && (
                      <span
                        aria-label="Unread"
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                      />
                    )}
                    <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
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
                  <Link
                    href={item.ctaHref}
                    className="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    {item.ctaLabel} →
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
