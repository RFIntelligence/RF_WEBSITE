"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { StatCard } from "./StatCard";
import type { TeamRoleCounts } from "@/app/lib/dashboard-mock";
import { cn } from "@/app/lib/utils";

interface TeamRoleDonutProps {
  roles: TeamRoleCounts;
  delta: string;
  deltaValue: number;
  period: string;
}

const springConfig = { type: "spring", stiffness: 240, damping: 22 } as const;

export function TeamRoleDonut({
  roles,
  delta,
  deltaValue,
  period,
}: TeamRoleDonutProps) {
  const [hoveredSlice, setHoveredSlice] = React.useState<string | null>(null);

  const total = roles.total || 1;

  const rawSlices = [
    { label: "Admin", count: roles.admin, color: "#f59e0b" }, // amber
    { label: "Member", count: roles.member, color: "#60a5fa" }, // blue
    { label: "Viewer", count: roles.viewer, color: "#a78bfa" }, // violet
    { label: "Pending", count: roles.pending, color: "#71717a" }, // zinc
  ].filter((s) => s.count > 0);

  const slices = rawSlices.map((s) => ({
    ...s,
    percent: s.count / total,
  }));

  let cumulativePercent = 0;
  const getPieCoords = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <StatCard
      title="Team Members"
      value={roles.total}
      delta={delta}
      deltaValue={deltaValue}
      period={period}
    >
      <div
        role="region"
        aria-label={`Team members by role: ${slices.map((s) => `${s.label} ${s.count}`).join(", ")}`}
        className="w-full flex flex-col items-center justify-between flex-1 py-1"
      >
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          <motion.svg
            viewBox="-1.2 -1.2 2.4 2.4"
            className="-rotate-90 overflow-visible w-full h-full"
            initial={{ rotate: -180, scale: 0.8 }}
            animate={{ rotate: -90, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            {slices.map((slice) => {
              const startPercent = cumulativePercent;
              const endPercent = cumulativePercent + slice.percent;
              cumulativePercent = endPercent;
              const [startX, startY] = getPieCoords(startPercent);
              const [endX, endY] = getPieCoords(endPercent);
              const largeArcFlag = slice.percent > 0.5 ? 1 : 0;
              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(" ");

              const isHovered = hoveredSlice === slice.label;
              const isDimmed = hoveredSlice !== null && !isHovered;

              return (
                <motion.path
                  key={slice.label}
                  d={pathData}
                  fill={slice.color}
                  className="stroke-[#0D0E12]"
                  strokeWidth="0.05"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    translateX: isHovered ? (startX + endX) * 0.08 : 0,
                    translateY: isHovered ? (startY + endY) * 0.08 : 0,
                    scale: isHovered ? 1.05 : 1,
                    opacity: isDimmed ? 0.35 : 1,
                  }}
                  transition={springConfig}
                  onMouseEnter={() => setHoveredSlice(slice.label)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}
            {/* Center cutout */}
            <circle
              cx="0"
              cy="0"
              r="0.65"
              className="fill-[#0D0E12] stroke-black dark:stroke-white/20"
              strokeWidth="0.04"
            />
          </motion.svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
              {hoveredSlice
                ? slices.find((s) => s.label === hoveredSlice)?.count
                : roles.total}
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-[var(--text-muted)]">
              {hoveredSlice ?? "TOTAL"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 w-full px-1">
          {slices.map((slice) => (
            <div
              key={slice.label}
              onMouseEnter={() => setHoveredSlice(slice.label)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-mono cursor-pointer transition-opacity",
                hoveredSlice && hoveredSlice !== slice.label ? "opacity-40" : "opacity-100"
              )}
            >
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate text-[var(--text-secondary)]">{slice.label}</span>
              <span className="ml-auto font-bold text-[var(--text-primary)]">{slice.count}</span>
            </div>
          ))}
        </div>
      </div>
    </StatCard>
  );
}
