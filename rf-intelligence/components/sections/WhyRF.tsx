"use client";

/**
 * WhyRF — differentiation story (requirements.md §8.10).
 * Five pinned FlowSections alternating black / deep-red surfaces:
 * intro → competitive landscape → differentiators 01–03 →
 * differentiators 04–06 → CTA.
 * Reachable by scrolling the home page (#why-rf) and at /why-rf.
 */

import React from "react";
import Link from "next/link";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { SweepButton } from "@/components/ui/SweepButton";

/* Brand surfaces — mirror globals.css dark tokens */
const BLACK_DEEP = "#05060A";
const BLACK_MID = "#0A0A0A";
const RED_DEEP = "var(--accent-deep)"; /* #692220 */
const INK = "#F5F1EC";
const INK_SOFT = "rgba(245, 241, 236, 0.72)";
const INK_FAINT = "rgba(245, 241, 236, 0.5)";
const SALMON = "#FF9B8A"; /* lighter accent tint for text on red */
const MONO = "var(--font-geist-mono, ui-monospace, monospace)";

/* Per-surface treatment so hairlines/cards stay legible on both tones */
const TONE = {
  black: {
    eyebrow: "var(--accent)",
    rule: "var(--border-strong)",
    cardBorder: "var(--border)",
    cardBg: "rgba(245, 241, 236, 0.02)",
    cardHover: "hover:bg-[rgba(242,78,75,0.05)]",
    muted: INK_FAINT,
  },
  red: {
    eyebrow: SALMON,
    rule: "rgba(255, 255, 255, 0.22)",
    cardBorder: "rgba(255, 255, 255, 0.18)",
    cardBg: "rgba(10, 10, 10, 0.30)",
    cardHover: "hover:bg-[rgba(0,0,0,0.20)]",
    muted: INK_SOFT,
  },
} as const;

type ToneName = keyof typeof TONE;

const LANDSCAPE = [
  {
    name: "Traditional Software",
    verb: "Records",
    tagline: "Reports what already happened.",
    points: [
      "Teams still do every step themselves",
      "Value stops at visibility",
      "More volume means more heads",
    ],
    highlighted: false,
  },
  {
    name: "Automation Tools",
    verb: "Repeats",
    tagline: "Moves tasks between screens.",
    points: [
      "Rigid rules break on exceptions",
      "Every trigger needs a caretaker",
      "Automates tasks, not outcomes",
    ],
    highlighted: false,
  },
  {
    name: "RF Intelligence",
    verb: "Runs",
    tagline: "Understands, decides, executes.",
    points: [
      "Reads context and chooses the next step",
      "Executes end-to-end across your systems",
      "Humans stay involved where judgment matters",
    ],
    highlighted: true,
  },
];

const DIFFERENTIATORS = [
  {
    num: "01",
    title: "Business First",
    body: "We start from how your business actually runs — not from a feature list. Every build maps back to an operational outcome.",
  },
  {
    num: "02",
    title: "Workflow Specific",
    body: "Your approvals, handoffs and exception paths shape the system — never the other way around.",
  },
  {
    num: "03",
    title: "AI + Automation",
    body: "Intelligence applied where judgment earns its keep, automation everywhere else — one layer doing the repeatable work.",
  },
  {
    num: "04",
    title: "Integration Friendly",
    body: "Works alongside the CRM, ERP, spreadsheets and inboxes you already run. No rip-and-replace.",
  },
  {
    num: "05",
    title: "Human-in-the-Loop",
    body: "People stay in control. Exceptions surface for review, and judgment calls remain human calls.",
  },
  {
    num: "06",
    title: "Designed for Scale",
    body: "Built to absorb more volume, locations and complexity — without piling on manual oversight.",
  },
];

function Rule({ tone }: { tone: ToneName }) {
  return (
    <div
      aria-hidden="true"
      className="w-full"
      style={{ borderTop: `1px solid ${TONE[tone].rule}` }}
    />
  );
}

