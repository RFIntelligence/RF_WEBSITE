"use client";

/**
 * BentoCard — fake app-window bento card.
 *
 * Refactored from the original single-config demo into a configurable
 * component: pass an eyebrow, heading and a set of tabs (each with its
 * own panel) so multiple instances can exist on one page.
 *
 * Themed to RF Intelligence design tokens (dark surface, red accent)
 * instead of shadcn neutral light tokens.
 */

import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CircleArrowUpRight02Icon,
  Search01Icon,
  Settings02Icon,
  InformationCircleIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface BentoTab {
  id: string;
  label: string;
  icon: IconSvgElement;
  badge?: string;
  header: string;
  description: string;
  panel: React.ReactNode;
}

export interface BentoCardProps {
  eyebrow: string;
  heading: string;
  windowLabel?: string;
  tabs: BentoTab[];
}

type IconType = IconSvgElement;

/* ── Card ─────────────────────────────────────────────────────────────────── */

const BentoCard = ({
  eyebrow,
  heading,
  windowLabel = "RF Intelligence",
  tabs,
}: BentoCardProps) => {
  const [activeTab, setActiveTab] = useState<BentoTab>(tabs[0]);

  return (
    <div className="flex items-center justify-center w-full antialiased">
      <div className="group relative w-full max-w-xl overflow-hidden rounded-3xl sm:rounded-4xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] shadow-2xl shadow-black/40 transition-all duration-500 hover:shadow-black/60 hover:-translate-y-1 m-0">
        <div className="p-4 sm:p-6 space-y-1.5 z-10 relative">
          <h2
            className="text-xs uppercase"
            style={{ color: "var(--accent)" }}
          >
            {eyebrow}
          </h2>
          <p
            className="text-lg sm:text-2xl font-medium leading-snug max-w-[480px]"
            style={{ color: "var(--text-primary)" }}
          >
            {heading}
          </p>
        </div>

        <div className="relative w-full h-[260px] sm:h-[300px] overflow-hidden rounded-2xl sm:rounded-[2rem]">
          {/* stacked-sheet backdrop */}
          <div className="absolute top-16 left-16 w-full h-full bg-[var(--surface)] rounded-3xl border border-[var(--border)] opacity-80" />

          <div className="absolute top-8 left-24 w-full h-full bg-[var(--surface-elevated)] rounded-tl-3xl shadow-xl flex flex-col overflow-hidden ring-6 ring-[var(--border)]">
            {/* title bar */}
            <div className="px-5 py-4 rounded-tl-3xl border-b border-[var(--border)] flex items-center relative backdrop-blur-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[rgba(245,245,240,0.2)]" />
                <div className="w-2 h-2 rounded-full bg-[rgba(245,245,240,0.2)]" />
                <div className="w-2 h-2 rounded-full bg-[rgba(245,245,240,0.2)]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span
                  className="text-xs uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {windowLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* sidebar tabs */}
              <div className="w-36 border-r border-[var(--border)] p-2 flex flex-col gap-1 pt-6 bg-[var(--surface)]">
                <LayoutGroup>
                  {tabs.map((tab) => {
                    const isActive = activeTab.id === tab.id;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        suppressHydrationWarning
                        className={cn(
                          "relative flex items-center gap-1.5 p-2 rounded-xl text-xs transition-colors cursor-pointer",
                          isActive ? "" : "hover:text-[var(--text-primary)]",
                        )}
                        style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
                      >
                        <HugeiconsIcon
                          icon={Icon}
                          size={14}
                          className="z-20 shrink-0 relative"
                        />
                        <span className="truncate z-20 relative font-medium">
                          {tab.label}
                        </span>
                        {tab.badge && (
                          <span
                            className={cn(
                              "ml-auto text-[8px] leading-none py-0.5 px-1 rounded-md tabular-nums transition-all z-20 relative border",
                              isActive
                                ? "bg-[rgba(242,78,75,0.12)] border-[rgba(242,78,75,0.3)]"
                                : "bg-[var(--surface-elevated)] border-transparent",
                            )}
                            style={{
                              color: isActive ? "var(--accent)" : "var(--text-muted)",
                            }}
                          >
                            {tab.badge}
                          </span>
                        )}

                        {isActive && (
                          <motion.div
                            layoutId={`sidebar-pill-${eyebrow}`}
                            className="absolute left-0 w-[2px] h-4 rounded-full bg-[var(--accent)] z-30"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId={`backgroundIndicator-${eyebrow}`}
                            className="absolute inset-0 rounded-lg bg-[rgba(245,245,240,0.06)] border border-[var(--border-strong)]"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </LayoutGroup>
              </div>

              {/* content panel */}
              <div className="flex-1 bg-[var(--surface-elevated)] p-5 pt-6 flex flex-col gap-4 overflow-hidden relative">
                <header className="flex flex-col gap-0.5">
                  <h3
                    className="text-xs font-semibold tracking-tight line-clamp-1 uppercase opacity-60"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {activeTab.header}
                  </h3>
                  <p
                    className="text-[10px] font-normal leading-tight line-clamp-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {activeTab.description}
                  </p>
                </header>

                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="flex-1"
                  >
                    {activeTab.panel}
                  </motion.div>
                </AnimatePresence>

                <div
                  className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-20"
                  style={{
                    background:
                      "linear-gradient(to top, var(--surface-elevated), transparent)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoCard;

/* ─────────────────────────────────────────────────────────────────────────────
   Reusable mini panels — parameterised building blocks for service content
   ───────────────────────────────────────────────────────────────────────────── */

interface BentoStatPanelProps {
  statLabel: string;
  statValue: string;
  /** Optional — omit when no verified metric exists (bar is hidden). */
  statProgress?: number;
  statSub: string;
  watermarkIcon: IconType;
  chips: { value: string; label: string; icon: IconType }[];
}

export function BentoStatPanel({
  statLabel,
  statValue,
  statProgress,
  statSub,
  watermarkIcon,
  chips,
}: BentoStatPanelProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div
        className="relative p-3.5 rounded-xl border border-[var(--border)] overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom right, var(--surface), rgba(242,78,75,0.05))",
        }}
      >
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {statLabel}
            </span>
            <HugeiconsIcon
              icon={CircleArrowUpRight02Icon}
              size={12}
              className="text-[var(--accent)]"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-xl font-medium tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {statValue}
            </span>
            {statProgress !== undefined && (
              <div
                className="w-full h-1 rounded-full overflow-hidden mt-1"
                style={{ background: "var(--surface)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${statProgress}%` }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full bg-[var(--accent)] rounded-full"
                />
              </div>
            )}
          </div>
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            {statSub}
          </span>
        </div>
        <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 text-[var(--text-primary)]">
          <HugeiconsIcon icon={watermarkIcon} size={64} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span
                className="text-[10px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {chip.value}
              </span>
              <span
                className="text-[8px] uppercase font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {chip.label}
              </span>
            </div>
            <HugeiconsIcon icon={chip.icon} size={14} className="opacity-20 text-[var(--text-primary)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface BentoListRow {
  name: string;
  role: string;
  status: string;
  color: string;
}

interface BentoListPanelProps {
  listTitle: string;
  rows: BentoListRow[];
}

export function BentoListPanel({ listTitle, rows }: BentoListPanelProps) {
  return (
    <div className="flex flex-col h-full not-prose">
      <div className="rounded-xl border border-[var(--border)] overflow-hidden flex flex-col h-full bg-[var(--surface)]">
        <div
          className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between"
          style={{ background: "rgba(245,245,240,0.03)" }}
        >
          <span
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {listTitle}
          </span>
          <div
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border border-[var(--border)]"
            style={{ background: "var(--surface-elevated)" }}
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={10}
              className="opacity-50 text-[var(--text-primary)]"
            />
            <span
              className="text-[8px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Filter
            </span>
          </div>
        </div>
        <div className="p-1 flex flex-col gap-0.5">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(245,245,240,0.04)] transition-colors group"
            >
              <div
                className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center relative shrink-0"
                style={{ background: "var(--surface-elevated)" }}
              >
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {i + 1}
                </span>
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[var(--surface-elevated)]",
                    row.color,
                  )}
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-[10px] font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {row.name}
                </span>
                <span
                  className="text-[8px] truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {row.role}
                </span>
              </div>
              <span
                className="text-[8px] uppercase font-medium tracking-wide shrink-0"
                style={{ color: "var(--text-secondary)" }}
              >
                {row.status}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <HugeiconsIcon
                  icon={Settings02Icon}
                  size={12}
                  className="text-[var(--text-muted)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface BentoRowsPanelProps {
  rowsTitle: string;
  rows: { title: string; meta: string; tag: string; icon: IconType }[];
}

export function BentoRowsPanel({ rowsTitle, rows }: BentoRowsPanelProps) {
  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <div className="flex-1 rounded-xl border border-[var(--border)] flex flex-col bg-[var(--surface)] overflow-hidden">
        <div
          className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between"
          style={{ background: "rgba(245,245,240,0.03)" }}
        >
          <span
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {rowsTitle}
          </span>
        </div>
        <div className="flex-1 p-1 overflow-y-auto scrollbar-hide">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[rgba(245,245,240,0.04)] transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-md border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:bg-[rgba(242,78,75,0.08)] transition-colors shrink-0"
                style={{ background: "var(--surface-elevated)" }}
              >
                <HugeiconsIcon icon={row.icon} size={12} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-[10px] font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {row.title}
                </span>
                <span
                  className="text-[8px] tabular-nums uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {row.meta} • {row.tag}
                </span>
              </div>
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={10}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface BentoActionsPanelProps {
  actions: { title: string; desc: string; icon: IconType }[];
  footerNote: string;
}

export function BentoActionsPanel({
  actions,
  footerNote,
}: BentoActionsPanelProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((card, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-3 relative overflow-hidden group"
          >
            <div className="flex flex-col gap-1 z-10">
              <span
                className="text-[12px] font-medium leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {card.title}
              </span>
              <span
                className="text-[9px] leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                {card.desc}
              </span>
            </div>
            <button className="w-fit flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-semibold transition-transform active:scale-95 z-10 cursor-pointer"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              <HugeiconsIcon icon={Add01Icon} size={8} strokeWidth={3} />
              Create
            </button>
            <div className="absolute -right-1 -bottom-1 opacity-10 scale-125 text-[var(--text-primary)]">
              <HugeiconsIcon icon={card.icon} size={40} />
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-auto p-3 rounded-xl border border-[var(--border)] flex items-center justify-between"
        style={{ background: "rgba(245,245,240,0.03)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="p-1 px-1.5 rounded-md border border-[var(--border)]"
            style={{ background: "var(--surface-elevated)" }}
          >
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={10}
              className="text-[var(--text-muted)]"
            />
          </div>
          <span
            className="text-[9px] font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {footerNote}
          </span>
        </div>
        <HugeiconsIcon
          icon={Add01Icon}
          size={12}
          className="opacity-50 text-[var(--text-primary)]"
        />
      </div>
    </div>
  );
}
