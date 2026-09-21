"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  Lock,
  CornerDownLeft,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceType = "insight" | "project" | "report";

interface Source {
  id: string;
  type: SourceType;
  title: string;
  label: string;
}

interface Message {
  id: string;
  sender: "user" | "rf";
  text: string;
  timestamp: string;
  sources?: Source[];
  error?: boolean;
}

interface SessionInfo {
  user: { id: string; name: string; email: string; role: string };
  organization: { id: string; name: string; plan: string } | null;
}

const DEFAULT_SUGGESTIONS = [
  "Which accounts are most at risk this quarter?",
  "What's driving pipeline concentration in Q4?",
  "Show me renewal opportunities this month",
  "Summarise the latest project activity",
];

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AskRFContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentOrg = session?.organization?.name || "your organization";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.ok && !cancelled) {
          setSession((await res.json()) as SessionInfo);
        }
      } catch {
        // Network failure — the send action will surface a clear error.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend ?? input).trim();
      if (!query || isTyping) return;

      setMessages((prev) => [
        ...prev,
        { id: `msg_user_${Date.now()}`, sender: "user", text: query, timestamp: nowLabel() },
      ]);
      if (textToSend === undefined) setInput("");
      setIsTyping(true);

      try {
        const res = await fetch("/api/ask-rf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Only the question is sent. Identity is resolved server-side from
          // the session cookie.
          body: JSON.stringify({ question: query }),
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = (await res.json().catch(() => null)) as
          | { answer?: string; sources?: Source[]; error?: string }
          | null;

        if (!res.ok || !data?.answer) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_rf_${Date.now()}`,
              sender: "rf",
              text: data?.error || "Ask RF is temporarily unavailable. Please try again.",
              timestamp: nowLabel(),
              error: true,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `msg_rf_${Date.now()}`,
            sender: "rf",
            text: data.answer as string,
            timestamp: nowLabel(),
            sources: data.sources ?? [],
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_rf_${Date.now()}`,
            sender: "rf",
            text: "Could not reach Ask RF. Check your connection and try again.",
            timestamp: nowLabel(),
            error: true,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, router],
  );

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      // Fire the query handed off from the dashboard widget on first mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSend(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

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
                RF Intelligence retrieves relevant insights, projects and reports from
                {" "}
                <span className="font-medium text-[var(--text-primary)]">{currentOrg}</span>
                {" "}
                and answers using only that context.
              </p>
            </div>

            {/* Suggested Question Chips */}
            <div className="w-full space-y-2 pt-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Suggested questions
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
                      : msg.error
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "bg-[var(--accent)] text-white shadow-xs"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="size-4" />
                  ) : msg.error ? (
                    <AlertCircle className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </div>

                {/* Content Bubble */}
                <div className="space-y-2 min-w-0">
                  <div
                    className={`rounded-xl p-4 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--text-primary)]"
                        : msg.error
                          ? "bg-amber-500/5 border border-amber-500/20 text-[var(--text-primary)]"
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
                        Sources:
                      </span>
                      {msg.sources.map((src) => (
                        <span
                          key={src.id}
                          title={`${src.type}: ${src.title}`}
                          className="bg-[var(--surface-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded-xs"
                        >
                          {src.label} · {src.title}
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
                  RF is retrieving your workspace context...
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
            Answers grounded in your organization&apos;s records
          </span>
          <span>Tenant-scoped retrieval</span>
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
