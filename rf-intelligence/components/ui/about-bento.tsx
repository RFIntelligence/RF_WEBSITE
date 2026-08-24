"use client";

import { ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";

/* ─────────────────────────────────────────────────────────────────────────────
   Hooks
───────────────────────────────────────────────────────────────────────────── */

/** Returns true once the target element enters the viewport (fires once). */
function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.2) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

/** Detects prefers-reduced-motion */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GlowCard — wrapper that adds the rotating gradient border on hover
───────────────────────────────────────────────────────────────────────────── */

const GlowCard = styled.div<{ $bg: string; $glowColors?: string }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  /* Rotating gradient beam */
  &::before {
    opacity: 0;
    content: "";
    position: absolute;
    display: block;
    width: 200px;
    height: 600px;
    background: ${({ $glowColors }) => $glowColors || "linear-gradient(#F5F1EC, #FF9B8A)"};
    transition: opacity 300ms;
    animation: glow_rotation 8000ms infinite linear;
    animation-play-state: paused;
  }

  &:hover::before {
    opacity: 1;
    animation-play-state: running;
  }

  /* Backdrop blur overlay */
  &::after {
    position: absolute;
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    background: ${({ $bg }) => $bg}33;
    backdrop-filter: blur(50px);
  }

  @keyframes glow_rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const GlowCardContent = styled.div<{ $bg: string }>`
  position: relative;
  z-index: 1;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  overflow: hidden;

  /* Soft inner glow on hover */
  &::before {
    opacity: 0;
    transition: opacity 300ms;
    content: "";
    display: block;
    background: white;
    width: 5px;
    height: 50px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    filter: blur(50px);
    overflow: hidden;
    pointer-events: none;
  }

  ${GlowCard}:hover &::before {
    opacity: 1;
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */

const STAGGER_DELAY = 200; // ms between cards

/**
 * AboutBento — Bento-grid impact block.
 * Rendered inside the #about section, directly below the existing
 * manifesto + rotating-card content.
 *
 * NOTE: previously showed "120+ Workflows Automated" / "94% Retention".
 * Those figures were not backed by verifiable RF data and were replaced
 * with honest capability statements per client review. If verified
 * metrics and real client proof (examples, logos, testimonials) become
 * available, they can be restored here.
 */
export function AboutBento() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);
  const reducedMotion = usePrefersReducedMotion();

  // Fade-up style helper: returns inline styles for staggered fade-in
  const fadeUpStyle = useCallback(
    (index: number): React.CSSProperties => {
      if (reducedMotion) return {};
      if (!inView) return { opacity: 0, transform: "translateY(16px)" };
      return {
        opacity: 1,
        transform: "translateY(0)",
        transition: `opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * STAGGER_DELAY}ms, transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * STAGGER_DELAY}ms`,
      };
    },
    [inView, reducedMotion],
  );

  // For stat/detail cards we also apply stagger to the card wrapper
  const cardEntryStyle = useCallback(
    (index: number): React.CSSProperties => {
      if (reducedMotion) return {};
      if (!inView) return { opacity: 0, transform: "translateY(16px)" };
      return {
        opacity: 1,
        transform: "translateY(0)",
        transition: `opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * STAGGER_DELAY}ms, transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * STAGGER_DELAY}ms`,
      };
    },
    [inView, reducedMotion],
  );

  return (
    <div className="mt-20 md:mt-28" ref={sectionRef}>
      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ─── Feature Card (large, spans 2 cols × 2 rows) ─── */}
        <GlowCard
          $bg="#1A1414"
          $glowColors="linear-gradient(#E63946, #FF9B8A)"
          className="md:col-span-2 md:row-span-2"
          style={fadeUpStyle(0)}
        >
          <GlowCardContent
            $bg="#1A1414"
            className="p-10 md:p-12 flex flex-col justify-between group"
          >
            {/* Decorative background shape */}
            <svg
              width="377"
              height="368"
              className="w-[420px] absolute -bottom-16 -right-16 opacity-[0.07] transition-opacity duration-[600ms] ease-out group-hover:opacity-[0.12]"
              viewBox="0 0 377 368"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M179.692 5.79814C182.635 -1.93287 193.572 -1.93285 196.515 5.79816L229.505 92.466C231.206 96.9342 236.103 99.2928 240.657 97.8366L328.986 69.5929C336.865 67.0735 343.684 75.6242 339.474 82.7452L292.284 162.574C289.851 166.69 291.061 171.99 295.038 174.642L372.192 226.091C379.075 230.68 376.641 241.343 368.449 242.491L276.613 255.369C271.878 256.033 268.489 260.283 268.895 265.047L276.776 357.445C277.479 365.688 267.625 370.433 261.619 364.744L194.293 300.973C190.821 297.686 185.386 297.686 181.914 300.973L114.588 364.744C108.582 370.433 98.7281 365.688 99.4311 357.445L107.312 265.047C107.718 260.283 104.329 256.033 99.5941 255.369L7.7582 242.491C-0.433812 241.343 -2.86746 230.68 4.01488 226.091L81.1687 174.642C85.1465 171.99 86.3561 166.69 83.9231 162.574L36.7325 82.7452C32.523 75.6242 39.342 67.0735 47.2212 69.5929L135.55 97.8366C140.104 99.2928 145.001 96.9342 146.702 92.4659L179.692 5.79814Z"
                fill="#E63946"
              />
            </svg>

            {/* Content */}
            <div className="space-y-5 relative z-10">
              <span
                className="inline-flex px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ backgroundColor: "#E63946", color: "#0A0A0A" }}
              >
                Signal, Not Noise
              </span>

              <h3
                className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]"
                style={{ color: "#F5F1EC" }}
              >
                BUILT TO RUN
                <br />
                QUIETLY.
              </h3>
            </div>

            <div className="mt-10 md:mt-12 relative z-10">
              <p
                className="text-base md:text-lg leading-relaxed max-w-sm"
                style={{ color: "rgba(245, 241, 236, 0.7)" }}
              >
                We build automation around the repeatable work your team
                already does&nbsp;&mdash; so hours go back to decisions that
                actually need a person.
              </p>
            </div>
          </GlowCardContent>
        </GlowCard>

        {/* ─── Attribute Card (top-right, medium) ─── */}
        <GlowCard
          $bg="#E63946"
          $glowColors="linear-gradient(#F5F1EC, #FFFFFF)"
          style={cardEntryStyle(1)}
        >
          <GlowCardContent
            $bg="#E63946"
            className="p-10 flex flex-col justify-between"
          >
            <span
              className="text-[11px] font-bold uppercase tracking-[0.15em]"
              style={{ color: "rgba(10, 10, 10, 0.7)" }}
            >
              How we build
            </span>

            <div className="space-y-2 mt-6">
              <span
                className="text-4xl md:text-[2.75rem] font-bold tracking-tight leading-[1.05]"
                style={{ color: "#0A0A0A" }}
              >
                Workflow-first
              </span>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(10, 10, 10, 0.65)" }}
              >
                Every automation is shaped around a process you already run.
              </p>
            </div>
          </GlowCardContent>
        </GlowCard>

        {/* ─── Detail Card (small, next to attribute card) ─── */}
        <GlowCard
          $bg="#1A1414"
          $glowColors="linear-gradient(#E63946, #FF9B8A)"
          style={cardEntryStyle(2)}
        >
          <GlowCardContent
            $bg="#1A1414"
            className="p-10 flex flex-col justify-center gap-4"
          >
            <div
              className="size-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#5C1A1A" }}
            >
              <Activity className="size-5" style={{ color: "#FF9B8A" }} />
            </div>
            <h4
              className="text-xl font-bold leading-tight"
              style={{ color: "#F5F1EC" }}
            >
              Human-in-the-loop
            </h4>
            <p
              className="text-xs"
              style={{ color: "rgba(245, 241, 236, 0.45)" }}
            >
              Judgment calls stay with your team.
            </p>
          </GlowCardContent>
        </GlowCard>

        {/* ─── Full-width CTA Card (bottom, spans both columns) ─── */}
        <GlowCard
          $bg="#E63946"
          $glowColors="linear-gradient(#F5F1EC, #FFFFFF)"
          className="md:col-span-2"
          style={fadeUpStyle(3)}
          as={Link}
          href="/book-a-demo"
        >
          <GlowCardContent
            $bg="#E63946"
            className="p-6 md:p-8 flex items-center justify-between group/cta"
          >
            <div className="space-y-1 relative z-10">
              <h4
                className="text-2xl md:text-3xl font-bold uppercase tracking-tight"
                style={{ color: "#0A0A0A" }}
              >
                See It in Action
              </h4>
              <p style={{ color: "rgba(10, 10, 10, 0.65)" }}>
                Book a demo and watch RF handle your workflow live.
              </p>
            </div>

            <div
              className="size-16 md:size-20 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover/cta:scale-105"
              style={{ backgroundColor: "#0A0A0A" }}
            >
              <ArrowRight
                className="size-6 md:size-7 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
                style={{ color: "#F5F1EC" }}
              />
            </div>
          </GlowCardContent>
        </GlowCard>
      </div>
    </div>
  );
}

export default AboutBento;
