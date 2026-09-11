"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import type { AlertItem, AlertSeverity } from "@/app/lib/mock-data";

// ─── Config ───────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    Icon:       React.ElementType;
    borderColor: string;
    bgColor:    string;
    iconColor:  string;
    label:      string;
  }
> = {
  critical: {
    Icon:        AlertTriangle,
    borderColor: "rgba(242,78,75,0.35)",
    bgColor:     "rgba(242,78,75,0.06)",
    iconColor:   "var(--dash-status-error)",
    label:       "Critical",
  },
  warning: {
    Icon:        AlertCircle,
    borderColor: "rgba(250,204,21,0.35)",
    bgColor:     "rgba(250,204,21,0.06)",
    iconColor:   "var(--dash-status-paused)",
    label:       "Warning",
  },
  info: {
    Icon:        Info,
    borderColor: "rgba(96,165,250,0.35)",
    bgColor:     "rgba(96,165,250,0.06)",
    iconColor:   "var(--dash-chart-secondary)",
    label:       "Info",
  },
};

// ─── Single alert row ─────────────────────────────────────────────────────────

function AlertRow({
  alert,
  onDismiss,
}: {
  alert: AlertItem;
  onDismiss: (id: string) => void;
}) {
  const cfg = SEVERITY_CONFIG[alert.severity];
  const { Icon } = cfg;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border p-3.5 transition-colors"
      style={{ borderColor: cfg.borderColor, background: cfg.bgColor }}
    >
      {/* Icon */}
      <Icon
        aria-hidden
        className="mt-0.5 size-4 shrink-0"
        style={{ color: cfg.iconColor }}
      />

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide uppercase"
            style={{
              background: `${cfg.iconColor}22`,
              color: cfg.iconColor,
            }}
          >
            {cfg.label}
          </span>
          <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
            {alert.title}
          </p>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {alert.body}
        </p>
        <Link
          href={alert.ctaHref}
          className="mt-1.5 inline-block text-xs font-medium transition-colors"
          style={{ color: cfg.iconColor }}
        >
          {alert.ctaLabel} →
        </Link>
      </div>

      {/* Dismiss */}
      {alert.dismissible && (
        <button
          type="button"
          aria-label={`Dismiss alert: ${alert.title}`}
          onClick={() => onDismiss(alert.id)}
          className="shrink-0 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface AlertsPanelProps {
  alerts: AlertItem[];
}

export function AlertsPanel({ alerts: initialAlerts }: AlertsPanelProps) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const visible = initialAlerts.filter((a) => !dismissed.has(a.id));

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="alerts-heading">
      <div className="mb-3">
        <p className="dash-eyebrow">/ alerts</p>
        <h2
          id="alerts-heading"
          className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]"
        >
          {visible.length} item{visible.length !== 1 ? "s" : ""} need attention
        </h2>
      </div>

      <div className="space-y-2">
        {visible.map((alert) => (
          <AlertRow key={alert.id} alert={alert} onDismiss={dismiss} />
        ))}
      </div>
    </section>
  );
}
