"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { SweepButton } from "@/components/ui/SweepButton";
import { AboutBento } from "@/components/ui/about-bento";

/* ─────────────────────────────────────────────────────────────────────────────
   About RF — Homepage scroll-anchored section
   Two-column: left = bold manifesto text, right = card component with labels
───────────────────────────────────────────────────────────────────────────── */

export function AboutRF() {
  return (
    <section
      id="about"
      aria-labelledby="about-rf-heading"
      className="relative w-full"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* ── Left column: manifesto ── */}
          <div className="flex flex-col gap-5">
            {/* Eyebrow */}
            <span
              className="text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: "#FF9B8A" }}
            >
              About RF
            </span>

            {/* Heading */}
            <h2
              id="about-rf-heading"
              className="font-bold tracking-tight leading-[1.08]"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                color: "#F5F1EC",
              }}
            >
              We find signal in the noise.
            </h2>

            {/* Body paragraph */}
            <p
              className="text-base md:text-[17px] font-normal leading-[1.65] m-0 mt-2 max-w-[520px]"
              style={{ color: "rgba(245, 241, 236, 0.85)" }}
            >
              We started RF Intelligence after watching the same pattern across every team we worked with — smart people spending their time on work that didn&apos;t need their judgment. Approvals, data entry, status checks. So we built the layer that filters it out: automated systems that handle the repeatable work reliably, and surface only what actually needs a human decision.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-5 mt-6">
              <Link href="/book-a-demo">
                <SweepButton
                  label="Book Free Demo"
                  defaultIcon="/book.svg"
                  hoverIcon="/book1.svg"
                />
              </Link>
              <a href="#what-is-rf">
                <SweepButton
                  label="Explore RF Intelligence"
                  defaultIcon="/explore.svg"
                  hoverIcon="/explore1.svg"
                />
              </a>
            </div>
          </div>

          {/* ── Right column: card component ── */}
          <div className="flex flex-col items-center">
            <RotatingCard />
          </div>
        </div>

        {/* ── Bento grid impact section ── */}
        <AboutBento />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Card component — EXACT copy from user spec, unchanged internals
───────────────────────────────────────────────────────────────────────────── */

