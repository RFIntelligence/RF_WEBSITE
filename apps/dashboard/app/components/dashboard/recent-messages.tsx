import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { MessageItem } from "@/app/lib/mock-data";

// ─── Component ────────────────────────────────────────────────────────────────

interface RecentMessagesProps {
  messages: MessageItem[];
}

export function RecentMessages({ messages }: RecentMessagesProps) {
  const unreadCount = messages.filter((m) => !m.read).length;

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
                  · {messages.length} total
                </span>
              </>
            ) : (
              "All caught up"
            )}
          </h2>
        </div>
        <Link
          href="/messages"
          className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group"
        >
          Open inbox
          <ArrowUpRight
            aria-hidden
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      <ul role="list" className="space-y-1">
        {messages.map((msg) => (
          <li key={msg.id}>
            <Link
              href="/messages"
              className={cn(
                "group flex items-start gap-3 rounded-lg border p-3 transition-colors",
                msg.read
                  ? "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
                  : "border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)]"
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
                  {msg.senderInitials}
                </span>
                {!msg.read && (
                  <span
                    aria-label="Unread"
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2"
                    style={{
                      background:   "var(--accent)",
                      borderColor:  "var(--surface)",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span
                    className={cn(
                      "text-[13px] truncate",
                      msg.read
                        ? "font-normal text-[var(--text-secondary)]"
                        : "font-semibold text-[var(--text-primary)]"
                    )}
                  >
                    {msg.senderName}
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                    {msg.relativeTime}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)] line-clamp-1 leading-relaxed">
                  {msg.preview}
                </p>

                {msg.contextLabel && (
                  <span
                    className="mt-1 inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-wide"
                    style={{
                      background: "var(--surface-elevated)",
                      color:      "var(--text-muted)",
                    }}
                  >
                    {msg.contextLabel}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
