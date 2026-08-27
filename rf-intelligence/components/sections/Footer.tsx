import Link from "next/link";
import Image from "next/image";
import { IconBrandLinkedin, IconMail } from "@tabler/icons-react";
import { SplineScene } from "@/components/ui/splite";

/**
 * Footer — brand details + founder contact on the left, interactive
 * Spline robot on the right. Links confirmed by client:
 *  - Company LinkedIn: https://www.linkedin.com/company/rfintelligence/
 *  - Founder LinkedIn: https://www.linkedin.com/in/avinash-gantotti-669b83243/
 *  - Email: Intelligencerf@gmail.com
 */

const COMPANY_LINKEDIN = "https://www.linkedin.com/company/rfintelligence/";
const FOUNDERS_LINKEDIN =
  "https://www.linkedin.com/in/avinash-gantotti-669b83243/";
const CONTACT_EMAIL = "Intelligencerf@gmail.com";

const MAILTO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Automation Enquiry — RF Intelligence",
)}&body=${encodeURIComponent(
  "Hi RF Intelligence team,\n\nI'd like to learn more about how RF could help automate our workflows.\n\nCompany: \nWhat we'd like to automate: \n\nThanks,\n",
)}`;

const LEGAL_LINKS = [
  { name: "Privacy Policy", href: "/legal/privacy-policy" },
  { name: "Terms of Service", href: "/legal/terms-of-service" },
];

const ROBOT_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export function Footer() {
  return (
    <footer
      className="w-full border-t px-6 md:px-12 pt-16 pb-10"
      style={{ background: "#05060A", borderColor: "var(--border)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* ── Left: company details ── */}
          <div className="flex flex-col justify-center gap-8 py-4">
            <div>
              <p
                className="font-semibold tracking-tight mb-3 m-0"
                style={{ fontSize: "1.5rem", color: "#F5F1EC" }}
              >
                RF Intelligence
              </p>
              <p
                className="max-w-[46ch] text-sm md:text-base leading-relaxed m-0"
                style={{ color: "rgba(245, 241, 236, 0.6)" }}
              >
                An AI automation company building the intelligence layer
                behind modern business operations.
              </p>
            </div>

            {/* Founders */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {/* Avinash Gantotti */}
              <div className="flex items-center gap-4">
                <Image
                  src="/founder.png"
                  alt="Avinash Gantotti — Co-Founder, RF Intelligence"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                  style={{
                    width: "64px",
                    height: "64px",
                    objectFit: "cover",
                    border: "1px solid var(--border-strong)",
                  }}
                />
                <div>
                  <p
                    className="font-medium m-0"
                    style={{ fontSize: "1rem", color: "#F5F1EC" }}
                  >
                    Avinash Gantotti
                  </p>
                  <p
                    className="text-xs m-0 mt-1 uppercase tracking-[0.15em]"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-geist-mono, monospace)",
                    }}
                  >
                    Co-Founder
                  </p>
                </div>
              </div>

              {/* Sharan George */}
              <div className="flex items-center gap-4">
                <Image
                  src="/founder1.png"
                  alt="Sharan George — Co-Founder, RF Intelligence"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                  style={{
                    width: "64px",
                    height: "64px",
                    objectFit: "cover",
                    border: "1px solid var(--border-strong)",
                  }}
                />
                <div>
                  <p
                    className="font-medium m-0"
                    style={{ fontSize: "1rem", color: "#F5F1EC" }}
                  >
                    Sharan George
                  </p>
                  <p
                    className="text-xs m-0 mt-1 uppercase tracking-[0.15em]"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-geist-mono, monospace)",
                    }}
                  >
                    Co-Founder
                  </p>
                </div>
              </div>
            </div>

            {/* Contact actions */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={FOUNDERS_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 hover:opacity-90"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                }}
              >
                Talk to Founders
              </a>

              <a
                href={MAILTO_HREF}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-[rgba(242,78,75,0.08)]"
                style={{
                  border: "1px solid var(--border-strong)",
                  color: "#F5F1EC",
                }}
              >
                <IconMail className="size-4" style={{ color: "var(--accent)" }} />
                Gmail
              </a>

              <a
                href={COMPANY_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RF Intelligence on LinkedIn"
                className="inline-flex items-center justify-center size-10 rounded-md transition-colors duration-200 hover:bg-[rgba(242,78,75,0.08)]"
                style={{ border: "1px solid var(--border-strong)" }}
              >
                <IconBrandLinkedin className="size-4" style={{ color: "#F5F1EC" }} />
              </a>
            </div>

            <p
              className="text-sm m-0"
              style={{ color: "rgba(245, 241, 236, 0.5)" }}
            >
              Thank you for visiting.
            </p>
          </div>

          {/* ── Right: interactive robot — blends into the footer bg ── */}
          <div className="relative h-[440px] lg:h-[540px] overflow-hidden">
            <SplineScene
              scene={ROBOT_SCENE}
              className="w-full h-full scale-125 translate-y-10"
            />
            {/* edge fade so the scene melts into the footer background */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "radial-gradient(ellipse 78% 72% at 50% 46%, transparent 52%, #05060A 98%)",
              }}
            />
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-6 pt-6 border-t flex flex-wrap items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="m-0 text-xs" style={{ color: "rgba(245, 241, 236, 0.4)" }}>
            © 2026 RF Intelligence. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex items-center gap-6">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs transition-colors hover:text-[#F5F1EC]"
                style={{ color: "rgba(245, 241, 236, 0.5)" }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
