"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--accent)] text-[var(--accent-fg)]",
    "border border-[var(--accent)]",
    "hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]",
    "transition-colors duration-[var(--duration-normal)]",
  ].join(" "),

  secondary: [
    "bg-transparent text-[var(--text-primary)]",
    "border border-[var(--border-strong)]",
    "hover:border-[var(--accent)] hover:text-[var(--accent)]",
    "transition-colors duration-[var(--duration-normal)]",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--text-secondary)]",
    "border border-transparent",
    "hover:text-[var(--text-primary)] hover:border-[var(--border)]",
    "transition-colors duration-[var(--duration-normal)]",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-[var(--space-4)] py-[var(--space-2)] text-[var(--font-size-sm)] rounded-[var(--radius-sm)]",
  md: "px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-base)] rounded-[var(--radius-md)]",
  lg: "px-[var(--space-8)] py-[var(--space-4)] text-[var(--font-size-lg)] rounded-[var(--radius-md)]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-medium leading-none whitespace-nowrap",
        "cursor-pointer select-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-3",
        "disabled:opacity-40 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
