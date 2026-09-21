"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaValue?: number;
  period?: string;
  children: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  delta,
  deltaValue,
  period,
  children,
  className,
}: StatCardProps) {
  // Compute trend from numeric deltaValue if provided, else sign in string
  const isPositive =
    typeof deltaValue === "number"
      ? deltaValue > 0
      : delta?.startsWith("+");
  const isNegative =
    typeof deltaValue === "number"
      ? deltaValue < 0
      : delta?.startsWith("-");
  const isZero =
    typeof deltaValue === "number"
      ? deltaValue === 0
      : delta === "0" || delta === "0%" || !delta;

  const TrendIcon = isPositive
    ? TrendingUp
    : isNegative
    ? TrendingDown
    : Minus;

  const deltaColor = isPositive
    ? "text-green-400 bg-green-950/40 border-green-500/30"
    : isNegative
    ? "text-red-400 bg-red-950/40 border-red-500/30"
    : "text-zinc-400 bg-zinc-800/40 border-zinc-700/30";

  return (
    <div
      className={cn(
        "w-full h-full bg-[#0D0E12] border-[2px] border-black dark:border-white/20",
        "shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.08)]",
        "relative flex flex-col p-5 sm:p-6 transition-all duration-200 overflow-hidden rounded-xl group",
        "hover:border-white/40 hover:shadow-[7px_7px_0px_0px_rgba(242,78,75,0.3)]",
        className
      )}
    >
      {/* Background radial dot grid texture adapted from brutalist bento */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:10px_10px]"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4 border-b border-white/10 pb-3 z-10">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">
            {title}
          </h3>
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] mt-1">
            {value}
          </p>
        </div>

        {delta !== undefined && (
          <div className="flex flex-col items-end">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border",
                deltaColor
              )}
            >
              <TrendIcon className="size-3" aria-hidden="true" />
              <span>{isZero ? "—" : delta}</span>
            </span>
            {period && (
              <span className="text-[10px] text-[var(--text-muted)] mt-1 font-mono tracking-wide">
                {period}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart Body */}
      <div className="flex-1 w-full relative z-10 flex flex-col justify-end min-h-[140px]">
        {children}
      </div>
    </div>
  );
}
