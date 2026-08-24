import Link from "next/link";

/**
 * Footer — site footer per client review.
 *
 * UNDEFINED / REQUIRES CLIENT INPUT — the contact email and social URLs
 * below are placeholders pending official RF Intelligence details.
 * Replace CONTACT_EMAIL and SOCIAL_LINKS with real values before launch.
 */

const CONTACT_EMAIL = "contact@rfintelligence.com"; // TODO: confirm with client

const SOCIAL_LINKS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/company/rf-intelligence" }, // TODO: confirm with client
];

const LEGAL_LINKS = [
  { name: "Privacy Policy", href: "/legal/privacy-policy" },
  { name: "Terms of Service", href: "/legal/terms-of-service" },
];

export function Footer() {
  return (
    <footer
      className="w-full border-t px-6 md:px-12 pt-16 pb-10"
      style={{ background: "#05060A", borderColor: "var(--border)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* ── Brand ── */}
          <div className="md:col-span-2">
            <p
              className="font-semibold tracking-tight mb-3"
              style={{ fontSize: "1.25rem", color: "#F5F1EC" }}
            >
              RF Intelligence
            </p>
            <p
              className="max-w-[42ch] text-sm leading-relaxed"
              style={{ color: "rgba(245, 241, 236, 0.55)" }}
            >
              An AI automation company building the intelligence layer behind
              modern business operations.
            </p>
          </div>

          {/* ── Contact ── */}
          <nav aria-label="Contact">
            <p
              className="text-xs font-medium uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono, monospace)" }}
            >
              Contact
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm transition-colors hover:text-[#F5F1EC]"
                  style={{ color: "rgba(245, 241, 236, 0.65)" }}
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              {SOCIAL_LINKS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:text-[#F5F1EC]"
                    style={{ color: "rgba(245, 241, 236, 0.65)" }}
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Legal ── */}
          <nav aria-label="Legal">
            <p
              className="text-xs font-medium uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono, monospace)" }}
            >
              Legal
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-[#F5F1EC]"
                    style={{ color: "rgba(245, 241, 236, 0.65)" }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-14 pt-6 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="m-0 text-xs" style={{ color: "rgba(245, 241, 236, 0.4)" }}>
            © 2026 RF Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
