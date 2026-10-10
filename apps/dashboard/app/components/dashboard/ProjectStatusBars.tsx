"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { StatCard } from "./StatCard";
import type { ProjectStatusCounts } from "@/app/lib/dashboard-mock";
import type { Project } from "@/app/types/project";
import { cn } from "@/app/lib/utils";

interface ProjectStatusBarsProps {
  counts: ProjectStatusCounts;
  delta: string;
  deltaValue: number;
  period: string;
  projects?: Project[];
}

interface StatusItem {
  id: string;
  label: string;
  value: number;
  color: string;
  dotColor: string;
  statusKey: string;
}

export function ProjectStatusBars({
  counts,
  delta,
  deltaValue,
  period,
  projects,
}: ProjectStatusBarsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const items: StatusItem[] = [
    {
      id: "on_track",
      label: "ON TRACK",
      value: counts.onTrack,
      color: "bg-green-500",
      dotColor: "#22c55e",
      statusKey: "ON_TRACK",
    },
    {
      id: "at_risk",
      label: "AT RISK",
      value: counts.atRisk,
      color: "bg-yellow-500",
      dotColor: "#eab308",
      statusKey: "AT_RISK",
    },
    {
      id: "blocked",
      label: "BLOCKED",
      value: counts.blocked,
      color: "bg-[var(--accent)]",
      dotColor: "var(--accent)",
      statusKey: "BLOCKED",
    },
    {
      id: "completed",
      label: "COMPLETED",
      value: counts.completed,
      color: "bg-blue-500",
      dotColor: "#3b82f6",
      statusKey: "COMPLETED",
    },
  ];

  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const total = counts.total;

  return (
    <StatCard
      title="Active Projects"
      titleHref="/projects"
      value={total}
      delta={delta}
      deltaValue={deltaValue}
      period={period}
    >
      <div
        role="region"
        aria-label={`Active projects by status: ${items.map((i) => `${i.label} ${i.value}`).join(", ")}`}
        className="w-full flex flex-col justify-between h-full pt-2"
      >
        {/* Bars row */}
        <div className="flex items-end justify-between gap-3 sm:gap-6 flex-1 min-h-[120px] pb-2">
          {items.map((item, i) => {
            const heightPercent = Math.max(12, Math.round((item.value / maxValue) * 100));
            const isHovered = hovered === i;
            const isDimmed = hovered !== null && !isHovered;

            return (
              <Link
                key={item.id}
                href={`/projects?status=${item.statusKey}`}
                className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`${item.label}: ${item.value} active projects. View filtered projects`}
              >
                {/* Tooltip on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white px-2.5 py-1 text-xs font-mono font-bold whitespace-nowrap border border-white/30 z-30 pointer-events-none rounded shadow-md"
                    >
                      {item.label}: {item.value} (view list)
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Animated Brutalist Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${heightPercent}%`,
                    opacity: isDimmed ? 0.35 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 24,
                    delay: i * 0.05,
                  }}
                  whileHover={{ scaleY: 1.05 }}
                  className={cn(
                    "w-full border-2 border-black dark:border-white/40 relative z-10 origin-bottom flex items-center justify-center rounded-t-md overflow-hidden",
                    item.color
                  )}
                >
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
                  <span className="relative z-20 font-mono font-bold text-xs text-black">
                    {item.value}
                  </span>
                </motion.div>

                {/* Bottom Label */}
                <span className="mt-2 text-[10px] font-mono tracking-wider font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Individual recent project entries */}
        {projects && projects.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0 mr-1">Recent:</span>
            {projects.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                href={`/projects?id=${p.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/10 hover:border-white/20 transition-all shrink-0 max-w-[140px] group/item focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                title={`Open project: ${p.name}`}
              >
                <span className="truncate">{p.name}</span>
                <ArrowUpRight className="size-2.5 opacity-50 group-hover/item:opacity-100 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </StatCard>
  );
}
