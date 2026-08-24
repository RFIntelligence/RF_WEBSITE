import React from "react";
import Link from "next/link";
import HowItWorks, { type Step } from "@/components/ui/how-it-works";

/**
 * How It Works — five delivery stages (requirements.md §8.8 / §13).
 * Shared by the dedicated /how-it-works page and the homepage scroll
 * section (#how-it-works), so both stay in sync.
 */
export const HIW_STAGES: Step[] = [
  {
    title: "Discover",
    description:
      "We map how the work actually flows through your business today — every handoff, exception and workaround.",
    colorTheme: "orange" as const,
  },
  {
    title: "Analyse",
    description:
      "We identify where intelligence earns its keep — and where plain automation is enough.",
    colorTheme: "blue" as const,
  },
  {
    title: "Design",
    description:
      "We shape the workflow around your approvals, systems and edge cases. Never the other way around.",
    colorTheme: "purple" as const,
  },
  {
    title: "Deploy",
    description:
      "We connect your existing tools and run the workflow live, with humans in the loop where judgment matters.",
    colorTheme: "orange" as const,
  },
  {
    title: "Optimise",
    description:
      "Every run produces evidence. We use it to tighten rules, thresholds and routing over time.",
    colorTheme: "blue" as const,
  },
];

export function HowItWorksSection({
  cta = false,
}: {
  /** Show a link to the dedicated /how-it-works page */
  cta?: boolean;
}) {
  return (
    <section aria-labelledby="hiw-section-headline">
      {/* ── Heading block ── */}
      <div className="flex flex-col items-center text-center px-6 md:px-10 pt-24 md:pt-32 pb-4">
        <p
          className="text-xs font-medium uppercase m-0 mb-5"
          style={{
            color: "var(--accent)",
            letterSpacing: "0.2em",
            fontFamily: "var(--font-geist-mono, ui-monospace, monospace)",
          }}
        >
          How It Works
        </p>
        <h2
          id="hiw-section-headline"
          className="font-semibold tracking-[-0.02em] leading-[1.05] m-0 mb-6"
          style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)" }}
        >
          From Manual To
          <span
            className="block"
            style={{
              background:
                "linear-gradient(to right, #F5F5F0 0%, #F5F5F0 25%, #FA504D 45%, #CF4240 70%, #692220 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "#F5F5F0",
            }}
          >
            Autonomous.
          </span>
        </h2>
        <p
          className="max-w-[600px] m-0 leading-[1.6] text-[var(--text-secondary)]"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
        >
          Five deliberate stages take a workflow from first conversation to a
          system that runs on its own — with people in control where judgment
          matters.
        </p>
      </div>

      {/* ── Pinned-note step cards ── */}
      <HowItWorks features={HIW_STAGES} />

      {cta && (
        <div className="w-full flex justify-center px-6 pb-24 -mt-6">
          <Link
            href="/how-it-works"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-[rgba(242,78,75,0.08)] cursor-pointer"
            style={{
              fontFamily: "var(--font-geist-mono, ui-monospace, monospace)",
              color: "var(--accent)",
              border: "1px solid rgba(242, 78, 75, 0.45)",
            }}
          >
            Explore the full process
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}

export default HowItWorksSection;
