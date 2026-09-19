import Link from "next/link";
import {
  Plus,
  MessageCircleQuestion,
  FilePlus,
  UserPlus,
  Upload,
  type LucideIcon,
} from "lucide-react";

// ─── Type (no mock-data dependency) ──────────────────────────────────────────

export type QuickActionIconKey =
  | "plus"
  | "message-circle-question"
  | "file-plus"
  | "user-plus"
  | "upload";

export interface QuickAction {
  id: string;
  label: string;
  iconKey: QuickActionIconKey;
  href: string;
  description: string;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<QuickActionIconKey, LucideIcon> = {
  "plus":                    Plus,
  "message-circle-question": MessageCircleQuestion,
  "file-plus":               FilePlus,
  "user-plus":               UserPlus,
  "upload":                  Upload,
};

// ─── Static quick-action config (nav only — no DB data) ───────────────────────

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id:          "qa_new_project",
    label:       "New Project",
    iconKey:     "plus",
    href:        "/projects",
    description: "Start a new project for an account",
  },
  {
    id:          "qa_ask_rf",
    label:       "Ask RF",
    iconKey:     "message-circle-question",
    href:        "/ask-rf",
    description: "Query RF with a natural language question",
  },
  {
    id:          "qa_new_report",
    label:       "New Report",
    iconKey:     "file-plus",
    href:        "/reports",
    description: "Generate or upload a report",
  },
  {
    id:          "qa_add_member",
    label:       "Add Member",
    iconKey:     "user-plus",
    href:        "/team",
    description: "Invite a team member to this workspace",
  },
  {
    id:          "qa_upload",
    label:       "Upload Doc",
    iconKey:     "upload",
    href:        "/reports",
    description: "Upload a document for RF to analyse",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface QuickActionsRowProps {
  actions?: QuickAction[];
}

export function QuickActionsRow({ actions = QUICK_ACTIONS }: QuickActionsRowProps) {
  return (
    <section aria-labelledby="quick-actions-heading">
      <p id="quick-actions-heading" className="dash-eyebrow mb-3">
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
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                style={{ background: "rgba(242,78,75,0.10)" }}
              >
                <Icon className="size-[18px] text-[var(--accent)] transition-colors group-hover:text-[var(--accent-hover)]" />
              </span>
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
