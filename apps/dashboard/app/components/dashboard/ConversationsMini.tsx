"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "./StatCard";
import type { ConversationHistoryPoint } from "@/app/lib/dashboard-mock";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface ConversationsMiniProps {
  total: number;
  delta: string;
  deltaValue: number;
  period: string;
  history: ConversationHistoryPoint[];
}

export function ConversationsMini({
  total,
  delta,
  deltaValue,
  period,
  history,
}: ConversationsMiniProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const maxVal = Math.max(...history.map((h) => h.count), 1);

  return (
    <StatCard
      title="Open Conversations"
      value={total}
      delta={delta}
      deltaValue={deltaValue}
      period={period}
    >
      <div
        role="region"
        aria-label={`Open conversations 7-day volume: ${history.map((h) => `${h.day}: ${h.count}`).join(", ")}`}
        className="w-full flex flex-col justify-between h-full pt-1"
      >
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-4 text-center">
            <CheckCircle2 className="size-6 text-green-400 mb-1.5" />
            <p className="text-xs font-semibold text-[var(--text-primary)]">All caught up</p>
            <p className="text-[11px] text-[var(--text-muted)]">No unread client messages</p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-1.5 sm:gap-2 flex-1 min-h-[95px] pb-1">
            {history.map((item, i) => {
              const heightPercent = Math.max(14, Math.round((item.count / maxVal) * 100));
              const isHovered = hoveredIdx === i;
              const isDimmed = hoveredIdx !== null && !isHovered;

              return (
                <div
                  key={i}
                  className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-0.5 text-[11px] font-mono font-bold whitespace-nowrap border border-white/20 rounded z-30 pointer-events-none"
                      >
                        {item.day}: {item.count}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${heightPercent}%`,
                      opacity: isDimmed ? 0.35 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 22,
                      delay: i * 0.04,
                    }}
                    whileHover={{ scaleY: 1.06 }}
                    className={cn(
                      "w-full rounded-t border border-black dark:border-white/30 relative z-10 flex items-center justify-center overflow-hidden",
                      i === history.length - 1
                        ? "bg-[var(--dash-chart-tertiary)]"
                        : "bg-purple-500/80"
                    )}
                  >
                    <span className="sr-only">{item.count}</span>
                  </motion.div>

                  <span className="mt-1.5 text-[9px] font-mono font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                    {item.day.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StatCard>
  );
}
