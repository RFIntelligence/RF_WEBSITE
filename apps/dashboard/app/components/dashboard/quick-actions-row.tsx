import Link from "next/link";
import {
  Plus,
  MessageCircleQuestion,
  FilePlus,
  UserPlus,
  Upload,
} from "lucide-react";
import type { QuickAction } from "@/app/lib/mock-data";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  "plus":                    Plus,
  "message-circle-question": MessageCircleQuestion,
  "file-plus":               FilePlus,
  "user-plus":               UserPlus,
  "upload":                  Upload,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface QuickActionsRowProps {
  actions: QuickAction[];
}

export function QuickActionsRow({ actions }: QuickActionsRowProps) {
  return (
    <section aria-labelledby="quick-actions-heading">
      <p
        id="quick-actions-heading"
        className="dash-eyebrow mb-3"
      >
        / quick actions
      </p>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}
      >
        {actions.map((action) => {
          const Icon = ICON_MAP[action.iconKey];

          return (
            <Link
              key={action.id}
              href={action.href}
              title={action.description}
              className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-4 text-center transition-all duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              {/* Icon chip */}
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                style={{ background: "rgba(242,78,75,0.10)" }}
              >
                <Icon
                  className="size-[18px] text-[var(--accent)] transition-colors group-hover:text-[var(--accent-hover)]"
                />
              </span>

              {/* Label */}
              <span className="text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-tight">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
