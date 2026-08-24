"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SweepButton } from "@/components/ui/SweepButton";

// Dynamically import the GLSL canvas — avoids SSR, loads asynchronously
const GLSLHills = dynamic(
  () => import("@/components/canvas/GLSLHills").then((m) => m.GLSLHills),
  {
    ssr: false,
    loading: () => (
      // CSS fallback while the Three.js canvas mounts — black matches the clear color
      <div className="w-full h-full" style={{ background: "#000000" }} aria-hidden="true" />
    ),
  },
);

const FADE_UP = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const STAGGER = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

export function Hero() {
  const [reducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      // Background colour is black — canvas is transparent, page bg shows through
      style={{ background: "#000000" }}
    >
      {/* ── GLSL hills canvas — full section background ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <GLSLHills className="w-full h-full" />
      </div>

      {/* ── Hero content — centered ── */}
      <div className="relative z-10 w-full max-w-[860px] mx-auto px-6 md:px-10 py-32 flex flex-col items-center text-center">
        <motion.div
          className="w-full"
          variants={reducedMotion ? {} : STAGGER}
          initial="initial"
          animate="animate"
        >
          {/* H1 */}
          <motion.h1
            id="hero-headline"
            variants={reducedMotion ? {} : FADE_UP}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="font-semibold tracking-[-0.02em] leading-[1.05] mb-6 text-[var(--text-primary)]"
            style={{ fontSize: "clamp(2.75rem, 6vw, 5.5rem)" }}
          >
            {/* First line — solid off-white */}
            <span className="block">The Intelligence Layer Behind</span>

            {/* "Modern Business." — gradient: white 0%→25%, then red shades to red-500 */}
            <span
              aria-label="Modern Business."
              className="block"
              style={{
                background:
                  "linear-gradient(to right, #F5F5F0 0%, #F5F5F0 25%, #FA504D 45%, #CF4240 70%, #692220 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                // Prevent text from being invisible if background-clip unsupported
                color: "#F5F5F0",
              }}
            >
              Modern Business.
            </span>
          </motion.h1>

          {/* Supporting paragraph — shortened, no em dash */}
          <motion.p
            variants={reducedMotion ? {} : FADE_UP}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-[var(--text-secondary)] leading-[1.6] mb-10 max-w-[600px] mx-auto"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
          >
            RF Intelligence turns repetitive operational work into automated
            systems — so your team spends less time on tasks and more time on
            decisions that matter.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={reducedMotion ? {} : FADE_UP}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-8"
          >
            <Link href="/book-a-demo">
              <SweepButton
                label="Book Free Demo"
                defaultIcon="/book.svg"
                hoverIcon="/book1.svg"
              />
            </Link>

            <Link href="/how-it-works">
              <SweepButton
                label="See How It Works"
                defaultIcon="/explore.svg"
                hoverIcon="/explore1.svg"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span
            className="text-[rgba(245,245,240,0.5)] text-xs tracking-widest uppercase"
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-8"
            style={{
              background: "linear-gradient(to bottom, rgba(245,245,240,0.6), transparent)",
            }}
          />
        </motion.div>
      )}
    </section>
  );
}
