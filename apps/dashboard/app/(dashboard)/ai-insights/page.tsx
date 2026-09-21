"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { InsightsFeed } from "@/app/components/dashboard/insights-feed";
import type { Insight } from "@/app/types/insight";

export default function AIInsightsPage() {
  const [insights, setInsights]   = useState<Insight[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { insights: Insight[] };
      setInsights(data.insights);
      setError(null);
    } catch {
      setError("Failed to load insights. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadInsights(); }, [loadInsights]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    setAnalyzeMsg(null);
    try {
      const res = await fetch("/api/insights/analyze", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnalyzeMsg("Analysis queued. New insights will appear once complete.");
      // Poll once after 8 seconds to pick up fast results
      setTimeout(() => { void loadInsights(); }, 8_000);
    } catch {
      setAnalyzeMsg("Could not start analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [loadInsights]);

  /**
   * Called by InsightsFeed after a successful action API call.
   * We receive the server-authoritative updated insight and splice it in.
   * This keeps the unread count accurate without a full page refetch.
   */
  const handleInsightUpdated = useCallback((updated: Insight) => {
    setInsights((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <p className="dash-eyebrow">/ ai insights</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          AI Intelligence &amp; Automated Insights Feed
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          RF surfaces patterns, concentration risks, and renewal opportunities across your organization data.
        </p>
      </div>

      {analyzeMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2.5 text-xs text-[var(--text-secondary)]">
          <AlertCircle className="size-3.5 shrink-0 text-[var(--accent)]" />
          {analyzeMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-xs text-[var(--text-muted)]">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading insights…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--dash-status-error)]/30 bg-[var(--dash-status-error)]/5 px-4 py-3 text-xs text-[var(--dash-status-error)]">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      ) : (
        <InsightsFeed
          insights={insights}
          showAnalyzeTrigger
          onAnalyze={() => void handleAnalyze()}
          analyzing={analyzing}
          onInsightUpdated={handleInsightUpdated}
        />
      )}
    </div>
  );
}
