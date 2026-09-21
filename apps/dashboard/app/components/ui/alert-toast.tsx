import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XOctagon,
  X,
  ArrowRight,
} from "lucide-react";

// Define variants for the alert toast using cva
const alertToastVariants = cva(
  "relative w-full max-w-sm overflow-hidden rounded-lg shadow-lg flex items-start p-4 space-x-4 transition-colors",
  {
    variants: {
      variant: {
        success: "",
        warning: "",
        info: "",
        error: "",
      },
      styleVariant: {
        default: "bg-[var(--surface)] border",
        filled: "",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        styleVariant: "default",
        className: "text-[var(--text-primary)] border-green-500/30 bg-green-950/10",
      },
      {
        variant: "warning",
        styleVariant: "default",
        className: "text-[var(--text-primary)] border-yellow-500/30 bg-yellow-950/10",
      },
      {
        variant: "info",
        styleVariant: "default",
        className: "text-[var(--text-primary)] border-blue-500/30 bg-blue-950/10",
      },
      {
        variant: "error",
        styleVariant: "default",
        className: "text-[var(--text-primary)] border-red-500/35 bg-red-950/10",
      },
      {
        variant: "success",
        styleVariant: "filled",
        className: "bg-green-600 text-black font-medium border border-green-500",
      },
      {
        variant: "warning",
        styleVariant: "filled",
        className: "bg-yellow-500 text-black font-medium border border-yellow-400",
      },
      {
        variant: "info",
        styleVariant: "filled",
        className: "bg-blue-600 text-white font-medium border border-blue-500",
      },
      {
        variant: "error",
        styleVariant: "filled",
        className: "bg-[var(--accent)] text-white font-medium border border-red-400 shadow-[0_0_20px_rgba(242,78,75,0.25)]",
      },
    ],
    defaultVariants: {
      variant: "info",
      styleVariant: "default",
    },
  }
);

// Define icon map for different variants
const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XOctagon,
};

// Define icon color classes
const iconColorClasses: Record<string, Record<string, string>> = {
  default: {
    success: "text-green-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
    error: "text-[var(--accent)]",
  },
  filled: {
    success: "text-black",
    warning: "text-black",
    info: "text-white",
    error: "text-white",
  },
};

import type { HTMLMotionProps } from "framer-motion";

export interface AlertToastProps
  extends Omit<HTMLMotionProps<"div">, "title" | "children">,
    VariantProps<typeof alertToastVariants> {
  /** The title of the alert. */
  title: string;
  /** A more detailed description for the alert. */
  description: string;
  /** A function to call when the alert is dismissed. */
  onClose: () => void;
  /** Optional CTA action link */
  action?: {
    label: string;
    href: string;
  };
  /** Optional severity tag badge label */
  severityTag?: string;
}


const AlertToast = React.forwardRef<HTMLDivElement, AlertToastProps>(
  (
    {
      className,
      variant = "info",
      styleVariant = "default",
      title,
      description,
      onClose,
      action,
      severityTag,
      ...props
    },
    ref
  ) => {
    const selectedVariant = variant ?? "info";
    const selectedStyleVariant = styleVariant ?? "default";
    const Icon = iconMap[selectedVariant];

    return (
      <motion.div
        ref={ref}
        role="alert"
        layout
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
        }}
        className={cn(
          alertToastVariants({ variant: selectedVariant, styleVariant: selectedStyleVariant }),
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon
            className={cn("h-5 w-5", iconColorClasses[selectedStyleVariant][selectedVariant])}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {severityTag && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase font-bold",
                  selectedStyleVariant === "filled"
                    ? "bg-black/30 text-current"
                    : selectedVariant === "error"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : selectedVariant === "warning"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                )}
              >
                {severityTag}
              </span>
            )}
            <p className="text-sm font-semibold tracking-tight">{title}</p>
          </div>
          <p
            className={cn(
              "text-xs leading-relaxed mt-1",
              selectedStyleVariant === "filled"
                ? "text-current/90"
                : "text-[var(--text-muted)]"
            )}
          >
            {description}
          </p>

          {action && (
            <Link
              href={action.href}
              className={cn(
                "inline-flex items-center gap-1 mt-2 text-xs font-semibold group transition-colors",
                selectedStyleVariant === "filled"
                  ? "underline hover:opacity-80"
                  : selectedVariant === "error"
                  ? "text-[var(--accent)] hover:text-[var(--accent-hover)]"
                  : selectedVariant === "warning"
                  ? "text-yellow-400 hover:text-yellow-300"
                  : "text-blue-400 hover:text-blue-300"
              )}
            >
              <span>{action.label}</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Close Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss alert"
            className={cn(
              "p-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              selectedStyleVariant === "default"
                ? "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                : "hover:bg-black/20 text-current"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }
);

AlertToast.displayName = "AlertToast";

export { AlertToast, alertToastVariants };
