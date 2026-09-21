"use client";

import * as React from "react";
import type { DashboardData } from "@/app/types/dashboard";
import { ProjectStatusBars } from "./ProjectStatusBars";
import { AcceptanceGauge } from "./AcceptanceGauge";
import { InsightsSparkline } from "./InsightsSparkline";
import { ConversationsMini } from "./ConversationsMini";
import { TeamRoleDonut } from "./TeamRoleDonut";
import {
  deriveProjectStatusCounts,
  deriveConversationsHistory,
  deriveInsightsHistory,
  deriveTeamRoles,
} from "@/app/lib/dashboard-mock";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface BentoChartsGridProps {
  data: DashboardData;
  onRetry?: () => void;
}

function SectionErrorFallback({
  title,
  onRetry,
}: {
  title: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full min-h-[220px] rounded-xl border border-rose-500/20 bg-rose-500/5 text-center gap-3">
      <div className="flex items-center gap-2 text-xs font-medium text-rose-400">
        <AlertTriangle className="size-4" aria-hidden="true" />
        <span>Failed to load {title}</span>
      </div>
      <p className="text-[11px] text-[var(--text-muted)] max-w-[220px]">
        Database query timed out. Click retry to refresh this section.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-[var(--text-primary)] border border-white/10 transition-colors"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

export function BentoChartsGrid({ data, onRetry }: BentoChartsGridProps) {
  const errors = data.errors;
  const countErrors = errors?.counts;

  // Find metric cards by id
  const projectCard = data.metricCards.find((c) => c.id === "mc_projects") ?? {
    rawValue: data.projects.length,
    delta: "0",
    deltaValue: 0,
    period: "vs last month",
  };

  const renewalCard = data.metricCards.find((c) => c.id === "mc_renewal") ?? {
    rawValue: 94,
    delta: "0%",
    deltaValue: 0,
    period: "this quarter",
  };

  const insightsCard = data.metricCards.find((c) => c.id === "mc_insights") ?? {
    rawValue: data.insights.length,
    delta: "+0",
    deltaValue: 0,
    period: "last 30 days",
  };

  const convCard = data.metricCards.find((c) => c.id === "mc_conversations") ?? {
    rawValue: data.recentConversations.length,
    delta: "+0",
    deltaValue: 0,
    period: "since yesterday",
  };

  const teamCard = data.metricCards.find((c) => c.id === "mc_team") ?? {
    rawValue: 8,
    delta: "0",
    deltaValue: 0,
    period: "in this workspace",
  };

  // Derive visual breakdowns using typed selectors
  const projectCounts = React.useMemo(
    () => deriveProjectStatusCounts(data.projects, projectCard.rawValue),
    [data.projects, projectCard.rawValue]
  );

  const convHistory = React.useMemo(
    () => deriveConversationsHistory(data.recentConversations, convCard.rawValue),
    [data.recentConversations, convCard.rawValue]
  );

  const insightsHistory = React.useMemo(
    () => deriveInsightsHistory(data.insights, insightsCard.rawValue),
    [data.insights, insightsCard.rawValue]
  );

  const teamRoles = React.useMemo(
    () => deriveTeamRoles(teamCard.rawValue),
    [teamCard.rawValue]
  );

  return (
    <section aria-label="Key Performance Indicators" className="w-full space-y-6">
      {/* 12-column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Row 1: Active Projects (wide: 8 cols) + Acceptance Rate (4 cols) */}
        <div className="md:col-span-7 lg:col-span-8 min-h-[260px]">
          {errors?.projects || countErrors?.projects ? (
            <SectionErrorFallback title="Active Projects" onRetry={onRetry} />
          ) : (
            <ProjectStatusBars
              counts={projectCounts}
              delta={projectCard.delta}
              deltaValue={projectCard.deltaValue}
              period={projectCard.period}
            />
          )}
        </div>

        <div className="md:col-span-5 lg:col-span-4 min-h-[260px]">
          {countErrors?.renewal ? (
            <SectionErrorFallback title="Acceptance Rate" onRetry={onRetry} />
          ) : (
            <AcceptanceGauge
              rate={renewalCard.rawValue}
              delta={renewalCard.delta}
              deltaValue={renewalCard.deltaValue}
              period={renewalCard.period}
            />
          )}
        </div>

        {/* Row 2: AI Insights (wide: 5 cols) + Open Conversations (4 cols) + Team Members (3 cols) */}
        <div className="md:col-span-12 lg:col-span-5 min-h-[240px]">
          {errors?.insights || countErrors?.insights ? (
            <SectionErrorFallback title="AI Insights" onRetry={onRetry} />
          ) : (
            <InsightsSparkline
              total={insightsCard.rawValue}
              delta={insightsCard.delta}
              deltaValue={insightsCard.deltaValue}
              period={insightsCard.period}
              history={insightsHistory}
            />
          )}
        </div>

        <div className="md:col-span-6 lg:col-span-4 min-h-[240px]">
          {errors?.conversations || countErrors?.conversations ? (
            <SectionErrorFallback title="Open Conversations" onRetry={onRetry} />
          ) : (
            <ConversationsMini
              total={convCard.rawValue}
              delta={convCard.delta}
              deltaValue={convCard.deltaValue}
              period={convCard.period}
              history={convHistory}
            />
          )}
        </div>

        <div className="md:col-span-6 lg:col-span-3 min-h-[240px]">
          {countErrors?.team ? (
            <SectionErrorFallback title="Team Breakdown" onRetry={onRetry} />
          ) : (
            <TeamRoleDonut
              roles={teamRoles}
              delta={teamCard.delta}
              deltaValue={teamCard.deltaValue}
              period={teamCard.period}
            />
          )}
        </div>
      </div>
    </section>
  );
}
