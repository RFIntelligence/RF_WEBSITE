// Services page — scrollable: intro header → interactive services showcase → CTA
import Link from "next/link";
import { RFNavbar } from "@/components/sections/Navbar";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { SweepButton } from "@/components/ui/SweepButton";

export default function ServicesPage() {
  return (
    <>
      <RFNavbar />

      <main>
        {/* ── Intro header — first scroll viewport ── */}
        <section
          aria-labelledby="services-page-heading"
          className="relative min-h-[85vh] w-full flex items-center justify-center px-6 md:px-10"
          style={{ background: "var(--background)" }}
        >
          <div className="w-full max-w-[860px] mx-auto text-center py-32">
            <p
              className="mb-6 text-xs font-medium capitalize tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              / our services
            </p>

            <h1
              id="services-page-heading"
              className="font-semibold tracking-[-0.02em] leading-[1.05] mb-6"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)",
              }}
            >
              Systems that handle the repeatable,
              <span
                className="block"
                style={{
                  background:
                    "linear-gradient(to right, #F24E4B 0%, #CF4240 55%, #692220 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                so you handle the decisions.
              </span>
            </h1>

            <p
              className="max-w-xl mx-auto text-base md:text-lg leading-relaxed mb-10"
              style={{ color: "var(--text-secondary)" }}
            >
              Five ways we build the intelligence layer — from automating
              single workflows to wiring your entire stack into one coherent
              system. Scroll down and hover a service to see what&apos;s
              inside.
            </p>

            {/* scroll cue */}
            <a
              href="#services-showcase"
              aria-label="Scroll to services"
              className="inline-flex flex-col items-center gap-2 group"
            >
              <span
                className="text-xs uppercase tracking-widest transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Scroll
              </span>
              <span
                aria-hidden="true"
                className="block h-10 w-px origin-top animate-pulse"
                style={{
                  background:
                    "linear-gradient(to bottom, var(--accent), transparent)",
                }}
              />
            </a>
          </div>
        </section>

        {/* ── Interactive services showcase ── */}
        <ServicesShowcase />

        {/* ── CTA band ── */}
        <section
          aria-labelledby="services-cta-heading"
          className="w-full border-t px-6 md:px-12 py-24 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2
            id="services-cta-heading"
            className="font-semibold tracking-[-0.02em] leading-tight mb-4"
            style={{
              color: "var(--text-primary)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            }}
          >
            Not sure where to start?
          </h2>
          <p
            className="max-w-lg mx-auto mb-10 text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            We&apos;ll map your workflows, find the highest-leverage
            automation, and show you a working demo — free.
          </p>
          <Link href="/book-a-demo">
            <SweepButton label="Book Free Demo" defaultIcon="/book.svg" hoverIcon="/book1.svg" />
          </Link>
        </section>
      </main>
    </>
  );
}
