import type { Metadata } from "next";
import Link from "next/link";
import { RFNavbar } from "@/components/sections/Navbar";
import { HIW_STAGES } from "@/components/sections/HowItWorksSection";
import HowItWorks from "@/components/ui/how-it-works";
import { SweepButton } from "@/components/ui/SweepButton";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "From discovery to optimisation — how RF Intelligence turns repetitive operational workflows into intelligent, automated systems.",
};

export default function HowItWorksPage() {
  return (
    <div className="w-full bg-[var(--background)] text-[var(--text-primary)]">
      <RFNavbar />

      {/* ── Heading block ── */}
      <section
        aria-labelledby="hiw-headline"
        className="relative w-full flex flex-col items-center text-center px-6 md:px-10 pt-40 md:pt-52 pb-4"
      >
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
        <h1
          id="hiw-headline"
          className="font-semibold tracking-[-0.02em] leading-[1.05] m-0 mb-6"
          style={{ fontSize: "clamp(2.75rem, 6vw, 5.5rem)" }}
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
        </h1>
        <p
          className="max-w-[600px] m-0 leading-[1.6] text-[var(--text-secondary)]"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
        >
          Five deliberate stages take a workflow from first conversation to a
          system that runs on its own — with people in control where judgment
          matters.
        </p>
      </section>

      {/* ── Pinned-note step cards ── */}
      <HowItWorks features={HIW_STAGES} />

      {/* ── CTA ── */}
      <section
        aria-label="Book a demo"
        className="w-full flex flex-col items-center text-center gap-8 px-6 py-24"
        style={{
          background:
            "radial-gradient(55% 65% at 50% 100%, rgba(242, 78, 75, 0.09), transparent 70%)",
        }}
      >
        <h2
          className="font-semibold tracking-tight m-0"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
        >
          See it run on your workflow.
        </h2>
        <p
          className="max-w-[46ch] m-0 leading-relaxed text-[var(--text-secondary)]"
        >
          Bring one process — orders, invoices, follow-ups — and we&apos;ll map
          how RF would automate it end-to-end. Free, no commitment.
        </p>
        <Link href="/#contact">
          <SweepButton label="Book Free Demo" defaultIcon="/book.svg" hoverIcon="/book1.svg" />
        </Link>
      </section>
    </div>
  );
}
