"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  Building2,
  Lock,
  CornerDownLeft,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { orgs } from "@/app/lib/mock-data";

// ─── Q&A Pair database for scripted demo ──────────────────────────────────────

interface QAPair {
  keywords: string[];
  questionLabel: string;
  answer: string;
  sources: string[];
}

const QA_PAIRS: QAPair[] = [
  {
    keywords: ["risk", "at risk", "churn", "attention"],
    questionLabel: "Which accounts are most at risk this quarter?",
    answer:
      "Based on transcript sentiment and activity cadence, **Acme Corp** is your highest risk account ($480K ARR, Renewal in 9 days). Sentiment score dropped from 0.82 to 0.41 over the past 14 days following their executive sponsor change. Additionally, **GlobalFin** is currently blocked on QBR deck preparation due to missing Q2 integration data.",
    sources: ["Acme Corp Call Transcripts (3)", "GlobalFin Project Log", "CRM Opportunity Health"],
  },
  {
    keywords: ["meridian", "meridian health", "calls", "summarise", "summarize"],
    questionLabel: "Summarise Meridian Health's last 3 calls",
    answer:
      "Key takeaways from Meridian Health's last 3 calls:\n\n1. **High Sentiment (0.88):** Dr. Priya Sharma praised the platform's stability during Horizon v2 beta.\n2. **Seat Expansion:** Mentioned an organic demand for +40 additional user licenses across the clinical team.\n3. **Timeline:** On track for full v2 launch on Sep 28, 2026. Security audit passed with zero high-severity findings.",
    sources: ["Call Transcript — Aug 28, 2026", "Call Transcript — Sep 04, 2026", "Call Transcript — Sep 09, 2026"],
  },
  {
    keywords: ["concentration", "pipeline concentration", "q4", "arr"],
    questionLabel: "What's driving pipeline concentration in Q4?",
    answer:
      "Three accounts currently constitute **61% ($2.4M)** of total forecasted Q4 ARR: Acme Corp (26%), Meridian Health (20%), and GlobalFin (15%). Your Herfindahl-Hirschman Index (HHI) concentration score is **0.38**, which exceeds the recommended 0.20 threshold. We recommend accelerating stage-2 mid-market deals to hedge against single-deal slippage.",
    sources: ["Q4 Pipeline Forecast Model", "HHI Concentration Index", "CRM Opportunity Breakdown"],
  },
  {
    keywords: ["renewal", "opportunity", "opportunities", "this month"],
    questionLabel: "Show me renewal opportunities this month",
    answer:
      "There are **2 primary renewal opportunities** scheduled for September 2026:\n\n• **Acme Corp ($480K ARR):** Due Sep 20 — At Risk due to executive sponsor turnover. Immediate alignment call needed.\n• **Northstar Labs ($220K ARR):** Due Sep 15 — On Track (91% onboarding complete). High expansion potential.",
    sources: ["Contract Renewals DB", "Account Health Scorecard"],
  },
];

const DEFAULT_SUGGESTIONS = [
  "Which accounts are most at risk this quarter?",
  "Summarise Meridian Health's last 3 calls",
  "What's driving pipeline concentration in Q4?",
  "Show me renewal opportunities this month",
];

const GENERIC_RESPONSE: QAPair = {
  keywords: [],
  questionLabel: "",
  answer:
    "I analyzed your workspace data across CRM records, meeting transcripts, and project logs. While I couldn't find a direct precedent for that specific phrase in the demo script, I am monitoring **14 Active Projects**, **38 Open Conversations**, and **127 AI Insights** for Acme Corp and connected organizations.",
  sources: ["Workspace Knowledge Graph", "RF Intelligence Index"],
};

interface Message {
  id: string;
  sender: "user" | "rf";
  text: string;
  timestamp: string;
  sources?: string[];
}

function AskRFContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");

  const currentOrg = orgs[0]?.name || "Organization";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle query parameter on mount if present
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay for realistic demo
    setTimeout(() => {
      const lower = query.toLowerCase();
      const match = QA_PAIRS.find((pair) =>
        pair.keywords.some((kw) => lower.includes(kw))
      ) || GENERIC_RESPONSE;

      const rfMsg: Message = {
        id: `msg_rf_${Date.now()}`,
        sender: "rf",
        text: match.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: match.sources,
      };

      setMessages((prev) => [...prev, rfMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-[1000px] flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]"
            >
              <Sparkles className="size-4" />
            </span>
            <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              Ask RF
            </h1>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Lock className="size-3 text-emerald-400" />
            Based only on <span className="font-medium text-[var(--text-primary)]">{currentOrg}</span> data
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Clear chat
          </button>
        )}
      </div>

      {/* Main Chat Thread or Welcome View */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto space-y-6">
            <div className="size-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shadow-inner">
              <Sparkles className="size-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Query your workspace in natural language
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                RF Intelligence connects call transcripts, CRM metrics, and project logs to answer complex business questions with complete context.
              </p>
            </div>

            {/* Suggested Question Chips */}
            <div className="w-full space-y-2 pt-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Suggested questions for demo:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {DEFAULT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-left text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] transition-all group"
                  >
                    <CornerDownLeft className="size-3.5 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                    <span className="line-clamp-2">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`size-8 rounded-lg flex shrink-0 items-center justify-center text-xs font-medium ${
                    msg.sender === "user"
                      ? "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
                      : "bg-[var(--accent)] text-white shadow-xs"
                  }`}
                >
                  {msg.sender === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>

                {/* Content Bubble */}
                <div className="space-y-2 min-w-0">
                  <div
                    className={`rounded-xl p-4 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--text-primary)]"
                        : "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
                    }`}
                  >
                    {msg.text.split("\n\n").map((paragraph, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {paragraph.split("**").map((chunk, bIdx) =>
                          bIdx % 2 === 1 ? (
                            <strong key={bIdx} className="font-semibold text-[var(--text-primary)]">
                              {chunk}
                            </strong>
                          ) : (
                            chunk
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Sources citation footer */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[var(--text-muted)] pl-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-400" />
                        Verified sources:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-[var(--surface-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded-xs"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="block text-[10px] text-[var(--text-muted)] font-mono pl-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-3xl">
                <div className="size-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  RF is searching workspace index...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box Footer */}
      <div className="pt-4 border-t border-[var(--border)] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask RF anything about ${currentOrg}...`}
            className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 pr-12 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="size-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Lock className="size-2.5 text-emerald-400" />
            SOC2 Type II Compliant · Encrypted in-flight & at rest
          </span>
          <span>Part 1 Scripted Demo</span>
        </div>
      </div>
    </div>
  );
}

export default function AskRFPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--text-muted)]">Loading Ask RF...</div>}>
      <AskRFContent />
    </Suspense>
  );
}
