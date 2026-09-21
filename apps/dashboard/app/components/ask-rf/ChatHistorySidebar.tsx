"use client";

import React, { useSyncExternalStore, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { chatStore, type ChatSession } from "@/app/lib/chat-store";
import { cn } from "@/app/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface ChatHistorySidebarProps {
  organizationId: string;
  userId: string;
  activeChatId: string | null;
  onSelectChat?: (chatId: string) => void;
  onNewChat?: () => void;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function ChatHistorySidebar({
  organizationId,
  userId,
  activeChatId,
  onSelectChat,
  onNewChat,
  className,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: ChatHistorySidebarProps) {
  const router = useRouter();

  // Read directly from external store via useSyncExternalStore
  const chats = useSyncExternalStore(
    chatStore.subscribe,
    () => chatStore.getSnapshot(organizationId, userId),
    () => chatStore.getServerSnapshot()
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus inline edit input
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleStartNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      router.push("/ask-rf");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rf:new-chat"));
      }
    }
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  const handleSaveRename = (chatId: string) => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      chatStore.rename(organizationId, userId, chatId, trimmed);
    }
    setEditingId(null);
  };

  const handleTogglePin = (chatId: string) => {
    chatStore.togglePin(organizationId, userId, chatId);
  };

  const handleDelete = (chatId: string) => {
    chatStore.delete(organizationId, userId, chatId);
    setDeleteConfirmId(null);
    if (activeChatId === chatId) {
      router.push("/ask-rf");
    }
  };

  // Filtered chats based on client-side search
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase().trim();
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, searchQuery]);

  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
  }, [chats]);

  // Grouping: Pinned, Today, Yesterday, Previous 7 days, Older
  const groups = useMemo(() => {
    const currentTime = now || (typeof window !== "undefined" ? 1726941600000 : 0);
    const dayMs = 86_400_000;

    const pinned: ChatSession[] = [];
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const prev7: ChatSession[] = [];
    const older: ChatSession[] = [];

    for (const chat of filteredChats) {
      if (chat.pinned) {
        pinned.push(chat);
        continue;
      }
      const diff = currentTime - chat.updatedAt;
      if (diff < dayMs) {
        today.push(chat);
      } else if (diff < 2 * dayMs) {
        yesterday.push(chat);
      } else if (diff < 7 * dayMs) {
        prev7.push(chat);
      } else {
        older.push(chat);
      }
    }

    return [
      { label: "PINNED", items: pinned },
      { label: "TODAY", items: today },
      { label: "YESTERDAY", items: yesterday },
      { label: "PREVIOUS 7 DAYS", items: prev7 },
      { label: "OLDER", items: older },
    ].filter((g) => g.items.length > 0);
  }, [filteredChats]);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#090A0E] text-white select-none border-r border-white/[0.06]",
        className
      )}
    >
      {/* ── Top section: + New chat button ── */}
      <div className="p-3 border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={handleStartNewChat}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all",
            "bg-gradient-to-r from-red-600/20 to-rose-600/20 hover:from-red-600/30 hover:to-rose-600/30",
            "border border-red-500/30 hover:border-red-500/50 text-red-100 hover:text-white shadow-sm"
          )}
        >
          <Plus className="w-3.5 h-3.5 text-red-400" />
          <span>+ New chat</span>
        </button>

        {/* Client-side search input */}
        <div className="relative mt-2.5">
          <Search className="w-3 h-3 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] pl-8 pr-2.5 py-1.5 text-xs text-white/90 placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Conversation List grouped by date ── */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {filteredChats.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-white/40 italic">
              {searchQuery ? "No matching conversations." : "No conversations yet."}
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="space-y-1">
              <span className="block px-2 text-[10px] font-mono text-white/30 uppercase tracking-wider font-medium">
                {group.label}
              </span>
              <div className="space-y-0.5">
                {group.items.map((chat) => {
                  const isActive = activeChatId === chat.id;

                  return (
                    <div
                      key={chat.id}
                      className={cn(
                        "group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all",
                        isActive
                          ? "bg-red-500/10 text-red-200 border-l-2 border-red-500 font-medium"
                          : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      {editingId === chat.id ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(chat.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full bg-black border border-red-500/60 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(chat.id)}
                            className="text-emerald-400 hover:text-emerald-300 p-0.5"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-white/40 hover:text-white p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Link
                            href={`/ask-rf?chat=${chat.id}`}
                            onClick={() => {
                              if (onSelectChat) onSelectChat(chat.id);
                              if (onCloseMobileDrawer) onCloseMobileDrawer();
                            }}
                            className="flex items-center gap-2 flex-1 min-w-0 pr-1"
                          >
                            {chat.pinned && (
                              <Pin className="w-3 h-3 text-red-400 shrink-0 fill-current" />
                            )}
                            <span className="truncate leading-relaxed">{chat.title}</span>
                          </Link>

                          {/* Options dropdown */}
                          <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  aria-label="Conversation options"
                                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 bg-[#121318] border-white/10 text-white">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingId(chat.id);
                                    setEditTitle(chat.title);
                                  }}
                                  className="gap-2 text-xs cursor-pointer hover:bg-white/10 text-white/80 hover:text-white"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Rename</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleTogglePin(chat.id)}
                                  className="gap-2 text-xs cursor-pointer hover:bg-white/10 text-white/80 hover:text-white"
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                  <span>{chat.pinned ? "Unpin" : "Pin"}</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-white/10" />

                                {deleteConfirmId === chat.id ? (
                                  <div className="p-1.5 space-y-1">
                                    <p className="text-[10px] text-red-300 font-medium">Delete chat?</p>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(chat.id);
                                        }}
                                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-medium"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirmId(null);
                                        }}
                                        className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px]"
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setDeleteConfirmId(chat.id);
                                    }}
                                    className="gap-2 text-xs text-red-400 focus:text-red-300 hover:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
