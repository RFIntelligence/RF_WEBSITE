"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, ChevronDown, ChevronUp, History, Activity } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { ActiveProject, StatusLevel } from "@/app/lib/mock-data";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  StatusLevel,
  { label: string; dotColor: string; textColor: string; barColor: string }
> = {
  on_track:  {
    label:     "On track",
    dotColor:  "var(--dash-status-running)",
    textColor: "var(--dash-status-running)",
    barColor:  "var(--dash-status-running)",
  },
  at_risk:   {
    label:     "At risk",
    dotColor:  "var(--dash-status-paused)",
    textColor: "var(--dash-status-paused)",
    barColor:  "var(--dash-status-paused)",
  },
  blocked:   {
    label:     "Blocked",
    dotColor:  "var(--dash-status-error)",
    textColor: "var(--dash-status-error)",
    barColor:  "var(--dash-status-error)",
  },
  completed: {
    label:     "Completed",
    dotColor:  "var(--dash-status-completed)",
    textColor: "var(--text-muted)",
    barColor:  "var(--dash-status-completed)",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  const now  = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff <= 7)  return `${diff}d left`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isDueSoon(iso: string): boolean {
  const diff = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ActiveProjectsListProps {
  projects: ActiveProject[];
}

export function ActiveProjectsList({ projects }: ActiveProjectsListProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  return (
    <section aria-labelledby="active-projects-heading">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="dash-eyebrow">/ active projects</p>
          <h2
            id="active-projects-heading"
            className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]"
          >
            {projects.length} in progress
          </h2>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group"
        >
          View all
          <ArrowUpRight
            aria-hidden
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      <div className="space-y-2">
        {projects.map((project) => {
          const cfg      = STATUS_CONFIG[project.status];
          const dueSoon  = isDueSoon(project.dueDate);
          const dueLabel = formatDueDate(project.dueDate);
          const isExpanded = expandedProjectId === project.id;

          return (
            <div
              key={project.id}
              className={cn(
                "group rounded-lg border transition-all duration-200 overflow-hidden",
                isExpanded
                  ? "border-[var(--border-strong)] bg-[var(--surface-elevated)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
              )}
            >
              {/* Main row card content */}
              <div
                onClick={() => toggleExpand(project.id)}
                className="p-3.5 cursor-pointer select-none"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Toggle activity history"
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                    <div>
                      <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                        {project.name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {project.accountName}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className="flex shrink-0 items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide uppercase"
                    style={{
                      background: `${cfg.dotColor}18`,
                      color: cfg.textColor,
                    }}
                  >
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: cfg.dotColor }}
                    />
                    {cfg.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-2.5">
                  <div
                    role="progressbar"
                    aria-valuenow={project.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${project.name} progress`}
                    className="h-1 w-full rounded-full bg-[var(--surface-elevated)]"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.progress}%`,
                        background: cfg.barColor,
                      }}
                    />
                  </div>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between gap-2">
                  {/* Owner avatar + name */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold font-mono"
                      style={{
                        background: "var(--surface-elevated)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {project.ownerInitials}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {project.ownerName}
                    </span>
                  </div>

                  {/* Due date + task count + Expand hint */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {project.openTasks} task{project.openTasks !== 1 ? "s" : ""}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-[11px]",
                        dueSoon && project.status !== "completed"
                          ? "text-[var(--dash-status-paused)]"
                          : "text-[var(--text-muted)]"
                      )}
                    >
                      <CalendarClock aria-hidden className="size-3" />
                      {dueLabel}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                      <History className="size-3" />
                      {project.activities?.length || 0} activities
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Activity History Drawer */}
              {isExpanded && (
                <div className="border-t border-[var(--border)] bg-[var(--surface)]/50 p-4 space-y-3 animate-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Activity className="size-3.5 text-[var(--accent)]" />
                      Activity History
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Latest Updates
                    </span>
                  </div>

                  {project.activities && project.activities.length > 0 ? (
                    <div className="space-y-2 relative pl-2 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
                      {project.activities.map((act) => (
                        <div key={act.id} className="relative pl-6 text-xs space-y-0.5">
                          <div className="absolute left-0 top-1 size-3 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] flex items-center justify-center">
                            <span className="size-1 rounded-full bg-[var(--accent)]" />
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-[var(--text-primary)]">
                              {act.author} ({act.authorInitials})
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              {act.timestamp}
                            </span>
                          </div>
                          <p className="text-[var(--text-secondary)]">{act.action}</p>
                          {act.details && (
                            <p className="text-[11px] text-[var(--text-muted)] bg-[var(--surface-elevated)] p-1.5 rounded-md mt-1 border border-[var(--border)]">
                              {act.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      No recent activity recorded for this project.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

