"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Lock, History, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAskRf } from "@/app/lib/use-ask-rf";
import { ChatHistorySidebar } from "@/app/components/ask-rf/ChatHistorySidebar";
import { AnimatedAIChat } from "@/app/components/ask-rf/AnimatedAIChat";
import { cn } from "@/app/lib/utils";

function AskRFPageContent() {
  const {
    session,
    orgId,
    userId,
    currentOrg,
    messages,
    input,
    setInput,
    isTyping,
    activeChatId,
    handleSend,
    handleNewChat,
    handleRegenerate,
  } = useAskRf();

  // Desktop sidebar collapsed state persisted in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("rf_ask_history_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Mobile slide-over drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("rf_ask_history_collapsed", String(next));
        } catch {
          // non-fatal
        }
      }
      return next;
    });
  };

  // Listen to storage errors (quota or blocked)
  useEffect(() => {
    function onStorageError(e: Event) {
      const msg = (e as CustomEvent<{ message: string }>).detail?.message;
      setStorageError(msg || "Storage unavailable. Changes may not persist.");
      setTimeout(() => setStorageError(null), 4000);
    }
    window.addEventListener("rf:storage-error", onStorageError);
    return () => window.removeEventListener("rf:storage-error", onStorageError);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100dvh-48px)] w-full overflow-hidden bg-[#07080B]">
      {/* ── Slim Page Header ── */}
      <header className="h-12 shrink-0 border-b border-white/[0.06] px-4 flex items-center justify-between bg-[#090A0E]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          {/* Mobile history toggle button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open conversation history"
            className="lg:hidden p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand conversation history" : "Collapse conversation history"}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">Ask RF</span>
            <span className="text-white/20">/</span>
            <span className="text-xs text-white/50 font-mono flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              Based only on <span className="text-white/80 font-medium">{currentOrg}</span> data
            </span>
          </div>
        </div>

        {/* Non-blocking storage toast */}
        {storageError && (
          <div className="text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-md animate-in fade-in">
            {storageError}
          </div>
        )}
      </header>

      {/* ── Two-Pane Layout: [Chat History Panel ~260px] [Chat Area flex-1] ── */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Desktop Left History Panel */}
        <div
          style={{
            width: sidebarCollapsed ? "0px" : "260px",
            transition: "width 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="hidden lg:block shrink-0 h-full overflow-hidden"
        >
          <div className="w-[260px] h-full">
            <ChatHistorySidebar
              organizationId={orgId}
              userId={userId}
              activeChatId={activeChatId}
              onNewChat={handleNewChat}
            />
          </div>
        </div>

        {/* Mobile Slide-over Drawer (< lg) */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-[280px] max-w-[80vw] h-full bg-[#090A0E] z-10 shadow-2xl flex flex-col">
              <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider font-mono">
                  Conversations
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatHistorySidebar
                  organizationId={orgId}
                  userId={userId}
                  activeChatId={activeChatId}
                  onNewChat={handleNewChat}
                  isMobileDrawer
                  onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          <AnimatedAIChat
            currentOrg={currentOrg}
            messages={messages}
            input={input}
            setInput={setInput}
            isTyping={isTyping}
            onSend={handleSend}
            onRegenerate={handleRegenerate}
          />
        </main>
      </div>
    </div>
  );
}

export default function AskRFPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full text-xs text-white/40 font-mono">
          Loading Ask RF...
        </div>
      }
    >
      <AskRFPageContent />
    </Suspense>
  );
}
