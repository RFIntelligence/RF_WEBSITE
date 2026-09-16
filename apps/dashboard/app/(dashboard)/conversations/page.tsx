"use client";

import React, { useState } from "react";
import {
  MessagesSquare,
  Search,
  Filter,
  AlertTriangle,
  Bot,
  User,
  UserCheck,
  Mail,
  MessageCircle,
  Globe,
  Clock,
  ArrowRightLeft,
  ChevronRight,
  ShieldAlert,
  Send,
  Building2,
} from "lucide-react";

export type ConversationStatus =
  | "ai_handling"
  | "human_escalation"
  | "waiting_for_customer"
  | "resolved";

export type ChannelType = "whatsapp" | "email" | "web_chat";

export interface ThreadMessage {
  id: string;
  senderType: "customer" | "ai" | "agent";
  senderName: string;
  avatarInitials?: string;
  timestamp: string;
  content: string;
}

export interface EscalationInfo {
  reason: string;
  escalatedAt: string;
  confidenceScore: number;
  suggestedAction: string;
}

export interface CustomerConversation {
  id: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  channel: ChannelType;
  status: ConversationStatus;
  lastMessageSnippet: string;
  lastMessageTime: string;
  unread: boolean;
  assignedAgent?: string;
  escalationInfo?: EscalationInfo;
  messages: ThreadMessage[];
}

export const MOCK_CONVERSATIONS: CustomerConversation[] = [
  {
    id: "conv_1",
    customerName: "Robert Vance",
    customerCompany: "Acme Corp",
    customerEmail: "rvance@acmecorp.com",
    channel: "whatsapp",
    status: "human_escalation",
    lastMessageSnippet: "I need to discuss our upcoming Q4 contract terms and pricing changes immediately.",
    lastMessageTime: "12 min ago",
    unread: true,
    assignedAgent: "Jordan Ellis (Admin)",
    escalationInfo: {
      reason: "High churn risk detected & complex contract negotiation request.",
      escalatedAt: "10 min ago",
      confidenceScore: 0.42,
      suggestedAction: "Schedule executive alignment call & offer tier preservation package.",
    },
    messages: [
      {
        id: "m1",
        senderType: "customer",
        senderName: "Robert Vance",
        timestamp: "10:14 AM",
        content: "Hi team, we reviewed the renewal quote sent last week. The 15% rate increase doesn't align with our current budget.",
      },
      {
        id: "m2",
        senderType: "ai",
        senderName: "RF Support AI",
        timestamp: "10:15 AM",
        content: "Hello Robert, thank you for reaching out! I understand budget predictability is essential. I can outline our multi-year lock-in incentives or connect you with your account director.",
      },
      {
        id: "m3",
        senderType: "customer",
        senderName: "Robert Vance",
        timestamp: "10:18 AM",
        content: "I need to discuss our upcoming Q4 contract terms and pricing changes immediately with a human manager.",
      },
      {
        id: "m4",
        senderType: "agent",
        senderName: "Jordan Ellis",
        avatarInitials: "JE",
        timestamp: "10:22 AM",
        content: "Hi Robert, Jordan here. I've taken over this thread. I'm reviewing your account details now and preparing a revised agreement without the rate jump.",
      },
    ],
  },
  {
    id: "conv_2",
    customerName: "Dr. Priya Sharma",
    customerCompany: "Meridian Health",
    customerEmail: "psharma@meridianhealth.org",
    channel: "email",
    status: "ai_handling",
    lastMessageSnippet: "Thanks! Can you also send the API documentation for the HL7 integration?",
    lastMessageTime: "45 min ago",
    unread: false,
    messages: [
      {
        id: "m5",
        senderType: "customer",
        senderName: "Dr. Priya Sharma",
        timestamp: "09:30 AM",
        content: "We're setting up the staging environment for Horizon v2. Where do we retrieve our secondary API keys?",
      },
      {
        id: "m6",
        senderType: "ai",
        senderName: "RF Support AI",
        timestamp: "09:31 AM",
        content: "Hi Dr. Sharma! You can generate secondary API keys directly under Organization Settings > API & Webhooks. Here is the direct link: /settings/api.",
      },
      {
        id: "m7",
        senderType: "customer",
        senderName: "Dr. Priya Sharma",
        timestamp: "09:45 AM",
        content: "Thanks! Can you also send the API documentation for the HL7 integration?",
      },
      {
        id: "m8",
        senderType: "ai",
        senderName: "RF Support AI",
        timestamp: "09:46 AM",
        content: "Certainly! I've sent the HL7 integration specifications to your email. Let me know if you need assistance configuring the webhooks.",
      },
    ],
  },
  {
    id: "conv_3",
    customerName: "David Miller",
    customerCompany: "Northstar Labs",
    customerEmail: "dmiller@northstarlabs.io",
    channel: "web_chat",
    status: "waiting_for_customer",
    lastMessageSnippet: "I've dispatched the verification link to your admin email.",
    lastMessageTime: "2 hr ago",
    unread: false,
    assignedAgent: "Tom Kwan",
    messages: [
      {
        id: "m9",
        senderType: "customer",
        senderName: "David Miller",
        timestamp: "08:10 AM",
        content: "We need 5 additional seats provisioned for the lab analytics group today.",
      },
      {
        id: "m10",
        senderType: "agent",
        senderName: "Tom Kwan",
        avatarInitials: "TK",
        timestamp: "08:25 AM",
        content: "Hi David, I've dispatched the verification link to your admin email to confirm seat expansion. Please click approve to finalize.",
      },
    ],
  },
  {
    id: "conv_4",
    customerName: "Elena Rostova",
    customerCompany: "GlobalFin",
    customerEmail: "erostova@globalfin.com",
    channel: "email",
    status: "resolved",
    lastMessageSnippet: "That resolved our issue. Thank you for the quick assistance!",
    lastMessageTime: "1 day ago",
    unread: false,
    messages: [
      {
        id: "m11",
        senderType: "customer",
        senderName: "Elena Rostova",
        timestamp: "Yesterday",
        content: "Is there a maintenance window scheduled for this weekend?",
      },
      {
        id: "m12",
        senderType: "ai",
        senderName: "RF Support AI",
        timestamp: "Yesterday",
        content: "No maintenance windows are scheduled for this weekend. All services remain 100% operational.",
      },
      {
        id: "m13",
        senderType: "customer",
        senderName: "Elena Rostova",
        timestamp: "Yesterday",
        content: "That resolved our issue. Thank you for the quick assistance!",
      },
    ],
  },
];

