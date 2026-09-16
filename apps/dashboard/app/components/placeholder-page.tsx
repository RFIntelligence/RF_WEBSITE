import type { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  icon: LucideIcon;
  eyebrow: string;
  heading: string;
  body: string;
}

export function PlaceholderPage({
  icon: Icon,
  eyebrow,
  heading,
  body,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="dash-eyebrow mb-1">{eyebrow}</p>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight mb-8">
        {heading}
      </h2>

      {/* Empty-state card */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-8 py-20 text-center">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ background: "var(--surface-elevated)" }}
        >
          <Icon
            aria-hidden
            className="size-7 text-[var(--text-muted)]"
          />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
          {heading}
        </h3>
        <p className="max-w-sm text-sm text-[var(--text-muted)] leading-relaxed">
          {body}
        </p>
        <p className="mt-4 text-xs text-[var(--text-muted)] font-mono tracking-wide uppercase">
          Coming in next sprint
        </p>
      </div>
    </div>
  );
}
