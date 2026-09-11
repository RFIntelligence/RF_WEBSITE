"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "Which accounts are most at risk this quarter?",
  "Summarise Meridian Health's last 3 calls",
  "What's driving pipeline concentration in Q4?",
  "Show me renewal opportunities this month",
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function AskRFWidget() {
  const router  = useRouter();
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  function handlePrompt(text: string) {
    // In Part 2 this will pass the query as a search param to /ask-rf
    router.push(`/ask-rf?q=${encodeURIComponent(text)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) handlePrompt(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) handlePrompt(trimmed);
    }
  }

  return (
    <section
      aria-labelledby="ask-rf-heading"
      className="rounded-xl border p-4"
      style={{
        borderColor: "rgba(242,78,75,0.2)",
        background:  "rgba(242,78,75,0.03)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: "rgba(242,78,75,0.12)" }}
        >
          <Sparkles className="size-3.5 text-[var(--accent)]" />
        </span>
        <div>
          <h2
            id="ask-rf-heading"
            className="text-sm font-semibold text-[var(--text-primary)] leading-none"
          >
            Ask RF
          </h2>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            Natural language queries across your workspace
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative mb-3">
        <label htmlFor="ask-rf-input" className="sr-only">
          Ask RF a question
        </label>
        <textarea
          id="ask-rf-input"
          ref={inputRef}
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Which accounts need attention this week?"
          className="w-full resize-none rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] transition-colors"
        />
        <button
          type="submit"
          aria-label="Submit question to RF"
          disabled={!value.trim()}
          className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] transition-all hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowRight aria-hidden className="size-3.5" />
        </button>
      </form>

      {/* Suggested prompts */}
      <div>
        <p className="mb-1.5 text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)]">
          Suggested
        </p>
        <ul className="flex flex-col gap-1" role="list">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <li key={prompt}>
              <button
                type="button"
                onClick={() => handlePrompt(prompt)}
                className="group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
              >
                <CornerDownLeft
                  aria-hidden
                  className="size-3 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors"
                />
                {prompt}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
