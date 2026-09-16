"use client";

import React from "react";
import { insights } from "@/app/lib/mock-data";
import { InsightsFeed } from "@/app/components/dashboard/insights-feed";

export default function AIInsightsPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <p className="dash-eyebrow">/ ai insights</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          AI Intelligence & Automated Insights Feed
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          RF surfaces patterns, concentration risks, and renewal opportunities across your organization data.
        </p>
      </div>

      <InsightsFeed insights={insights} />
    </div>
  );
}