function RotatingCard() {
  return (
    <StyledWrapper>
      <div className="wrap_card">
        <div className="card">
          <div className="content">
            <span className="card-label">Every source, captured</span>
          </div>
        </div>
        <div className="card">
          <div className="content">
            <span className="card-label">Cleaned, structured, ready</span>
          </div>
        </div>
        <div className="card">
          <div className="content">
            <span className="card-label" style={{ color: "#1A1414" }}>Only what needs you.</span>
          </div>
        </div>
        <div className="lines">
          <div className="line" />
          <div className="line" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .wrap_card {
    position: relative;
    overflow: hidden;
    width: var(--w-wrap-card);
    height: calc(var(--h-card) / 1.25);
    display: flex;
    align-items: center;
    justify-content: center;
    --w-card: 150px;
    --h-card: 200px;
    --rotate-card: 15deg;
    --insetX-card: 28px;
    --t-card: calc(var(--insetX-card) * 1.25);
    --w-wrap-card: calc(var(--w-card) + calc(calc(var(--w-card) / 2) * 2));
  }

  .card-label {
    font-family: 'Stack Sans Text', sans-serif;
    font-size: 19px;
    font-weight: 500;
    letter-spacing: -0.01em;
    text-transform: none;
    line-height: 1.3;
    color: #F5F1EC;
    z-index: 3;
    pointer-events: none;
    text-align: center;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }

  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    overflow: hidden;
    animation: rotating 9s cubic-bezier(0.75, 0, 0, 1.01) infinite 0s;
    border-radius: var(--round);
    background: var(--bg);
    order: var(--order);
    width: var(--w-card);
    height: var(--h-card);
    z-index: var(--z1);
    top: var(--t1);
    left: var(--l1);
    right: var(--r1);
    transform: var(--trans1);
    --pd: 4px;
    --round: 16px;
    --x1: var(--insetX-card);
    --x2: calc(var(--w-wrap-card) - calc(var(--w-card) + var(--insetX-card)));
    --to-left: rotate(calc(var(--rotate-card) * -1));
    --to-center: calc(var(--w-card) / 2);
    --to-right: rotate(calc(var(--rotate-card) * 1));
  }

  .card::before {
    content: "";
    position: absolute;
    width: 60px;
    height: 300px;
    background: linear-gradient(#FFFFFF, #FFFFFF);
    opacity: 0;
    transition: opacity 300ms;
    animation: card_glow_spin 6000ms infinite linear;
    animation-play-state: paused;
  }

  .card::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(40px);
    background: rgba(0, 0, 0, 0.1);
  }

  .wrap_card:hover .card::before {
    opacity: 1;
    animation-play-state: running;
  }

  .content {
    background-color: var(--bg);
    overflow: hidden;
    position: relative;
    width: calc(100% - calc(var(--pd) * 2));
    height: calc(100% - calc(var(--pd) * 2));
    border-radius: calc(var(--round) - var(--pd));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    padding-bottom: 50px;
    z-index: 1;
  }

  @keyframes card_glow_spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .card:nth-child(1) {
    --order: 2;
    --bg: #E63946;
    --z1: 2;
    --t1: 0;
    --l1: var(--to-center);
    --r1: var(--to-center);
    --trans1: rotate(calc(var(--rotate-card) * 0));
    --z2: 0;
    --t2: var(--t-card);
    --l2: var(--x1);
    --r2: var(--x2);
    --trans2: var(--to-left);
    --z3: 0;
    --t3: var(--t-card);
    --l3: var(--x2);
    --r3: var(--x1);
    --trans3: var(--to-right);
  }

  .card:nth-child(2) {
    --order: 3;
    --bg: #5C1A1A;
    --z1: 0;
    --t1: var(--t-card);
    --l1: var(--x2);
    --r1: var(--x1);
    --trans1: var(--to-right);
    --z2: 2;
    --t2: 0;
    --l2: var(--to-center);
    --r2: var(--to-center);
    --trans2: rotate(calc(var(--rotate-card) * 0));
    --z3: 0;
    --t3: var(--t-card);
    --l3: var(--x1);
    --r3: var(--x2);
    --trans3: var(--to-left);
  }

  .card:nth-child(3) {
    --order: 1;
    --bg: #FF9B8A;
    --z1: 0;
    --t1: var(--t-card);
    --l1: var(--x1);
    --r1: var(--x2);
    --trans1: var(--to-left);
    --z2: 0;
    --t2: var(--t-card);
    --l2: var(--x2);
    --r2: var(--x1);
    --trans2: var(--to-right);
    --z3: 2;
    --t3: 0;
    --l3: var(--to-center);
    --r3: var(--to-center);
    --trans3: rotate(calc(var(--rotate-card) * 0));
  }

  @keyframes rotating {
    0%,
    99.99% {
      z-index: var(--z1);
      top: var(--t1);
      left: var(--l1);
      right: var(--r1);
      transform: var(--trans1);
    }
    33.33% {
      z-index: var(--z2);
      top: var(--t2);
      left: var(--l2);
      right: var(--r2);
      transform: var(--trans2);
    }
    66.66% {
      z-index: var(--z3);
      top: var(--t3);
      left: var(--l3);
      right: var(--r3);
      transform: var(--trans3);
    }
  }

  .lines {
    position: absolute;
    inset: auto 0 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4;
  }

  .lines::after {
    content: "";
    width: 100%;
    height: 0px;
    position: absolute;
    z-index: 2;
    inset: 0;
    --mask-bg: #e8e8e8;
    background: var(--mask-bg);
    mask-image: radial-gradient(
      50% 200px at top,
      transparent 20%,
      var(--mask-bg)
    );
  }

  .line {
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .line::before,
  .line::after {
    content: "";
    position: absolute;
    inset: auto;
    background: linear-gradient(
      to right,
      var(--gradient-a-line, #0000),
      var(--gradient-b-line, #0000),
      var(--gradient-c-line, #0000)
    );
    filter: var(--blur-line);
    width: var(--w-line);
    height: var(--h-line);
  }

  .line:nth-child(1)::before {
    --blur-line: blur(4px);
    --w-line: 100%;
    --h-line: 5px;
    --gradient-b-line: #E63946;
  }

  .line:nth-child(1)::after {
    --w-line: 100%;
    --h-line: 1px;
    --gradient-b-line: #FF9B8A;
  }

  .line:nth-child(2)::before {
    --blur-line: blur(4px);
    --w-line: 50%;
    --h-line: 5px;
    --gradient-b-line: #FF9B8A;
  }

  .line:nth-child(2)::after {
    --w-line: 50%;
    --h-line: 1px;
    --gradient-b-line: #E63946;
  }
`;
