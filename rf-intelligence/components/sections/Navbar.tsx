"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  useNavVisibility,
} from "@/components/ui/resizable-navbar";

const NAV_ITEMS = [
  { name: "Home",         link: "/"            },
  { name: "About RF",     link: "/#about"      },
  { name: "Services",     link: "/#services"   },
  { name: "Why RF",       link: "/#why-rf"     },
  { name: "Benefits",     link: "/#benefits"   },
  { name: "How It Works", link: "/#how-it-works"},
];

/**
 * Scroll-spy: returns the nav link whose section is currently in view.
 * Sections are detected via their anchor elements (e.g. #why-rf); the
 * item becomes active once its anchor crosses 35% of the viewport height.
 * On dedicated pages (e.g. /benefits), the matching item stays active.
 */
function useActiveLink(items: { name: string; link: string }[]) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const compute = () => {
      const pathname = window.location.pathname;
      const threshold = window.innerHeight * 0.35;
      let current = "";

      for (const item of items) {
        const [path, hash] = item.link.split("#");

        if (!hash) {
          // Plain route (e.g. "/") — active only at the top of the page
          if (item.link === pathname && window.scrollY < threshold) {
            current = item.link;
          }
          continue;
        }

        if (path && path !== "/" && pathname !== path) continue;

        const el = document.getElementById(hash);
        if (el && el.getBoundingClientRect().top <= threshold) {
          current = item.link;
        }
      }

      setActive(current);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [items]);

  return active;
}

/**
 * "Book Demo For Free" primary CTA button — used in both desktop NavBody
 * and mobile menu. Transparent at rest, fills #CF4240 on hover, and
 * "Free" within the label underlines on hover.
 */
function BookDemoCTA({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link href="/book-a-demo" onClick={onClick} className={className}>
      <NavbarButton variant="primary">
        {/* Split label so "Free" can be individually underlined on hover */}
        <span>Book Demo For&nbsp;</span>
        <span className="group-hover:underline underline-offset-2">Free</span>
      </NavbarButton>
    </Link>
  );
}

export function RFNavbar() {
  const visible = useNavVisibility();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLink = useActiveLink(NAV_ITEMS);

  return (
    <Navbar>
      {/* ── Desktop nav (pill that shrinks on scroll) ── */}
      <NavBody visible={visible} className="max-w-[1440px] mx-auto">
        <NavbarLogo />
        <NavItems
          items={NAV_ITEMS}
          activeLink={activeLink}
          onItemClick={() => setMobileOpen(false)}
        />
      </NavBody>

      {/* ── Mobile nav ── */}
      <MobileNav visible={visible}>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.link === activeLink;
            return (
              <Link
                key={item.link}
                href={item.link}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "block px-4 py-3.5 rounded-xl",
                  "text-[var(--font-size-lg)] font-medium",
                  isActive
                    ? "text-[#FA504D] bg-[var(--surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]",
                  "transition-colors duration-150",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                ].join(" ")}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="pt-5 mt-2 border-t border-[var(--border)]">
            <BookDemoCTA
              className="w-full"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