const STATUS_CONFIG: Record<
  ConversationStatus,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  ai_handling: {
    label: "AI Handling",
    bg: "rgba(96,165,250,0.12)",
    text: "var(--dash-chart-secondary)",
    icon: Bot,
  },
  human_escalation: {
    label: "Human Escalation",
    bg: "rgba(242,78,75,0.12)",
    text: "var(--dash-status-error)",
    icon: AlertTriangle,
  },
  waiting_for_customer: {
    label: "Waiting for Customer",
    bg: "rgba(250,204,21,0.12)",
    text: "var(--dash-status-paused)",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    bg: "rgba(34,197,94,0.12)",
    text: "var(--dash-status-running)",
    icon: UserCheck,
  },
};

const CHANNEL_CONFIG: Record<
  ChannelType,
  { label: string; icon: React.ElementType; color: string }
> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "#22c55e" },
  email: { label: "Email", icon: Mail, color: "#60a5fa" },
  web_chat: { label: "Web Chat", icon: Globe, color: "#a855f7" },
};

export default function ConversationsPage() {
  const [selectedConvId, setSelectedConvId] = useState<string>("conv_1");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations list
  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) => {
    if (statusFilter !== "all" && conv.status !== statusFilter) return false;
    if (channelFilter !== "all" && conv.channel !== channelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = conv.customerName.toLowerCase().includes(q);
      const matchCompany = conv.customerCompany.toLowerCase().includes(q);
      const matchSnippet = conv.lastMessageSnippet.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchSnippet) return false;
    }
    return true;
  });

  const activeConv =
    MOCK_CONVERSATIONS.find((c) => c.id === selectedConvId) || MOCK_CONVERSATIONS[0];

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="dash-eyebrow">/ customer conversations</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Conversations & AI Hand-offs
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
          <Bot className="size-3.5 text-[var(--accent)]" />
          <span>Real-time Omnichannel Feed</span>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Left Column: Filterable Conversation List */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {/* Filters & Search Header */}
          <div className="p-3 border-b border-[var(--border)] space-y-2.5 bg-[var(--surface-elevated)]/30">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--text-primary)] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="ai_handling">AI Handling</option>
                <option value="human_escalation">Human Escalation</option>
                <option value="waiting_for_customer">Waiting Customer</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--text-primary)] focus:outline-none"
              >
                <option value="all">All Channels</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="web_chat">Web Chat</option>
              </select>
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No conversations found matching filters.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const statusCfg = STATUS_CONFIG[conv.status];
                const channelCfg = CHANNEL_CONFIG[conv.channel];
                const StatusIcon = statusCfg.icon;
                const ChannelIcon = channelCfg.icon;

                const isSelected = conv.id === activeConv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3.5 cursor-pointer transition-all duration-150 relative ${
                      isSelected
                        ? "bg-[var(--surface-elevated)] border-l-2 border-l-[var(--accent)]"
                        : "hover:bg-[var(--surface-elevated)]/50"
                    }`}
                  >
                    {/* Top Row: Name + Status Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0 flex items-center gap-1.5">
                        {conv.unread && (
                          <span className="size-2 rounded-full bg-[var(--accent)] shrink-0" />
                        )}
                        <span className="truncate text-xs font-semibold text-[var(--text-primary)]">
                          {conv.customerName}
                        </span>
                      </div>
                      <span
                        className="flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider shrink-0"
                        style={{ background: statusCfg.bg, color: statusCfg.text }}
                      >
                        <StatusIcon className="size-2.5" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Company + Channel */}
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-2">
                      <span className="flex items-center gap-1 truncate">
                        <Building2 className="size-3" />
                        {conv.customerCompany}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[10px] font-mono"
                        style={{ color: channelCfg.color }}
                      >
                        <ChannelIcon className="size-3" />
                        {channelCfg.label}
                      </span>
                    </div>

                    {/* Message Snippet */}
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {conv.lastMessageSnippet}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                      <span>{conv.lastMessageTime}</span>
                      {conv.assignedAgent && (
                        <span>Assigned: {conv.assignedAgent.split(" ")[0]}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Thread View with Escalation Banner */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {/* Thread Header */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)]/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center font-mono font-semibold text-sm text-[var(--text-primary)]">
                {activeConv.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  {activeConv.customerName}
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    ({activeConv.customerCompany})
                  </span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {activeConv.customerEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium"
                style={{
                  background: STATUS_CONFIG[activeConv.status].bg,
                  color: STATUS_CONFIG[activeConv.status].text,
                }}
              >
                {React.createElement(STATUS_CONFIG[activeConv.status].icon, {
                  className: "size-3.5",
                })}
                {STATUS_CONFIG[activeConv.status].label}
              </span>
            </div>
          </div>

          {/* Escalation Banner (If Human Escalation Status) */}
          {activeConv.escalationInfo && (
            <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-xs space-y-2 shrink-0 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-rose-400 font-semibold">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="size-4" />
                  AI Escalation Triggered ({activeConv.escalationInfo.escalatedAt})
                </span>
                <span className="font-mono text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">
                  Confidence Score: {(activeConv.escalationInfo.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[var(--text-primary)] font-medium">
                Reason: {activeConv.escalationInfo.reason}
              </p>
              <div className="text-[var(--text-muted)] bg-[var(--surface)]/80 p-2 rounded border border-rose-500/20">
                <strong className="text-emerald-400 font-semibold">Recommended Agent Action: </strong>
                {activeConv.escalationInfo.suggestedAction}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConv.messages.map((msg) => {
              const isCustomer = msg.senderType === "customer";
              const isAI = msg.senderType === "ai";
              const isAgent = msg.senderType === "agent";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${
                    isCustomer ? "" : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`size-8 rounded-lg flex shrink-0 items-center justify-center text-xs font-semibold ${
                      isCustomer
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        : isAI
                        ? "bg-[var(--accent)] text-white shadow-xs"
                        : "bg-emerald-600 text-white shadow-xs"
                    }`}
                  >
                    {isCustomer && <User className="size-4" />}
                    {isAI && <Bot className="size-4" />}
                    {isAgent && (msg.avatarInitials || "AG")}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] px-1">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {msg.senderName}
                      </span>
                      {isAI && (
                        <span className="bg-[var(--accent)]/10 text-[var(--accent)] px-1 rounded">
                          AUTONOMOUS AI
                        </span>
                      )}
                      {isAgent && (
                        <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded">
                          HUMAN AGENT
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                        isCustomer
                          ? "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
                          : isAI
                          ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--text-primary)]"
                          : "bg-emerald-500/10 border border-emerald-500/30 text-[var(--text-primary)]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Box Footer */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-elevated)]/30 shrink-0">
            <div className="relative">
              <input
                type="text"
                disabled
                placeholder="Type response as agent (Demo phase: messaging read-only)..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 pr-10 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] cursor-not-allowed opacity-75"
              />
              <button
                disabled
                className="absolute right-2 top-2 p-1.5 rounded-md bg-[var(--accent)] text-white opacity-40 cursor-not-allowed"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
