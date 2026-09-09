"use client";

import Link from "next/link";
import Image from "next/image";

export interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  ariaLabel?: string;
}

const sizeConfig = {
  sm: { width: 28, height: 28, fontSize: "text-sm", gap: "gap-2" },
  md: { width: 36, height: 36, fontSize: "text-base", gap: "gap-2.5" },
  lg: { width: 48, height: 48, fontSize: "text-lg", gap: "gap-3" },
} as const;

export function Logo({
  href = "/",
  size = "md",
  showText = true,
  className = "",
  ariaLabel = "RF Intelligence — home",
}: LogoProps) {
  const { width, height, fontSize, gap } = sizeConfig[size];

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`flex items-center ${gap} shrink-0 ${className}`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={width}
        height={height}
        className={`w-[${width}px] h-[${height}px] object-contain`}
        priority
      />
      {showText && (
        <span className={`group flex items-baseline gap-0 font-semibold tracking-tight ${fontSize} leading-none select-none`}>
          <span className="transition-colors duration-200 group-hover:text-[var(--color-red-100)] text-[var(--color-text-primary)]">
            RF
          </span>
          <span className="ml-[0.18em] text-[var(--color-text-primary)]">
            Intelligence
          </span>
        </span>
      )}
    </Link>
  );
}

export default Logo;