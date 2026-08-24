"use client";

/**
 * how-it-works — pinned-note step cards on an animated dashed path.
 * Integrated from the provided component spec, restyled to RF tokens:
 *
 *  - The site theme is attribute-based (`data-theme="dark"`), not `.dark`
 *    class based — hardcoded white/black + `dark:` utilities replaced with
 *    semantic tokens (--background, --surface-elevated, --text-*).
 *  - colorTheme "orange" | "blue" | "purple" is kept for API compatibility,
 *    but renders three tints of the single brand red family per
 *    requirements/design.md §3 (one accent hue, no rainbow palette).
 *  - Handwriting font replaced with the mono token (design.md §4 —
 *    monospace step numbers reinforce the technical feel).
 */

import React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

/* Brand-red family tints mapped onto the original theme names */
const THEME_TINTS = {
  orange: {
    bg: "rgba(250, 80, 77, 0.07)", /* red-50 #FA504D */
    text: "#FA504D",
    border: "rgba(250, 80, 77, 0.28)",
  },
  blue: {
    bg: "rgba(255, 155, 138, 0.07)", /* salmon highlight tint */
    text: "#FF9B8A",
    border: "rgba(255, 155, 138, 0.28)",
  },
  purple: {
    bg: "rgba(207, 66, 64, 0.10)", /* red-200 #CF4240 */
    text: "#E06A67",
    border: "rgba(207, 66, 64, 0.32)",
  },
} as const;

const MONO = "var(--font-geist-mono, ui-monospace, monospace)";

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className,
  rotate,
  colors: customColors,
}: CardProps) => {
  const tint = THEME_TINTS[colorTheme];
  const bgColor = customColors?.bg || tint.bg;
  const textColor = customColors?.text || tint.text;
  const borderColor = customColors?.border || tint.border;

  return (
    <div
      className={`relative w-full md:w-[280px] transition-transform duration-300 hover:z-30 hover:scale-105 ${rotate} ${className}`}
    >
      <div
        className="p-2 rounded-[25px] border"
        style={{
          background: "var(--surface-elevated)",
          borderColor: "var(--border-strong)",
          boxShadow: "0px 14px 34px rgba(0, 0, 0, 0.45)",
          color: textColor,
        }}
      >
        <Pin className="w-8 h-8 z-20 mb-6 mx-auto" />
        <div
          className="border rounded-[15px] p-[15px] h-full flex flex-col relative overflow-hidden"
          style={{
            background: bgColor,
            borderColor: borderColor,
          }}
        >
          <span
            className={`text-4xl mb-5`}
            style={{ fontFamily: MONO, color: textColor }}
          >
            {number}
          </span>
          <h3
            className="text-2xl font-semibold leading-none mb-[10px]"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          <p
            className="text-sm/5 tracking-tight"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-8" },
  {
    className: "md:absolute md:top-[120px] md:right-[15%]",
    rotate: "-rotate-8",
  },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "rotate-8" },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "-rotate-8",
  },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "rotate-8" },
];

export default function HowItWorks({
  features,
  className,
  stepPositions,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Create Account",
      description:
        "Sign up in minutes. Enter your details and verify your email to get started.",
      colorTheme: "orange",
    },
    {
      title: "Verify Identity",
      description:
        "Complete your profile verification to ensure secure transactions and compliance.",
      colorTheme: "blue",
    },
    {
      title: "Select Plan",
      description:
        "Choose from a variety of investment plans tailored to your financial goals.",
      colorTheme: "purple",
    },
    {
      title: "Analyze & Invest",
      description:
        "Review returns and make your first investment with confidence.",
      colorTheme: "orange",
    },
    {
      title: "Track Growth",
      description:
        "Monitor your portfolio in real-time and watch your wealth grow over time.",
      colorTheme: "blue",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  let height = 1130;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 450;
  else if (data.length === 3) height = 800;
  else if (data.length === 4) height = 900;
  else height = 1130;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`max-md:pt-10 max-md:pb-25 md:py-20 px-8 relative ${className}`}
        style={{ background: "var(--background)" }}
      >
        {/* Notebook rule lines — light-on-dark hairlines */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245, 241, 236, 0.9) 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
        />

        {/* Edge fades into the page background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--background), transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
          style={{
            backgroundImage:
              "linear-gradient(to left, var(--background), transparent)",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div
            className="relative w-full max-w-[1000px] mx-auto flex flex-col space-y-8 md:space-y-0 md:block h-auto md:h-[var(--md-height)]"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            {data.length > 1 && (
              <svg
                aria-hidden="true"
                className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
                viewBox={`0 0 1000 ${height}`}
                preserveAspectRatio="none"
              >
                {(() => {
                  const pathD = data.reduce((acc, _, index) => {
                    if (index >= data.length - 1) return acc;
                    if (index === 0)
                      return "M 290 150 C 500 150, 550 270, 710 270"; // 1 -> 2
                    if (index === 1)
                      return acc + " C 850 270, 500 350, 290 450"; // 2 -> 3
                    if (index === 2)
                      return acc + " C 290 600, 550 720, 750 720"; // 3 -> 4
                    if (index === 3)
                      return acc + " C 950 720, 500 800, 290 850"; // 4 -> 5
                    return acc;
                  }, "");
                  return (
                    <m.path
                      d={pathD}
                      stroke="rgba(245, 241, 236, 0.22)"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{
                        strokeDashoffset: -140, // Multiple of 14 (8+6) for seamless loop
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  );
                })()}
              </svg>
            )}

            {data.map((step, index) => {
              const position = positions[index % positions.length];

              return (
                <Card
                  key={step.title}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "blue"}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
