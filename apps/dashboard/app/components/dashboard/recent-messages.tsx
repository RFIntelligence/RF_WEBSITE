import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { RecentConversation } from "@/app/types/dashboard";

// ─── Component ────────────────────────────────────────────────────────────────

interface RecentMessagesProps {
  conversations: RecentConversation[];
}

export function RecentMessages({ conversations }: RecentMessagesProps) {
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <section aria-labelledby="messages-heading">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="dash-eyebrow">/ messages</p>
          <h2
            id="messages-heading"
            className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]"
          >
            {unreadCount > 0 ? (
              <>
                {unreadCount} unread
                <span className="ml-1 text-[var(--text-muted)] font-normal">
                  · {conversations.length} total
                </span>
              </>
            ) : (
              "All caught up"
            )}
          </h2>
        </div>
        <Link
          href="/conversations"
          className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group"
        >
          Open inbox
          <ArrowUpRight
            aria-hidden
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {conversations.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic py-2">No conversations yet.</p>
      ) : (
        <ul role="list" className="space-y-1">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link
                href={`/conversations`}
                className={cn(
                  "group flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  conv.unread
                    ? "border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold font-mono"
                    style={{
                      background: "var(--surface-elevated)",
                      color:      "var(--text-primary)",
                      border:     "1px solid var(--border)",
                    }}
                  >
                    {conv.senderInitials}
                  </span>
                  {conv.unread && (
                    <span
                      aria-label="Unread"
                      className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2"
                      style={{ background: "var(--accent)", borderColor: "var(--surface)" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span
                      className={cn(
                        "text-[13px] truncate",
                        conv.unread
                          ? "font-semibold text-[var(--text-primary)]"
                          : "font-normal text-[var(--text-secondary)]"
                      )}
                    >
                      {conv.senderName}
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                      {conv.relativeTime}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-1 leading-relaxed">
                    {conv.preview}
                  </p>

                  {conv.contextLabel && (
                    <span
                      className="mt-1 inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide"
                      style={{ background: "var(--surface-elevated)", color: "var(--text-muted)" }}
                    >
                      {conv.contextLabel}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
