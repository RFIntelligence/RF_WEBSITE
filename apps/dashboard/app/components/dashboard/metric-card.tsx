import {
  FolderKanban,
  MessagesSquare,
  Sparkles,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { MetricCardData } from "@/app/lib/mock-data";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  "folder-kanban":  FolderKanban,
  "messages-square": MessagesSquare,
  "sparkles":       Sparkles,
  "users":          Users,
  "trending-up":    TrendingUp,
} as const;

// ─── Chip colour map → CSS var tokens ────────────────────────────────────────
// Each entry: [chip bg, icon colour]

const CHIP_COLORS: Record<MetricCardData["chipColor"], [string, string]> = {
  red:    ["rgba(242,78,75,0.12)",   "var(--accent)"],
  blue:   ["rgba(96,165,250,0.12)",  "var(--dash-chart-secondary)"],
  green:  ["rgba(74,222,128,0.12)",  "var(--dash-status-running)"],
  amber:  ["rgba(250,204,21,0.12)",  "var(--dash-status-paused)"],
  violet: ["rgba(167,139,250,0.12)", "var(--dash-chart-tertiary)"],
};

// ─── Component ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  card: MetricCardData;
}

export function MetricCard({ card }: MetricCardProps) {
  const Icon = ICON_MAP[card.iconKey];
  const [chipBg, iconColor] = CHIP_COLORS[card.chipColor];

  const TrendIcon =
    card.trend === "up"   ? TrendingUp   :
    card.trend === "down" ? TrendingDown :
    Minus;

  const trendColor =
    card.trend === "up"   ? "var(--dash-status-running)"  :
    card.trend === "down" ? "var(--dash-status-error)"    :
    "var(--text-muted)";

  return (
    <article
      aria-label={`${card.label}: ${card.value}`}
      className={cn(
        "group relative rounded-xl border border-[var(--border)] bg-[var(--surface)]",
        "p-5 overflow-hidden transition-all duration-200",
        "hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]",
      )}
    >
      {/* Subtle hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at top right, ${chipBg} 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex flex-col gap-3">
        {/* Header row: label + icon chip */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
            {card.label}
          </span>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
            style={{ background: chipBg }}
          >
            <Icon className="size-[15px]" style={{ color: iconColor }} />
          </span>
        </div>

        {/* Value */}
        <p className="text-[2rem] font-bold leading-none tracking-tight text-[var(--text-primary)]">
          {card.value}
        </p>

        {/* Delta + period */}
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: trendColor }}
          >
            <TrendIcon aria-hidden className="size-3.5" />
            {card.delta}
          </span>
          <span className="text-xs text-[var(--text-muted)]">{card.period}</span>
        </div>
      </div>
    </article>
  );
}
