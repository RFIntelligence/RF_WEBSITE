"use client";

/**
 * Benefits — seven hedged outcome cards (requirements.md §8.9).
 * Sticky stacking-card scroll: intro screen, then cards pile up
 * (alternating black / deep red) beside a pinned heading.
 * No CTAs on cards — conversion stays at section level.
 *
 * Hard rule from requirements.md: every benefit uses hedged language
 * ("Designed to…", "Potentially…") — never a numeric guarantee.
 */

import React, { useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Brand surfaces — mirror globals.css dark tokens */
const BLACK_DEEP = "#05060A";
const RED_DEEP = "#692220";
const INK = "#F5F1EC";
const INK_SOFT = "rgba(245, 241, 236, 0.72)";
const SALMON = "#FF9B8A";
const MONO = "var(--font-geist-mono, ui-monospace, monospace)";

type Tone = "black" | "red";

const BENEFITS: {
  num: string;
  title: string;
  body: string;
  tone: Tone;
  rotation: string;
}[] = [
  {
    num: "01",
    title: "Reduce Manual Work",
    body: "Designed to take repetitive tasks off your team's plate — data entry, follow-ups, checks — depending on the workflow.",
    tone: "black",
    rotation: "rotate-2",
  },
  {
    num: "02",
    title: "Improve Operational Efficiency",
    body: "Potentially streamlines processes by removing manual handoffs and the waiting time between steps.",
    tone: "red",
    rotation: "-rotate-2",
  },
  {
    num: "03",
    title: "Reduce Human Error",
    body: "Automated validation is designed to catch the inconsistencies that manual work lets slip through.",
    tone: "black",
    rotation: "rotate-2",
  },
  {
    num: "04",
    title: "Scale Operations",
    body: "Built to absorb growing volume and complexity — without headcount growing to match.",
    tone: "red",
    rotation: "-rotate-2",
  },
  {
    num: "05",
    title: "Faster Response",
    body: "Designed to shorten turnaround on orders, requests and customer follow-ups.",
    tone: "black",
    rotation: "rotate-2",
  },
  {
    num: "06",
    title: "Better Visibility",
    body: "A clearer view of what's running, what's waiting, and what actually needs a human.",
    tone: "red",
    rotation: "-rotate-2",
  },
  {
    num: "07",
    title: "Lower Operational Costs",
    body: "Potentially lowers the cost per process, depending on the workflow and implementation.",
    tone: "black",
    rotation: "rotate-2",
  },
];

/** Keeps GSAP ScrollTrigger (used by WhyRF / How It Works pins) in sync with lenis. */
function ScrollTriggerBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    return () => {
      lenis.off("scroll", update);
    };
  }, [lenis]);
  return null;
}

function BenefitCard({
  num,
  title,
  body,
  tone,
  rotation,
}: (typeof BENEFITS)[number]) {
  const isRed = tone === "red";
  return (
    <article
      className={`h-[24rem] w-[min(42rem,90vw)] rounded-xl p-10 md:p-12 grid place-content-center gap-4 shadow-2xl shadow-black/60 ${rotation}`}
      style={{
        backgroundColor: isRed ? RED_DEEP : BLACK_DEEP,
        border: `1px solid ${isRed ? "rgba(255, 255, 255, 0.28)" : "var(--border-strong)"}`,
      }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: isRed ? SALMON : "var(--accent)", fontFamily: MONO }}
      >
        {num}
      </span>
      <h3
        className="font-semibold tracking-tight m-0"
        style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", color: INK }}
      >
        {title}
      </h3>
      <p
        className="text-base md:text-lg leading-relaxed m-0 max-w-[52ch]"
        style={{ color: INK_SOFT }}
      >
        {body}
      </p>
    </article>
  );
}

function BenefitsContent() {
  return (
    <div className="w-full" style={{ background: BLACK_DEEP }}>
      {/* ── Intro screen ── */}
      <section
        aria-labelledby="benefits-headline"
        className="relative h-screen w-full grid place-content-center text-center px-6 overflow-hidden"
      >
        {/* faint grid backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(242, 78, 75, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(242, 78, 75, 0.07) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
          }}
        />

        <div className="relative">
          <p
            className="text-xs font-medium uppercase m-0 mb-5"
            style={{ color: "var(--accent)", letterSpacing: "0.2em", fontFamily: MONO }}
          >
            / benefits
          </p>
          <h2
            id="benefits-headline"
            className="font-semibold tracking-[-0.02em] leading-[1.05] m-0 mb-6"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)", color: INK }}
          >
            Less busywork.
            <span
              className="block"
              style={{
                background:
                  "linear-gradient(to right, #F5F5F0 0%, #F5F5F0 25%, #FA504D 45%, #CF4240 70%, #692220 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: INK,
              }}
            >
              More business.
            </span>
          </h2>
          <p
            className="max-w-[560px] mx-auto m-0 leading-[1.6]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)", color: INK_SOFT }}
          >
            Seven outcomes RF is designed to pursue on your operations —
            stated honestly, because results depend on the workflow.
          </p>

          {/* scroll cue */}
          <div className="mt-10 inline-flex flex-col items-center gap-2">
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "rgba(245, 241, 236, 0.45)" }}
            >
              Scroll
            </span>
            <span
              aria-hidden="true"
              className="block h-10 w-px origin-top animate-pulse"
              style={{
                background: "linear-gradient(to bottom, var(--accent), transparent)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Stacking cards ── */}
      <section aria-label="Benefit details" className="w-full">
        {/* mobile heading */}
        <div className="lg:hidden px-6 pt-16 pb-4 text-center">
          <p
            className="text-xs font-medium uppercase m-0 mb-4"
            style={{ color: "var(--accent)", letterSpacing: "0.2em", fontFamily: MONO }}
          >
            / benefits
          </p>
          <h2
            className="font-semibold tracking-tight leading-[1.1] m-0"
            style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", color: INK }}
          >
            What RF is designed to deliver.
          </h2>
        </div>

        <div className="flex justify-between gap-8 px-6 md:px-16">
          <div className="grid gap-2 flex-1">
            {BENEFITS.map((benefit) => (
              <figure
                key={benefit.num}
                className="sticky top-0 h-screen grid place-content-center m-0"
              >
                <BenefitCard {...benefit} />
              </figure>
            ))}
          </div>

          {/* pinned heading — desktop */}
          <div className="hidden lg:grid sticky top-0 h-screen place-content-center shrink-0">
            <h2
              className="font-medium text-center tracking-tight leading-[1.2] m-0 px-8"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color: INK }}
            >
              What RF is
              <br />
              designed to
              <br />
              deliver.
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Benefits() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Lenis fights CSS smooth-scroll — disable it only while lenis is active
  useEffect(() => {
    if (reducedMotion) return;
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    return () => {
      html.style.scrollBehavior = prev;
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <BenefitsContent />;
  }

  return (
    <ReactLenis root options={{ autoRaf: true }}>
      <ScrollTriggerBridge />
      <BenefitsContent />
    </ReactLenis>
  );
}

export default Benefits;
