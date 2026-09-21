"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, Send, ShieldCheck } from "lucide-react";
import {
  formatClockTime,
  formatRelativeTime,
} from "@/app/lib/format";
import {
  useOrgRealtime,
  type RealtimeEvent,
} from "@/app/lib/realtime/use-org-realtime";

interface ApiConversationSummary {
  id: string;
  topic: string;
  contextLabel: string;
  rfLead: string;
  unread: boolean;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
}

interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderRole: string;
  isRFTeam: boolean;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ApiConversationSummary[]>(
    [],
  );
  const [messages, setMessages] = useState<Record<string, ApiMessage[]>>({});
  const [selectedId, setSelectedId] = useState("");
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newContext, setNewContext] = useState("");
  const feedEndRef = useRef<HTMLDivElement>(null);

  const handleUnauthorized = useCallback(() => {
    router.replace("/login");
  }, [router]);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (!res.ok) {
      setError("Could not load conversations. Please refresh.");
      return;
    }
    const data = (await res.json()) as {
      conversations: ApiConversationSummary[];
    };
    setConversations(data.conversations);
    setSelectedId((prev) => prev || data.conversations[0]?.id || "");
  }, [handleUnauthorized]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
      );
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ApiMessage[] };
      setMessages((prev) => ({ ...prev, [conversationId]: data.messages }));
    },
    [handleUnauthorized],
  );

  // Resolve the organization for the realtime channel from the signed session.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as {
          organization: { id: string } | null;
        };
        if (!cancelled) setOrgId(data.organization?.id ?? null);
      } catch {
        // Realtime is optional; polling remains available.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConversations().finally(() => setIsLoading(false));
  }, [loadConversations]);

  // Load (and mark read) the active thread whenever the selection changes.
  useEffect(() => {
    if (!selectedId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMessages(selectedId);
    void fetch(`/api/conversations/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unread: false }),
    })
      .then((res) => {
        if (res.ok) {
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, unread: false } : c)),
          );
        }
      })
      .catch(() => {});
  }, [selectedId, loadMessages]);

  const handleRealtime = useCallback(
    (event: RealtimeEvent) => {
      if (event.name === "message:new") {
        const payload = event.data as {
          conversationId: string;
          message: ApiMessage;
        };
        setMessages((prev) => {
          const existing = prev[payload.conversationId] ?? [];
          if (existing.some((m) => m.id === payload.message.id)) return prev;
          return {
            ...prev,
            [payload.conversationId]: [...existing, payload.message],
          };
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === payload.conversationId
              ? {
                  ...c,
                  lastMessageAt: payload.message.createdAt,
                  lastMessagePreview: payload.message.content,
                  unread:
                    c.id === selectedId ? false : c.unread,
                }
              : c,
          ),
        );
      } else if (event.name === "conversation:new") {
        void loadConversations();
      }
    },
    [loadConversations, selectedId],
  );

  const { live } = useOrgRealtime(orgId, "messages", handleRealtime);

  // Graceful fallback: poll while realtime is unavailable.
  useEffect(() => {
    if (live || !selectedId) return;
    const interval = setInterval(() => {
      void loadConversations();
      void loadMessages(selectedId);
    }, 8000);
    return () => clearInterval(interval);
  }, [live, selectedId, loadConversations, loadMessages]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const activeConv =
    conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const activeMessages = activeConv ? messages[activeConv.id] ?? [] : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !selectedId) return;
    setInput("");
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        setError("Message could not be sent. Please try again.");
        return;
      }
      const data = (await res.json()) as { message: ApiMessage };
      setMessages((prev) => {
        const existing = prev[selectedId] ?? [];
        if (existing.some((m) => m.id === data.message.id)) return prev;
        return { ...prev, [selectedId]: [...existing, data.message] };
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                lastMessageAt: data.message.createdAt,
                lastMessagePreview: data.message.content,
              }
            : c,
        ),
      );
    } catch {
      setError("Message could not be sent. Please try again.");
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = newTopic.trim();
    const contextLabel = newContext.trim();
    if (!topic || !contextLabel) return;

    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, contextLabel }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        setError("Could not start a new thread. Please try again.");
        return;
      }
      const data = (await res.json()) as {
        conversation: {
          id: string;
          topic: string;
          contextLabel: string;
          rfLead: string;
          unread: boolean;
        };
      };
      const summary: ApiConversationSummary = {
        ...data.conversation,
        lastMessageAt: null,
        lastMessagePreview: null,
        messageCount: 0,
      };
      setConversations((prev) => [summary, ...prev]);
      setMessages((prev) => ({ ...prev, [summary.id]: [] }));
      setSelectedId(summary.id);
      setNewTopic("");
      setNewContext("");
      setShowNewForm(false);
    } catch {
      setError("Could not start a new thread. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredConvs = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.topic.toLowerCase().includes(q) ||
      c.contextLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="dash-eyebrow">/ internal team messages</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Client Team ↔ RF Operations Messaging
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
          <ShieldCheck className="size-3.5 text-[var(--accent)]" />
          <span>{live ? "Live" : "Internal Workspace Channel"}</span>
        </div>
      </div>

      {error && (
        <div className="shrink-0 rounded-lg border border-[var(--dash-status-error,#ef4444)]/40 bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--dash-status-error,#ef4444)]">
          {error}
        </div>
      )}

      {/* Main Two-Column View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Left Column: Conversation List */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/30 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter threads..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowNewForm((prev) => !prev)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Plus className="size-3" />
              New thread
            </button>
            {showNewForm && (
              <form
                onSubmit={handleCreateConversation}
                className="space-y-1.5 rounded-lg border border-[var(--border)] p-2"
              >
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Topic"
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="Context (e.g. Account: Acme Corp)"
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  disabled={isCreating || !newTopic.trim() || !newContext.trim()}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] py-1 text-[11px] font-medium text-white disabled:opacity-40"
                >
                  {isCreating && <Loader2 className="size-3 animate-spin" />}
                  Create thread
                </button>
              </form>
            )}
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 p-6 text-xs text-[var(--text-muted)]">
                <Loader2 className="size-3.5 animate-spin" />
                Loading threads…
              </div>
            )}
            {!isLoading && filteredConvs.length === 0 && (
              <p className="p-4 text-xs text-[var(--text-muted)]">
                No threads yet. Start one with “New thread”.
              </p>
            )}
            {filteredConvs.map((conv) => {
              const isSelected = activeConv?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? "bg-[var(--surface-elevated)] border-l-2 border-l-[var(--accent)]"
                      : "hover:bg-[var(--surface-elevated)]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex items-center gap-1.5">
                      {conv.unread && (
                        <span className="size-2 rounded-full bg-[var(--accent)] shrink-0" />
                      )}
                      <h3 className="truncate text-xs font-semibold text-[var(--text-primary)]">
                        {conv.topic}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--accent)] font-medium mb-1">
                    {conv.contextLabel}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                    <span className="truncate">{conv.rfLead}</span>
                    <span className="shrink-0">
                      {conv.lastMessageAt
                        ? formatRelativeTime(conv.lastMessageAt)
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Thread Stream */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]/40 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    {activeConv.topic}
                  </h2>
                  <p className="text-xs text-[var(--accent)] font-medium mt-0.5">
                    {activeConv.contextLabel}
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded border border-[var(--border)]">
                  Lead: {activeConv.rfLead}
                </span>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)]">
                    No messages yet. Say hello to the RF Operations team.
                  </p>
                )}
                {activeMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 max-w-2xl">
                    <div
                      className={`size-8 rounded-lg flex shrink-0 items-center justify-center text-xs font-semibold font-mono ${
                        msg.isRFTeam
                          ? "bg-[var(--accent)] text-white shadow-xs"
                          : "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
                      }`}
                    >
                      {msg.senderInitials}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {msg.senderName}
                        </span>
                        <span className="bg-[var(--surface-elevated)] px-1 rounded border border-[var(--border)]">
                          {msg.senderRole}
                        </span>
                        <span>{formatClockTime(msg.createdAt)}</span>
                      </div>

                      <div
                        className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                          msg.isRFTeam
                            ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--text-primary)]"
                            : "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={feedEndRef} />
              </div>

              {/* Input Box Footer */}
              <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-elevated)]/30 shrink-0">
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Post a message to your workspace team..."
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 pr-12 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 top-2 p-1.5 rounded-md bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-30"
                  >
                    <Send className="size-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-[var(--text-muted)]">
              {isLoading ? "Loading…" : "Select a thread to view messages."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
