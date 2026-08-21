"use client";

/**
 * SweepButton — pill button with a left-to-right background sweep on hover.
 *
 * Default: dark neutral background (#212121), white text, icon left.
 * Hover:
 *   - Background sweeps in from left (#FA504D) via ::before scaleX transform.
 *   - Default icon fades out, hover icon fades in (CSS opacity swap, no JS state).
 *   - Text stays white throughout.
 *
 * Accepts: label, defaultIcon, hoverIcon, onClick.
 * Both icons are rendered stacked; visibility toggled by the `group` hover class
 * on the button, so hovering anywhere on the button triggers the swap.
 */

import React from "react";
import Image from "next/image";

interface SweepButtonProps {
  label: string;
  defaultIcon: string;
  hoverIcon: string;
  onClick?: () => void;
}

export function SweepButton({ label, defaultIcon, hoverIcon, onClick }: SweepButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        // Layout
        "group relative inline-flex items-center gap-2",
        "px-[1.4em] py-[0.6em]",
        "rounded-full overflow-hidden",
        // Base background
        "bg-[#212121]",
        // Text
        "text-white text-[15px] font-medium leading-none",
        "whitespace-nowrap cursor-pointer select-none",
        // Active press
        "active:scale-95 transition-transform duration-100",
        // Focus
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FA504D] focus-visible:outline-offset-2",
      ].join(" ")}
      style={{ fontFamily: "inherit" }}
    >
      {/* Sweep fill — scales from left on hover */}
      <span
        aria-hidden="true"
        className={[
          "absolute inset-0 rounded-full",
          "bg-[#FA504D]",
          "origin-left",
          "scale-x-0 group-hover:scale-x-100",
          "transition-transform duration-[400ms] ease-out",
          // Sits below icon + text
          "z-0",
        ].join(" ")}
      />

      {/* Icon container — stacked default / hover icons */}
      <span className="relative z-10 flex-shrink-0 w-5 h-5">
        {/* Default icon — visible at rest, hidden on hover */}
        <Image
          src={defaultIcon}
          alt=""
          width={20}
          height={20}
          aria-hidden="true"
          className="absolute inset-0 w-5 h-5 object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-200"
        />
        {/* Hover icon — hidden at rest, visible on hover */}
        <Image
          src={hoverIcon}
          alt=""
          width={20}
          height={20}
          aria-hidden="true"
          className="absolute inset-0 w-5 h-5 object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </span>

      {/* Label — always white, sits above sweep layer */}
      <span className="relative z-10">{label}</span>
    </button>
  );
}
