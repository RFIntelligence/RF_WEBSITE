"use client";

import React, { useState } from "react";
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

  return (
    <Navbar>
      {/* ── Desktop nav (pill that shrinks on scroll) ── */}
      <NavBody visible={visible} className="max-w-[1440px] mx-auto">
        <NavbarLogo />
        <NavItems
          items={NAV_ITEMS}
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
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={() => setMobileOpen(false)}
              className={[
                "block px-4 py-3.5 rounded-xl",
                "text-[var(--font-size-lg)] font-medium",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                "hover:bg-[var(--surface)]",
                "transition-colors duration-150",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              ].join(" ")}
            >
              {item.name}
            </Link>
          ))}

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
