"use client";

import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileText,
  X,
  CheckCircle,
  XCircle,
  PlusSquare,
  Building2,
  Calendar,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { InsightItem, AlertSeverity } from "@/app/lib/mock-data";

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { chipBg: string; chipText: string; border: string }
> = {
  critical: {
    chipBg: "rgba(242,78,75,0.12)",
    chipText: "var(--dash-status-error)",
    border: "rgba(242,78,75,0.3)",
  },
  warning: {
    chipBg: "rgba(250,204,21,0.12)",
    chipText: "var(--dash-status-paused)",
    border: "rgba(250,204,21,0.3)",
  },
  info: {
    chipBg: "rgba(96,165,250,0.12)",
    chipText: "var(--dash-chart-secondary)",
    border: "rgba(96,165,250,0.3)",
  },
};

interface InsightModalProps {
  insight: InsightItem | null;
  onClose: () => void;
  onAction: (id: string, status: "accepted" | "dismissed" | "task_created") => void;
}

export function InsightModal({ insight, onClose, onAction }: InsightModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "chart">("overview");

  if (!insight) return null;

  const sev = SEVERITY_CONFIG[insight.severity];
  const detail = insight.detail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] p-5 pb-4">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: sev.chipBg }}
            >
              {insight.type === "risk" || insight.type === "anomaly" ? (
                <AlertTriangle className="size-5" style={{ color: sev.chipText }} />
              ) : insight.type === "opportunity" ? (
                <TrendingUp className="size-5" style={{ color: sev.chipText }} />
              ) : (
                <FileText className="size-5" style={{ color: sev.chipText }} />
              )}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="rounded-xs px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider"
                  style={{ background: sev.chipBg, color: sev.chipText }}
                >
                  {insight.severity}
                </span>
                <span className="rounded-xs px-2 py-0.5 text-[10px] font-mono uppercase bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                  {insight.type}
                </span>
                {insight.accountName && (
                  <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Building2 className="size-3" />
                    {insight.accountName}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Calendar className="size-3" />
                  {insight.relativeTime}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                {insight.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Status banner if acted upon */}
        {insight.status && insight.status !== "active" && (
          <div
            className={`px-5 py-2 text-xs font-medium flex items-center gap-2 ${
              insight.status === "accepted"
                ? "bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20"
                : insight.status === "dismissed"
                ? "bg-zinc-500/10 text-zinc-400 border-b border-zinc-500/20"
                : "bg-blue-500/10 text-blue-400 border-b border-blue-500/20"
            }`}
          >
            {insight.status === "accepted" && <CheckCircle className="size-4" />}
            {insight.status === "dismissed" && <XCircle className="size-4" />}
            {insight.status === "task_created" && <PlusSquare className="size-4" />}
            Status: {insight.status.replace("_", " ").toUpperCase()}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: What Happened & Why RF Detected It */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <AlertCircle className="size-4 text-[var(--accent)]" />
                What Happened
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {detail.whatHappened}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Sparkles className="size-4 text-violet-400" />
                Why RF Detected It
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {detail.whyDetected}
              </p>
            </div>
          </div>

          {/* Section 2: Recharts visualization */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                {detail.chartTitle}
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                Supporting Data
              </span>
            </div>

            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {detail.chartType === "bar" ? (
                  <BarChart data={detail.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Value" />
                    {detail.chartData[0]?.benchmark !== undefined && (
                      <Bar dataKey="benchmark" fill="#52525b" radius={[4, 4, 0, 0]} name="Threshold" />
                    )}
                  </BarChart>
                ) : detail.chartType === "line" ? (
                  <LineChart data={detail.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    {detail.chartData[0]?.benchmark !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#71717a"
                        strokeDasharray="4 4"
                      />
                    )}
                  </LineChart>
                ) : (
                  <AreaChart data={detail.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f43f5e"
                      fill="rgba(244, 63, 94, 0.15)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Business Impact & Recommended Action */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-1.5">
              <div className="text-xs font-semibold text-amber-400">
                Business Impact
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {detail.businessImpact}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Lightbulb className="size-4" />
                Recommended Action
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {detail.recommendedAction}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] p-4 bg-[var(--surface-elevated)]/40">
          <button
            onClick={() => onAction(insight.id, "dismissed")}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-rose-400 transition-colors"
          >
            <XCircle className="size-4" />
            Dismiss
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction(insight.id, "task_created")}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
            >
              <PlusSquare className="size-4 text-blue-400" />
              Create Task
            </button>
            <button
              onClick={() => onAction(insight.id, "accepted")}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
            >
              <CheckCircle className="size-4" />
              Accept Recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
