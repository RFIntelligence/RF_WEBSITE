"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children: React.ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
    "border border-[var(--color-accent)]",
    "hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)]",
    "transition-colors duration-[var(--duration-normal)]",
  ].join(" "),

  secondary: [
    "bg-transparent text-[var(--color-text-primary)]",
    "border border-[var(--color-border-strong)]",
    "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
    "transition-colors duration-[var(--duration-normal)]",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--color-text-secondary)]",
    "border border-transparent",
    "hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]",
    "transition-colors duration-[var(--duration-normal)]",
  ].join(" "),

  outline: [
    "bg-transparent text-[var(--color-accent)]",
    "border border-[var(--color-accent)]",
    "hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
    "transition-colors duration-[var(--duration-normal)]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-[var(--radius-sm)]",
  md: "px-4 py-2 text-base rounded-[var(--radius-md)]",
  lg: "px-6 py-3 text-lg rounded-[var(--radius-md)]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-medium leading-none whitespace-nowrap",
        "cursor-pointer select-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-3",
        "disabled:opacity-40 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;