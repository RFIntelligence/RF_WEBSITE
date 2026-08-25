"use client";

/**
 * Aceternity Resizable Navbar — native implementation.
 *
 * The @aceternity/resizable-navbar package is a shadcn registry component
 * (not a published npm package). This file reproduces its exact API and
 * behavior based on the official documentation, props spec, and demo code
 * at ui.aceternity.com/components/resizable-navbar.
 *
 * Scroll behavior: the NavBody shrinks in width (from ~90vw to ~60vw) and
 * gains a frosted-glass pill shape once the user scrolls past a threshold —
 * that "resizing" is the component's signature interaction.
 *
 * Dependencies: framer-motion (already installed), @tabler/icons-react.
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavItem {
  name: string;
  link: string;
}

// ── Navbar (root wrapper) ─────────────────────────────────────────────────────

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

export function Navbar({ children, className = "" }: NavbarProps) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 w-full ${className}`}
      role="banner"
    >
      {children}
    </div>
  );
}

// ── NavBody (desktop pill that shrinks on scroll) ─────────────────────────────

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

export function NavBody({ children, className = "", visible = false }: NavBodyProps) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial={{ width: "100%", y: -80, opacity: 0 }}
        animate={{
          width: visible ? "62%" : "100%",
          y: 0,
          opacity: 1,
          borderRadius: visible ? "9999px" : "0px",
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: visible
            ? "rgba(5,6,10,0.82)"
            : "transparent",
          backdropFilter: visible ? "blur(12px)" : "none",
          borderBottom: visible ? "none" : "1px solid transparent",
          // Pill shadow only when shrunk
          boxShadow: visible ? "0 4px 32px rgba(0,0,0,0.28)" : "none",
          margin: visible ? "12px auto 0" : "0 auto",
          border: visible ? "1px solid rgba(245,245,240,0.10)" : "1px solid transparent",
        }}
        className={[
          // 3-zone layout: logo left | links centered | nothing right
          // Use grid so the center zone is truly viewport-centered
          "hidden lg:grid",
          "grid-cols-[auto_1fr_auto]",
          "items-center",
          "px-6 h-[64px]",
          "transition-shadow",
          className,
        ].join(" ")}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ── NavItems ──────────────────────────────────────────────────────────────────

interface NavItemsProps {
  items: NavItem[];
  className?: string;
  onItemClick?: () => void;
  /** Link whose section is currently in view — wears the hover state */
  activeLink?: string;
}

