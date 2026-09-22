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
  MoreVertical,
  MoreHorizontal,
  Reply,
  Copy,
  Trash2,
  Flag,
  UserMinus2,
  Check,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/lib/utils";

export type ConversationStatus =
  | "ai_handling"
  | "human_escalation"
  | "waiting_for_customer"
  | "resolved";

export type ChannelType = "whatsapp" | "email" | "web_chat";
export type OnlineStatus = "online" | "dnd" | "offline";

export interface ThreadMessage {
  id: string;
  senderType: "customer" | "ai" | "agent";
  senderName: string;
  avatarUrl?: string;
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
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
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
    avatarUrl: "https://cdn.21st.dev/assets/mirror/98/98223d200544e5627dbed84c3e768c5f5d3686327524c465b99bcbf0dc6ee115.svg",
    onlineStatus: "online",
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
        timestamp: "10:20 AM",
        content: "Hi Robert, Jordan here from operations. I'm reviewing your account history and will pull together custom tier-lock terms for Q4. Can we jump on a brief call at 2:00 PM?",
      },
    ],
  },
  {
    id: "conv_2",
    customerName: "Sarah Chen",
    customerCompany: "Meridian Health",
    customerEmail: "schen@meridianhealth.org",
    avatarUrl: "https://cdn.21st.dev/assets/mirror/2c/2ce18b2ad2da4e21f9a960be89297a598992975ff9e1263601b468ee7d0ad78d.svg",
    onlineStatus: "online",
    channel: "email",
    status: "ai_handling",
    lastMessageSnippet: "Automated sync verification completed with 0 errors across 1,240 patient records.",
    lastMessageTime: "45 min ago",
    unread: false,
    messages: [
      {
        id: "m5",
        senderType: "customer",
        senderName: "Sarah Chen",
        timestamp: "09:30 AM",
        content: "Could you confirm if yesterday's HL7 batch ingestion completed successfully without schema warnings?",
      },
      {
        id: "m6",
        senderType: "ai",
        senderName: "RF Support AI",
        timestamp: "09:31 AM",
        content: "Checking ingestion logs for Meridian Health... Automated sync verification completed with 0 errors across 1,240 records at 02:40 AM UTC. Audit hash: #HL7-9942.",
      },
    ],
  },
  {
    id: "conv_3",
    customerName: "David Miller",
    customerCompany: "Northstar Labs",
    customerEmail: "dmiller@northstarlabs.io",
    onlineStatus: "dnd",
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
    onlineStatus: "offline",
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
    label: "Waiting Customer",
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

const STATUS_COLORS: Record<OnlineStatus, string> = {
  online: "bg-emerald-500",
  dnd: "bg-rose-500",
  offline: "bg-zinc-500",
};

function StatusBadge({ status, className }: { status: OnlineStatus; className?: string }) {
  return (
    <span
      aria-label={status}
      className={cn(
        "inline-block size-2.5 rounded-full border-2 border-[var(--surface)] ring-1 ring-black/40 shrink-0",
        STATUS_COLORS[status],
        className
      )}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
}

// User Actions Dropdown Menu
function UserActionsMenu({ customerName }: { customerName: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="User actions"
          className="size-8 rounded-lg border border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors"
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreVertical aria-hidden="true" className="size-4" focusable="false" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-xl border border-white/10 bg-[#0d0f14] p-1.5 shadow-2xl backdrop-blur-xl text-xs">
        <DropdownMenuItem
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-white/80 hover:text-white hover:bg-white/[0.08] cursor-pointer"
          onClick={() => alert(`Initiating agent takeover for ${customerName}`)}
        >
          <Bot className="size-3.5 text-blue-400" />
          <span>Toggle AI Takeover</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-white/80 hover:text-white hover:bg-white/[0.08] cursor-pointer"
          onClick={() => alert(`Marking conversation with ${customerName} as escalated`)}
        >
          <ShieldAlert className="size-3.5 text-amber-400" />
          <span>Escalate to Lead</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-white/10" />
        <DropdownMenuItem
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
          onClick={() => alert(`Closing thread for ${customerName}`)}
        >
          <Trash2 className="size-3.5" />
          <span>Close Conversation</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Single Message Actions Dropdown Menu
function MessageActions({
  content,
  isCustomer,
}: {
  content: string;
  isCustomer: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Message actions"
          className="size-6 rounded-md border border-white/10 bg-[#0c0d12]/90 hover:bg-white/10 text-white/50 hover:text-white transition-all shadow-sm"
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" className="size-3" focusable="false" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-36 rounded-xl border border-white/10 bg-[#0d0f14] p-1 shadow-2xl backdrop-blur-xl text-xs"
      >
        <DropdownMenuItem
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied!" : "Copy Text"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => alert("Replying to message snippet")}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <Reply className="size-3" />
          <span>Reply Quote</span>
        </DropdownMenuItem>
        {!isCustomer && (
          <DropdownMenuItem
            onClick={() => alert("Message retracted")}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
          >
            <Trash2 className="size-3" />
            <span>Retract</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ConversationsPage() {
  const [selectedConvId, setSelectedConvId] = useState<string>("conv_1");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");

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
    <div className="mx-auto max-w-[1360px] space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 px-1">
        <div>
          <p className="dash-eyebrow">/ customer conversations</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Conversations & AI Hand-offs
          </h1>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono text-[var(--text-muted)] bg-white/[0.02] border border-white/[0.07] px-3 py-1.5 rounded-xl shadow-xs backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-white/80">Real-time Omnichannel Feed</span>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Left Column: Filterable Conversation List */}
        <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#08090d]/90 backdrop-blur-2xl overflow-hidden shadow-xl">
          {/* Search & Filters Container */}
          <div className="p-3.5 border-b border-white/[0.06] space-y-3 bg-white/[0.015]">
            {/* Redesigned Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-3.5 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, companies, or keywords..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-12 py-2 text-xs text-white/90 placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all font-sans"
              />
              <kbd className="absolute right-2.5 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/10 bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-white/40">
                ⌘K
              </kbd>
            </div>

            {/* Quick Segmented Channel Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto scrollbar-none text-[11px]">
              {[
                { id: "all", label: "All" },
                { id: "whatsapp", label: "WhatsApp" },
                { id: "email", label: "Email" },
                { id: "web_chat", label: "Web Chat" },
              ].map((pill) => {
                const isActive = channelFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setChannelFilter(pill.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
                      isActive
                        ? "bg-white/[0.12] text-white shadow-xs border border-white/10"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                    )}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Status Select Filter Bar */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/80 focus:outline-none focus:border-red-500/40 cursor-pointer"
              >
                <option value="all" className="bg-[#0b0c10] text-white">All Statuses</option>
                <option value="ai_handling" className="bg-[#0b0c10] text-white">AI Handling</option>
                <option value="human_escalation" className="bg-[#0b0c10] text-white">Human Escalation</option>
                <option value="waiting_for_customer" className="bg-[#0b0c10] text-white">Waiting Customer</option>
                <option value="resolved" className="bg-[#0b0c10] text-white">Resolved</option>
              </select>
            </div>
          </div>

          {/* List Items with StatusBadge and Clean Avatars */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40">
                No conversations match the selected filter.
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
                    className={cn(
                      "p-3.5 cursor-pointer transition-all duration-150 relative group flex gap-3 items-start",
                      isSelected
                        ? "bg-white/[0.06] border-l-2 border-l-red-500 shadow-inner"
                        : "hover:bg-white/[0.03]"
                    )}
                  >
                    {/* Avatar with live status dot */}
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar className="size-9 rounded-full border border-white/10 bg-white/[0.05]">
                        {conv.avatarUrl && <AvatarImage alt={conv.customerName} src={conv.avatarUrl} />}
                        <AvatarFallback className="text-[11px] font-bold text-white/80">
                          {conv.customerName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <StatusBadge
                        status={conv.onlineStatus}
                        className="absolute bottom-0 right-0 translate-x-0.5 translate-y-0.5"
                      />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row: Name + Status Badge */}
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="min-w-0 flex items-center gap-1.5">
                          {conv.unread && (
                            <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                          )}
                          <span className="truncate text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                            {conv.customerName}
                          </span>
                        </div>
                        <span
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider shrink-0"
                          style={{ background: statusCfg.bg, color: statusCfg.text }}
                        >
                          <StatusIcon className="size-2.5" />
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Company + Channel */}
                      <div className="flex items-center justify-between text-[11px] text-white/40 mb-1.5">
                        <span className="flex items-center gap-1 truncate text-white/60">
                          <Building2 className="size-3 text-white/40" />
                          {conv.customerCompany}
                        </span>
                        <span
                          className="flex items-center gap-1 text-[10px] font-mono"
                          style={{ color: channelCfg.color }}
                        >
                          <ChannelIcon className="size-2.5" />
                          {channelCfg.label}
                        </span>
                      </div>

                      {/* Message Snippet */}
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {conv.lastMessageSnippet}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-white/35">
                        <span>{conv.lastMessageTime}</span>
                        {conv.assignedAgent && (
                          <span className="truncate max-w-[120px]">
                            {conv.assignedAgent.split(" ")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Improvised Thread View with Modern User & Message Actions */}
        <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#08090d]/90 backdrop-blur-2xl overflow-hidden shadow-2xl">
          {/* Thread Header with User Identity, Status & UserActionsMenu */}
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.015] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="size-10 rounded-full border border-white/10 bg-white/[0.05]">
                  {activeConv.avatarUrl && <AvatarImage alt={activeConv.customerName} src={activeConv.avatarUrl} />}
                  <AvatarFallback className="text-xs font-bold text-white/90">
                    {activeConv.customerName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <StatusBadge
                  status={activeConv.onlineStatus}
                  className="absolute bottom-0 right-0 translate-x-0.5 translate-y-0.5"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-white/95 flex items-center gap-2">
                  {activeConv.customerName}
                  <span className="text-xs font-normal text-white/40">
                    ({activeConv.customerCompany})
                  </span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                  <span>{activeConv.customerEmail}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 capitalize">
                    <span className={cn("size-1.5 rounded-full", STATUS_COLORS[activeConv.onlineStatus])} />
                    {activeConv.onlineStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-medium border border-white/10"
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
              <UserActionsMenu customerName={activeConv.customerName} />
            </div>
          </div>

          {/* Escalation Banner (If Human Escalation Status) */}
          {activeConv.escalationInfo && (
            <div className="p-3.5 bg-red-500/10 border-b border-red-500/20 text-xs space-y-2 shrink-0 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-red-400 font-semibold">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="size-4" />
                  AI Escalation Triggered ({activeConv.escalationInfo.escalatedAt})
                </span>
                <span className="font-mono text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md border border-red-500/30">
                  Confidence Score: {(activeConv.escalationInfo.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-white/90 font-medium">
                Reason: {activeConv.escalationInfo.reason}
              </p>
              <div className="text-white/70 bg-black/40 p-2.5 rounded-xl border border-red-500/20">
                <strong className="text-emerald-400 font-semibold">Recommended Agent Action: </strong>
                {activeConv.escalationInfo.suggestedAction}
              </div>
            </div>
          )}

          {/* Messages Stream with Hover-triggered MessageActions & Modern Bubble Layout */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
            {activeConv.messages.map((msg) => {
              const isCustomer = msg.senderType === "customer";
              const isAI = msg.senderType === "ai";
              const isAgent = msg.senderType === "agent";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "group flex gap-3 max-w-2xl transition-all",
                    isCustomer ? "justify-start" : "ml-auto justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "flex max-w-[85%] items-start gap-2.5",
                      isCustomer ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    {/* Avatar Pill */}
                    <Avatar className="size-8 rounded-full border border-white/10 bg-white/[0.05] shrink-0 mt-0.5">
                      {isCustomer ? (
                        activeConv.avatarUrl ? (
                          <AvatarImage alt={msg.senderName} src={activeConv.avatarUrl} />
                        ) : (
                          <AvatarFallback className="text-[10px] font-bold text-white/80">
                            {msg.senderName[0]}
                          </AvatarFallback>
                        )
                      ) : isAI ? (
                        <div className="w-full h-full bg-red-950/60 border border-red-500/40 flex items-center justify-center">
                          <Bot className="size-4 text-red-300" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                          {msg.avatarInitials || "AG"}
                        </div>
                      )}
                    </Avatar>

                    {/* Message Bubble + Actions */}
                    <div className="space-y-1 min-w-0">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all shadow-md break-words",
                          isCustomer
                            ? "bg-white/[0.04] border border-white/[0.08] text-white/90"
                            : isAI
                            ? "bg-red-950/25 border border-red-500/25 text-white/90"
                            : "bg-white/[0.08] border border-white/15 text-white/95"
                        )}
                      >
                        {msg.content}
                      </div>

                      {/* Timestamp & Hover MessageActions */}
                      <div
                        className={cn(
                          "flex items-center gap-2 text-[10px] font-mono text-white/35 px-1.5",
                          isCustomer ? "justify-start" : "justify-end flex-row-reverse"
                        )}
                      >
                        <time dateTime={msg.timestamp}>{msg.timestamp}</time>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageActions content={msg.content} isCustomer={isCustomer} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Box Footer with Modern Glass Input & Attachment Button */}
          <div className="p-3.5 border-t border-white/[0.06] bg-white/[0.015] shrink-0">
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                aria-label="Add attachment"
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
              >
                <Paperclip className="size-4" />
              </button>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && replyText.trim()) {
                    alert(`Message sent: "${replyText}" (mock thread updated)`);
                    setReplyText("");
                  }
                }}
                placeholder="Type response as agent (Press Enter to send)..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-10 text-xs text-white/90 placeholder:text-white/30 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/30 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => {
                  if (replyText.trim()) {
                    alert(`Message sent: "${replyText}" (mock thread updated)`);
                    setReplyText("");
                  }
                }}
                className={cn(
                  "absolute right-2 p-1.5 rounded-lg transition-all",
                  replyText.trim()
                    ? "bg-red-500 text-white shadow-md hover:bg-red-600 cursor-pointer"
                    : "text-white/30 cursor-not-allowed"
                )}
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
