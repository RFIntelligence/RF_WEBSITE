"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Send,
  User,
  ShieldCheck,
  Building2,
  Paperclip,
  CheckCheck,
} from "lucide-react";
import { currentUser } from "@/app/lib/mock-data";

interface InternalThreadMessage {
  id: string;
  senderName: string;
  senderInitials: string;
  senderRole: string;
  isRFTeam: boolean;
  timestamp: string;
  content: string;
}

interface InternalConversation {
  id: string;
  topic: string;
  contextLabel: string;
  lastMessageTime: string;
  unread: boolean;
  rfLead: string;
  messages: InternalThreadMessage[];
}

const INITIAL_INTERNAL_CONVERSATIONS: InternalConversation[] = [
  {
    id: "int_1",
    topic: "Acme Renewal Strategy & Risk Mitigation",
    contextLabel: "Account: Acme Corp",
    lastMessageTime: "8 min ago",
    unread: true,
    rfLead: "RF Intelligence Support",
    messages: [
      {
        id: "im_1",
        senderName: "Priya Sharma",
        senderInitials: "PS",
        senderRole: "Client AE",
        isRFTeam: false,
        timestamp: "08:45 AM",
        content: "Can we sync on the Acme renewal deck before EOD? I have concerns about slide 4 sentiment metrics.",
      },
      {
        id: "im_2",
        senderName: "RF Technical Specialist",
        senderInitials: "RF",
        senderRole: "RF Operations",
        isRFTeam: true,
        timestamp: "08:52 AM",
        content: "Hi Priya! I reviewed slide 4. The sentiment metric calculated a 0.41 score based on recent executive turnover phrasing. We can adjust the weighting model if you have offline context.",
      },
      {
        id: "im_3",
        senderName: "Jordan Ellis",
        senderInitials: "JE",
        senderRole: "Admin",
        isRFTeam: false,
        timestamp: "08:54 AM",
        content: "Thanks! Let's lock in an offline review at 3 PM today.",
      },
    ],
  },
  {
    id: "int_2",
    topic: "Northstar Onboarding Sign-off",
    contextLabel: "Project: Northstar Onboarding",
    lastMessageTime: "45 min ago",
    unread: false,
    rfLead: "RF Onboarding AI Specialist",
    messages: [
      {
        id: "im_4",
        senderName: "Tom Kwan",
        senderInitials: "TK",
        senderRole: "CSM",
        isRFTeam: false,
        timestamp: "08:15 AM",
        content: "Northstar onboarding is basically done. Final checklist attached.",
      },
      {
        id: "im_5",
        senderName: "RF Technical Specialist",
        senderInitials: "RF",
        senderRole: "RF Operations",
        isRFTeam: true,
        timestamp: "08:17 AM",
        content: "Verified. All 24 user accounts pass compliance policy checks. Ready for final handover.",
      },
    ],
  },
  {
    id: "int_3",
    topic: "GlobalFin QBR Data Integration Blocker",
    contextLabel: "Project: GlobalFin QBR Deck",
    lastMessageTime: "2 hr ago",
    unread: false,
    rfLead: "RF Data Engineering",
    messages: [
      {
        id: "im_6",
        senderName: "Ana Reyes",
        senderInitials: "AR",
        senderRole: "Senior AE",
        isRFTeam: false,
        timestamp: "07:02 AM",
        content: "Blocked on GlobalFin QBR — need the usage export from integrations.",
      },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<InternalConversation[]>(
    INITIAL_INTERNAL_CONVERSATIONS
  );
  const [selectedId, setSelectedId] = useState<string>("int_1");
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv =
    conversations.find((c) => c.id === selectedId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: InternalThreadMessage = {
      id: `im_${Date.now()}`,
      senderName: currentUser.name,
      senderInitials: currentUser.avatarInitials,
      senderRole: currentUser.role,
      isRFTeam: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: input.trim(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              unread: false,
              lastMessageTime: "Just now",
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setInput("");
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
          <span>Internal Workspace Channel</span>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Left Column: Conversation List */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/30">
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
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {filteredConvs.map((conv) => {
              const isSelected = conv.id === activeConv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedId(conv.id);
                    setConversations((prev) =>
                      prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c))
                    );
                  }}
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
                    <span>{conv.rfLead}</span>
                    <span>{conv.lastMessageTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Thread Stream */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
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
            {activeConv.messages.map((msg) => (
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
                    <span>{msg.timestamp}</span>
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
        </div>
      </div>
    </div>
  );
}