export function NavItems({
  items,
  className = "",
  onItemClick,
  activeLink = "",
}: NavItemsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  // The active item rests in the hover state whenever nothing else is hovered
  const activeIdx = activeLink
    ? items.findIndex((item) => item.link === activeLink)
    : -1;
  const effective = hovered ?? activeIdx;

  return (
    <ul
      role="list"
      // justify-self-center keeps the link group in the true center of the grid column
      className={`flex items-center gap-1 justify-self-center ${className}`}
      onMouseLeave={() => setHovered(null)}
    >
      {items.map((item, idx) => {
        // "About RF" and "Why RF": only "RF" turns #FA504D on hover.
        const splitRF = item.name === "About RF" || item.name === "Why RF";
        const parts = splitRF ? item.name.split(" ") : null;
        const isActive = effective === idx;

        return (
          <li key={item.link} className="relative">
            <Link
              href={item.link}
              onClick={onItemClick}
              onMouseEnter={() => setHovered(idx)}
              aria-current={idx === activeIdx ? "true" : undefined}
              className={[
                "relative px-3.5 py-2 rounded-full",
                "text-[0.9375rem] font-medium leading-none",
                "transition-colors duration-200",
                !splitRF
                  ? isActive
                    ? "text-[#FA504D]"
                    : "text-[var(--text-secondary)] hover:text-[#FA504D]"
                  : "text-[var(--text-secondary)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                // group so child spans react to the link's hover state
                splitRF ? "group" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Animated hover background pill — rests on the active item */}
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-[var(--surface-elevated)]"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {splitRF && parts ? (
                <>
                  {/* First word: stays default color always */}
                  <span>{parts[0]}&nbsp;</span>
                  {/* "RF": turns #FA504D on hover or while its section is active */}
                  <span
                    className={[
                      "transition-colors duration-200 group-hover:text-[#FA504D]",
                      isActive ? "text-[#FA504D]" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {parts[1]}
                  </span>
                </>
              ) : (
                item.name
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ── NavbarLogo ────────────────────────────────────────────────────────────────

interface NavbarLogoProps {
  className?: string;
}

export function NavbarLogo({ className = "" }: NavbarLogoProps) {
  return (
    <Link
      href="/"
      aria-label="RF Intelligence — home"
      className={`flex items-center gap-2.5 shrink-0 ${className}`}
    >
      <Image
        src="/logo.png"
        alt="RF Intelligence logo"
        width={36}
        height={36}
        className="w-9 h-9 object-contain"
        priority
      />
      {/* "RF" in coral on hover, "Intelligence" stays white */}
      <span className="group flex items-baseline gap-0 font-semibold tracking-tight text-[var(--text-primary)] text-base leading-none select-none">
        <span className="transition-colors duration-200 group-hover:text-[#FA504D]">RF</span>
        <span className="ml-[0.18em]">Intelligence</span>
      </span>
    </Link>
  );
}

// ── NavbarButton ──────────────────────────────────────────────────────────────

interface NavbarButtonProps {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
  onClick?: () => void;
}

export function NavbarButton({
  href,
  as: Tag = href ? "a" : "button",
  children,
  className = "",
  variant = "primary",
  onClick,
}: NavbarButtonProps) {
  const base = [
    "inline-flex items-center justify-center gap-2",
    "px-5 py-2.5",
    "text-[0.9375rem] font-medium leading-none rounded-full",
    "whitespace-nowrap cursor-pointer select-none",
    "transition-all duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2",
  ];

  if (variant === "primary") {
    base.push(
      // Transparent default, #CF4240 on hover — as specified in §4
      "bg-transparent border border-[rgba(245,245,240,0.30)] text-[var(--text-primary)]",
      "hover:bg-[#CF4240] hover:border-[#CF4240]",
      "group", // needed for "Free" underline child
    );
  } else if (variant === "secondary") {
    base.push(
      "bg-transparent text-[var(--text-secondary)] border border-[var(--border-strong)]",
      "hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]",
    );
  } else if (variant === "dark") {
    base.push(
      "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)]",
      "hover:border-[var(--border-strong)]",
    );
  } else {
    // gradient
    base.push(
      "bg-gradient-to-r from-[var(--accent)] to-[var(--red-200)] text-white",
      "hover:opacity-90",
    );
  }

  const props = {
    href: Tag === "a" ? href : undefined,
    onClick,
    className: [...base, className].join(" "),
  };

  if (Tag === "a") {
    return (
      <a {...props}>
        {children}
      </a>
    );
  }

  const Component = Tag as any;
  return (
    <Component {...props}>
      {children}
    </Component>
  );
}

// ── MobileNav (root wrapper for mobile) ──────────────────────────────────────

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

export function MobileNav({ children, className = "", visible = false }: MobileNavProps) {
  return (
    <div
      className={[
        "lg:hidden flex flex-col",
        "transition-[background-color,backdrop-filter] duration-300",
        visible
          ? "bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]"
          : "bg-transparent",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ── MobileNavHeader ───────────────────────────────────────────────────────────

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileNavHeader({ children, className = "" }: MobileNavHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-6 h-[64px] ${className}`}
    >
      {children}
    </div>
  );
}

// ── MobileNavToggle ───────────────────────────────────────────────────────────

interface MobileNavToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileNavToggle({ isOpen, onClick }: MobileNavToggleProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-menu"
      className={[
        "flex items-center justify-center",
        "w-10 h-10 rounded-full",
        "border border-[var(--border)]",
        "text-[var(--text-primary)]",
        "transition-colors duration-150",
        "hover:bg-[var(--surface)] hover:border-[var(--border-strong)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
      ].join(" ")}
    >
      {isOpen ? (
        <IconX size={18} stroke={1.75} aria-hidden="true" />
      ) : (
        <IconMenu2 size={18} stroke={1.75} aria-hidden="true" />
      )}
    </button>
  );
}

// ── MobileNavMenu ─────────────────────────────────────────────────────────────

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavMenu({ children, className = "", isOpen, onClose }: MobileNavMenuProps) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-nav-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={[
            "overflow-hidden",
            "border-t border-[var(--border)]",
            className,
          ].join(" ")}
        >
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-1 px-6 py-6"
          >
            {children}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── useNavVisibility — shared scroll hook ─────────────────────────────────────
// Exported so the consuming Navbar component can pass `visible` into NavBody/MobileNav.

const SCROLL_THRESHOLD = 60;

export function useNavVisibility() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > SCROLL_THRESHOLD);
  });

  return visible;
}

// ── Re-export useRef for callers that want the containerRef pattern ────────────
export { useRef };
