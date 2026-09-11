import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-mono tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--dash-badge-bg)] text-[var(--text-secondary)]",
        accent:
          "border-transparent bg-[var(--dash-badge-accent-bg)] text-[var(--accent)]",
        outline:
          "border-[var(--border-strong)] text-[var(--text-muted)]",
        running:
          "border-transparent bg-[rgba(74,222,128,0.12)] text-[var(--dash-status-running)]",
        paused:
          "border-transparent bg-[rgba(250,204,21,0.12)] text-[var(--dash-status-paused)]",
        error:
          "border-transparent bg-[rgba(242,78,75,0.12)] text-[var(--dash-status-error)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
