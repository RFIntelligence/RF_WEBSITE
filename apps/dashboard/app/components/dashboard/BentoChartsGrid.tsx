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

interface BentoChartsGridProps {
  data: DashboardData;
}

export function BentoChartsGrid({ data }: BentoChartsGridProps) {
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
          <ProjectStatusBars
            counts={projectCounts}
            delta={projectCard.delta}
            deltaValue={projectCard.deltaValue}
            period={projectCard.period}
          />
        </div>

        <div className="md:col-span-5 lg:col-span-4 min-h-[260px]">
          <AcceptanceGauge
            rate={renewalCard.rawValue}
            delta={renewalCard.delta}
            deltaValue={renewalCard.deltaValue}
            period={renewalCard.period}
          />
        </div>

        {/* Row 2: AI Insights (wide: 5 cols) + Open Conversations (4 cols) + Team Members (3 cols) */}
        <div className="md:col-span-12 lg:col-span-5 min-h-[240px]">
          <InsightsSparkline
            total={insightsCard.rawValue}
            delta={insightsCard.delta}
            deltaValue={insightsCard.deltaValue}
            period={insightsCard.period}
            history={insightsHistory}
          />
        </div>

        <div className="md:col-span-6 lg:col-span-4 min-h-[240px]">
          <ConversationsMini
            total={convCard.rawValue}
            delta={convCard.delta}
            deltaValue={convCard.deltaValue}
            period={convCard.period}
            history={convHistory}
          />
        </div>

        <div className="md:col-span-6 lg:col-span-3 min-h-[240px]">
          <TeamRoleDonut
            roles={teamRoles}
            delta={teamCard.delta}
            deltaValue={teamCard.deltaValue}
            period={teamCard.period}
          />
        </div>
      </div>
    </section>
  );
}
