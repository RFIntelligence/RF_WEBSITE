"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { StatCard } from "./StatCard";

interface AcceptanceGaugeProps {
  rate: number;
  delta: string;
  deltaValue: number;
  period: string;
}

const springConfig = { type: "spring", stiffness: 260, damping: 22 } as const;

export function AcceptanceGauge({
  rate,
  delta,
  deltaValue,
  period,
}: AcceptanceGaugeProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Normalize rate (0-100)
  const clampedRate = Math.min(100, Math.max(0, rate));
  const acceptedPercent = clampedRate / 100;
  const remainingPercent = 1 - acceptedPercent;

  const slices = [
    { label: "Accepted", value: clampedRate, color: "var(--dash-status-running)", percent: acceptedPercent },
    { label: "Other", value: 100 - clampedRate, color: "rgba(245,245,240,0.12)", percent: remainingPercent },
  ];

  let cumulativePercent = 0;
  const getPieCoords = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <StatCard
      title="Acceptance Rate"
      value={`${clampedRate}%`}
      delta={delta}
      deltaValue={deltaValue}
      period={period}
    >
      <div
        role="region"
        aria-label={`Acceptance rate gauge: ${clampedRate}% accepted`}
        className="w-full flex flex-col items-center justify-center flex-1 py-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
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

              return (
                <motion.path
                  key={slice.label}
                  d={pathData}
                  fill={slice.color}
                  className="stroke-black dark:stroke-[#0D0E12]"
                  strokeWidth="0.04"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    scale: isHovered && slice.label === "Accepted" ? 1.05 : 1,
                  }}
                  transition={springConfig}
                />
              );
            })}
            {/* Center cutout for Donut */}
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
              {clampedRate}%
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-green-400">
              ACCEPTED
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span>Accepted</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
            <span className="w-2 h-2 rounded-full bg-white/20 inline-block" />
            <span>Dismissed/Other</span>
          </div>
        </div>
      </div>
    </StatCard>
  );
}
