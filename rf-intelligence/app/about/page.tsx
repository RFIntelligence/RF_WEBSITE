"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { RFNavbar } from "@/components/sections/Navbar";
import { SweepButton } from "@/components/ui/SweepButton";

// Dynamic import avoids SSR for the 3D shard animation
const GlassShards = dynamic(
  () => import("@/components/canvas/GlassShards").then((m) => m.GlassShards),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" aria-hidden="true" />,
  }
);

/* ─────────────────────────────────────────────────────────────────────────────
   About RF Intelligence Page
   Sections: Hero/Intro, Story, Stat Strip, Values, Philosophy, CTA
───────────────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "120+", label: "Workflows automated" },
  { value: "40", label: "Hours reclaimed per team / month" },
  { value: "98%", label: "Client retention" },
  { value: "4", label: "Years running" },
];

const VALUES = [
  {
    title: "Signal over noise",
    description:
      "We automate the repeatable, not the important. Judgment stays human.",
  },
  {
    title: "Built to run quietly",
    description:
      "Good automation is invisible. You should notice the time back, not the system.",
  },
  {
    title: "Tuned to you",
    description:
      "No two operations run the same. We build for your workflow, not a template.",
  },
];

export default function AboutPage() {
  return (
    <>
      <RFNavbar />
      <main>
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — INTRO / HERO
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="about-intro-heading"
          className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
          style={{ background: "#0A0A0A" }}
        >
          {/* Rotating glass shards — background visual */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <div className="w-full h-full max-w-[700px] max-h-[700px] mx-auto">
              <GlassShards />
            </div>
          </div>

          {/* Intro statement */}
          <div className="relative z-10 w-full max-w-[820px] mx-auto px-6 md:px-10 py-32 text-center">
            <h1
              id="about-intro-heading"
              className="font-bold leading-[1.1] tracking-tight mb-0"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                color: "#F5F1EC",
                fontStretch: "condensed",
              }}
            >
              Every business generates noise — manual steps, repeated decisions,
              work that shouldn&rsquo;t need a person. RF Intelligence exists to
              find the signal in that noise, and build systems that act on it.
            </h1>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — STORY
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="about-story-heading"
          className="w-full py-24 md:py-32 px-6 md:px-10"
          style={{ background: "#0A0A0A" }}
        >
          <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
            {/* Text column */}
            <div>
              <h2
                id="about-story-heading"
                className="sr-only"
              >
                Our Story
              </h2>
              <p
                className="leading-[1.7] mb-6"
                style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)", color: "rgba(245, 241, 236, 0.85)" }}
              >
                We started RF Intelligence after watching the same pattern across
                every team we worked with: smart people spending their time on work
                that didn&rsquo;t need their judgment. Approvals. Data entry. Status
                checks. The operational static that fills a calendar without moving
                anything forward.
              </p>
              <p
                className="leading-[1.7]"
                style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)", color: "rgba(245, 241, 236, 0.85)" }}
              >
                So we built the layer that filters it out — automated systems that
                handle the repeatable work reliably, and surface only what actually
                needs a human decision. Less noise. Clearer signal. More time spent
                on what matters.
              </p>
            </div>

            {/* Abstract geometric accent — static, no animation */}
            <div className="flex items-center justify-center" aria-hidden="true">
              <div className="relative w-[260px] h-[260px] md:w-[320px] md:h-[320px]">
                {/* Outer ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "1.5px solid rgba(230, 57, 70, 0.3)",
                  }}
                />
                {/* Middle ring */}
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: "15%",
                    border: "1px solid rgba(255, 155, 138, 0.25)",
                  }}
                />
                {/* Inner filled circle */}
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: "35%",
                    background:
                      "radial-gradient(circle, rgba(92, 26, 26, 0.6) 0%, rgba(92, 26, 26, 0.1) 100%)",
                    border: "1px solid rgba(92, 26, 26, 0.5)",
                  }}
                />
                {/* Cross lines */}
                <div
                  className="absolute top-1/2 left-0 right-0 h-px"
                  style={{ background: "rgba(230, 57, 70, 0.12)" }}
                />
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-px"
                  style={{ background: "rgba(230, 57, 70, 0.12)" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3 — STAT STRIP
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Key statistics"
          className="w-full py-16 md:py-20 px-6 md:px-10"
          style={{ background: "#111111" }}
        >
          <div className="max-w-[1120px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-bold tracking-tight leading-none mb-2"
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                    color: "#F5F1EC",
                    fontStretch: "condensed",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="uppercase tracking-widest"
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(245, 241, 236, 0.5)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 — VALUES
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="about-values-heading"
          className="w-full py-24 md:py-32 px-6 md:px-10"
          style={{ background: "#0A0A0A" }}
        >
          <h2 id="about-values-heading" className="sr-only">
            Our Values
          </h2>
          <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="group rounded-xl p-8 md:p-10 transition-shadow duration-300"
                style={{
                  background: "#1A1414",
                  border: "1px solid transparent",
                  boxShadow: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.border = "1px solid rgba(230, 57, 70, 0.4)";
                  el.style.boxShadow = "0 0 30px rgba(92, 26, 26, 0.4), inset 0 0 20px rgba(92, 26, 26, 0.1)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.border = "1px solid transparent";
                  el.style.boxShadow = "none";
                }}
                onFocus={(e) => {
                  const el = e.currentTarget;
                  el.style.border = "1px solid rgba(230, 57, 70, 0.4)";
                  el.style.boxShadow = "0 0 30px rgba(92, 26, 26, 0.4), inset 0 0 20px rgba(92, 26, 26, 0.1)";
                }}
                onBlur={(e) => {
                  const el = e.currentTarget;
                  el.style.border = "1px solid transparent";
                  el.style.boxShadow = "none";
                }}
                tabIndex={0}
              >
                <h3
                  className="font-semibold mb-3 leading-tight"
                  style={{ fontSize: "1.25rem", color: "#F5F1EC" }}
                >
                  {value.title}
                </h3>
                <p
                  className="leading-[1.6]"
                  style={{ fontSize: "0.95rem", color: "rgba(245, 241, 236, 0.7)" }}
                >
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5 — PHILOSOPHY
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="about-philosophy-heading"
          className="w-full py-24 md:py-32 px-6 md:px-10"
          style={{ background: "#0A0A0A" }}
        >
          <div className="max-w-[720px] mx-auto text-center">
            <h2 id="about-philosophy-heading" className="sr-only">
              Our Philosophy
            </h2>
            <blockquote
              className="leading-[1.6]"
              style={{
                fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
                color: "#F5F1EC",
                fontStyle: "normal",
              }}
            >
              We&rsquo;re not selling AI for its own sake. We&rsquo;re removing
              the parts of your operation that shouldn&rsquo;t need a person — so
              the parts that do get the attention they deserve.
            </blockquote>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6 — CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Call to action"
          className="w-full py-20 md:py-28 px-6 md:px-10"
          style={{ background: "#0A0A0A" }}
        >
          <div className="max-w-[600px] mx-auto flex flex-wrap items-center justify-center gap-8">
            <Link href="/book-a-demo">
              <SweepButton
                label="Book Free Demo"
                defaultIcon="/book.svg"
                hoverIcon="/book1.svg"
              />
            </Link>

            <Link href="/#what-is-rf">
              <SweepButton
                label="Explore RF Intelligence"
                defaultIcon="/explore.svg"
                hoverIcon="/explore1.svg"
              />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