function Eyebrow({ tone, children }: { tone: ToneName; children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-medium uppercase m-0"
      style={{
        color: TONE[tone].eyebrow,
        letterSpacing: "0.2em",
        fontFamily: MONO,
      }}
    >
      {children}
    </p>
  );
}

function DisplayHeading({
  children,
  size = "clamp(2.75rem, 9vw, 7.5rem)",
}: {
  children: React.ReactNode;
  size?: string;
}) {
  return (
    <h2
      className="font-bold uppercase tracking-tight m-0"
      style={{ fontSize: size, lineHeight: 0.92, color: INK }}
    >
      {children}
    </h2>
  );
}

function LandscapeColumn({
  entry,
  tone,
}: {
  entry: (typeof LANDSCAPE)[number];
  tone: ToneName;
}) {
  const t = TONE[tone];
  const isBlack = tone === "black";
  return (
    <div
      className="flex-1 min-w-[220px] flex flex-col gap-4 p-6 md:p-8"
      style={{
        borderRadius: "var(--radius-lg)",
        border: entry.highlighted
          ? `1px solid ${isBlack ? "rgba(242, 78, 75, 0.55)" : "rgba(255, 255, 255, 0.55)"}`
          : t.cardBorder,
        borderTop: entry.highlighted
          ? `2px solid ${isBlack ? "var(--accent)" : INK}`
          : undefined,
        background: entry.highlighted
          ? isBlack
            ? "rgba(242, 78, 75, 0.07)"
            : "rgba(10, 10, 10, 0.45)"
          : t.cardBg,
      }}
    >
      <p
        className="text-xs font-medium uppercase m-0"
        style={{
          color: entry.highlighted
            ? isBlack ? "var(--accent)" : INK
            : isBlack ? INK_FAINT : INK_SOFT,
          letterSpacing: "0.18em",
          fontFamily: MONO,
        }}
      >
        {entry.name}
      </p>
      <div>
        <span
          className="block font-semibold tracking-tight"
          style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)", color: INK }}
        >
          {entry.verb}.
        </span>
        <span className="block text-sm mt-1" style={{ color: t.muted }}>
          {entry.tagline}
        </span>
      </div>
      <ul className="list-none p-0 m-0 flex flex-col gap-3">
        {entry.points.map((point) => (
          <li
            key={point}
            className="text-sm leading-relaxed pl-4"
            style={{
              color: t.muted,
              borderLeft: `1px solid ${t.cardBorder}`,
            }}
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiffCard({
  num,
  title,
  body,
  tone,
}: {
  num: string;
  title: string;
  body: string;
  tone: ToneName;
}) {
  const t = TONE[tone];
  return (
    <div
      className={`flex-1 min-w-[220px] flex flex-col gap-3 p-6 md:p-8 transition-colors duration-300 ${t.cardHover}`}
      style={{
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${t.cardBorder}`,
        background: t.cardBg,
      }}
    >
      <span
        className="text-xs font-medium"
        style={{ color: t.eyebrow, fontFamily: MONO }}
      >
        {num}
      </span>
      <h3
        className="font-semibold tracking-tight m-0"
        style={{ fontSize: "clamp(1.15rem, 1.8vw, 1.5rem)", color: INK }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed m-0" style={{ color: t.muted }}>
        {body}
      </p>
    </div>
  );
}

export function WhyRF() {
  return (
    <FlowArt aria-label="Why RF Intelligence">
      {/* ── 01 · Intro — black ── */}
      <FlowSection
        aria-label="Why RF — introduction"
        style={{ backgroundColor: BLACK_DEEP }}
      >
        <Eyebrow tone="black">01 — Why RF</Eyebrow>
        <Rule tone="black" />
        <DisplayHeading size="clamp(3.25rem, 11vw, 9.5rem)">
          Not
          <br />
          Another
          <br />
          Tool.
        </DisplayHeading>
        <Rule tone="black" />
        <p
          className="mt-auto max-w-[54ch] m-0"
          style={{
            fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
            lineHeight: 1.65,
            color: INK_SOFT,
          }}
        >
          RF Intelligence isn&apos;t another dashboard to watch — it&apos;s an
          intelligence layer designed to understand, decide and execute the
          work behind your operations. Here&apos;s what sets it apart.
        </p>
      </FlowSection>

      {/* ── 02 · Landscape comparison — deep red ── */}
      <FlowSection
        aria-label="How RF compares to traditional software and automation tools"
        style={{ backgroundColor: RED_DEEP }}
      >
        <Eyebrow tone="red">02 — The landscape</Eyebrow>
        <Rule tone="red" />
        <DisplayHeading size="clamp(2.5rem, 7vw, 5.5rem)">
          Record. Repeat.{" "}
          <span style={{ color: BLACK_DEEP }}>Run.</span>
        </DisplayHeading>
        <Rule tone="red" />
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 md:gap-[2vw] my-2">
          {LANDSCAPE.map((entry) => (
            <LandscapeColumn key={entry.name} entry={entry} tone="red" />
          ))}
        </div>
        <Rule tone="red" />
        <p
          className="max-w-[60ch] m-0 text-sm md:text-base"
          style={{ color: INK_SOFT }}
        >
          Most tools hand you another screen. RF is built to take the work off
          the screen entirely.
        </p>
      </FlowSection>

      {/* ── 03 · Differentiators 01–03 — black ── */}
      <FlowSection
        aria-label="Differentiators one to three"
        style={{ backgroundColor: BLACK_MID }}
      >
        <Eyebrow tone="black">03 — Differentiators 01–03</Eyebrow>
        <Rule tone="black" />
        <DisplayHeading size="clamp(2.5rem, 8vw, 6.5rem)">
          Built Around
          <br />
          Your Business.
        </DisplayHeading>
        <Rule tone="black" />
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 md:gap-[2vw] my-2">
          {DIFFERENTIATORS.slice(0, 3).map((item) => (
            <DiffCard key={item.num} {...item} tone="black" />
          ))}
        </div>
      </FlowSection>

      {/* ── 04 · Differentiators 04–06 — deep red ── */}
      <FlowSection
        aria-label="Differentiators four to six"
        style={{ backgroundColor: RED_DEEP }}
      >
        <Eyebrow tone="red">04 — Differentiators 04–06</Eyebrow>
        <Rule tone="red" />
        <DisplayHeading size="clamp(2.5rem, 8vw, 6.5rem)">
          Connected.
          <br />
          Controlled.
          <br />
          Scalable.
        </DisplayHeading>
        <Rule tone="red" />
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 md:gap-[2vw] my-2">
          {DIFFERENTIATORS.slice(3).map((item) => (
            <DiffCard key={item.num} {...item} tone="red" />
          ))}
        </div>
      </FlowSection>

      {/* ── 05 · CTA — black ── */}
      <FlowSection
        aria-label="Book a demo"
        style={{
          backgroundColor: BLACK_DEEP,
          backgroundImage:
            "radial-gradient(55% 45% at 18% 100%, rgba(242, 78, 75, 0.09), transparent 70%)",
        }}
      >
        <Eyebrow tone="black">05 — See it yourself</Eyebrow>
        <Rule tone="black" />
        <DisplayHeading size="clamp(3rem, 10vw, 8.5rem)">
          See It
          <br />
          In Action.
        </DisplayHeading>
        <Rule tone="black" />
        <div
          className="mt-auto w-full max-w-[1440px] mx-auto flex flex-wrap items-end justify-between gap-8"
        >
          <p
            className="max-w-[46ch] m-0"
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
              lineHeight: 1.65,
              color: INK_SOFT,
            }}
          >
            Bring one workflow — orders, follow-ups, reporting — and
            we&apos;ll map how RF would run it end-to-end. Free, no
            commitment.
          </p>
          <Link href="/book-a-demo">
            <SweepButton
              label="Map My Workflow"
              defaultIcon="/book.svg"
              hoverIcon="/book1.svg"
            />
          </Link>
        </div>
      </FlowSection>
    </FlowArt>
  );
}
