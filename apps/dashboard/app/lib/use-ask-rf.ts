"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  chatStore,
  generateTitleFromPrompt,
  type ChatMessage,
  type ChatSource,
  type ChatSession,
} from "@/app/lib/chat-store";

export interface SessionInfo {
  user: { id: string; name: string; email: string; role: string };
  organization: { id: string; name: string; plan: string } | null;
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function useAskRf() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");
  const initialQuery = searchParams.get("q");

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep a ref to latest state to avoid race conditions in async dispatches
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const orgId = session?.organization?.id || "default_org";
  const userId = session?.user?.id || "default_user";
  const currentOrg = session?.organization?.name || "Acme Corp";

  // 1. Fetch authenticated session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.ok && !cancelled) {
          const data = (await res.json()) as SessionInfo;
          setSession(data);
        }
      } catch {
        // Non-blocking network error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // 2. Load conversation from store only when chatId param changes and differs from activeChatId
  useEffect(() => {
    const currentOrgId = session?.organization?.id || "default_org";
    const currentUserId = session?.user?.id || "default_user";

    if (chatId) {
      if (chatId !== activeChatIdRef.current) {
        queueMicrotask(() => {
          setActiveChatId(chatId);
          activeChatIdRef.current = chatId;
          const existing = chatStore.get(currentOrgId, currentUserId, chatId);
          if (existing) {
            setMessages(existing.messages);
          } else {
            setMessages([]);
          }
        });
      }
    } else if (activeChatIdRef.current !== null) {
      queueMicrotask(() => {
        setActiveChatId(null);
        activeChatIdRef.current = null;
        setMessages([]);
      });
    }
  }, [chatId, session?.organization?.id, session?.user?.id]);

  // 3. Listen to external delete event
  useEffect(() => {
    function onDeleted(e: Event) {
      const deletedId = (e as CustomEvent<{ chatId: string }>).detail?.chatId;
      if (deletedId === activeChatIdRef.current) {
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/ask-rf");
        }
        setActiveChatId(null);
        activeChatIdRef.current = null;
        setMessages([]);
      }
    }
    window.addEventListener("rf:chat-deleted", onDeleted);
    return () => window.removeEventListener("rf:chat-deleted", onDeleted);
  }, []);

  // 4. Submit handler preserving EXACT payload and response contract
  const handleSend = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend ?? input).trim();
      if (!query || isTyping) return;

      const userMsg: ChatMessage = {
        id: `msg_user_${Date.now()}`,
        sender: "user",
        text: query,
        timestamp: nowLabel(),
      };

      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;
      if (textToSend === undefined) setInput("");
      setIsTyping(true);

      const curOrgId = sessionRef.current?.organization?.id || "default_org";
      const curUserId = sessionRef.current?.user?.id || "default_user";

      // Create or update chat in local store
      let currentSessionId = activeChatIdRef.current;
      if (!currentSessionId) {
        currentSessionId = `chat_${Date.now()}`;
        setActiveChatId(currentSessionId);
        activeChatIdRef.current = currentSessionId;

        const newSession: ChatSession = {
          id: currentSessionId,
          title: generateTitleFromPrompt(query),
          organizationId: curOrgId,
          userId: curUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: updatedMessages,
        };
        chatStore.save(newSession);
        
        // Update URL with window.history.replaceState (no Next.js navigation, no remount, no auto-refresh)
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/ask-rf?chat=${currentSessionId}`);
        }
      } else {
        const existing = chatStore.get(curOrgId, curUserId, currentSessionId);
        if (existing) {
          existing.messages = updatedMessages;
          existing.updatedAt = Date.now();
          chatStore.save(existing);
        } else {
          const fallbackSession: ChatSession = {
            id: currentSessionId,
            title: generateTitleFromPrompt(query),
            organizationId: curOrgId,
            userId: curUserId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
          chatStore.save(fallbackSession);
        }
      }

      // Abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch("/api/ask-rf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // EXACT CONTRACT: only `{ question: string }`
          body: JSON.stringify({ question: query }),
          signal: controller.signal,
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = (await res.json().catch(() => null)) as
          | { answer?: string; sources?: ChatSource[]; error?: string }
          | null;

        let assistantMsg: ChatMessage;

        if (!res.ok || !data?.answer) {
          assistantMsg = {
            id: `msg_rf_${Date.now()}`,
            sender: "rf",
            text: data?.error || "Ask RF is temporarily unavailable. Please try again.",
            timestamp: nowLabel(),
            error: true,
          };
        } else {
          assistantMsg = {
            id: `msg_rf_${Date.now()}`,
            sender: "rf",
            text: data.answer as string,
            timestamp: nowLabel(),
            sources: data.sources ?? [],
          };
        }

        const finalMessages = [...messagesRef.current, assistantMsg];
        setMessages(finalMessages);
        messagesRef.current = finalMessages;

        const curSessId = activeChatIdRef.current;
        if (curSessId) {
          const existing = chatStore.get(curOrgId, curUserId, curSessId);
          if (existing) {
            existing.messages = finalMessages;
            existing.updatedAt = Date.now();
            chatStore.save(existing);
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        const errorMsg: ChatMessage = {
          id: `msg_rf_${Date.now()}`,
          sender: "rf",
          text: "Could not reach Ask RF. Check your connection and try again.",
          timestamp: nowLabel(),
          error: true,
        };

        const finalMessages = [...messagesRef.current, errorMsg];
        setMessages(finalMessages);
        messagesRef.current = finalMessages;

        const curSessId = activeChatIdRef.current;
        if (curSessId) {
          const existing = chatStore.get(curOrgId, curUserId, curSessId);
          if (existing) {
            existing.messages = finalMessages;
            existing.updatedAt = Date.now();
            chatStore.save(existing);
          }
        }
      } finally {
        setIsTyping(false);
        abortControllerRef.current = null;
      }
    },
    [input, isTyping, router]
  );

  // 5. Abort current generation
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  }, []);

  // 6. Start a brand new chat
  const handleNewChat = useCallback(() => {
    handleStop();
    setActiveChatId(null);
    activeChatIdRef.current = null;
    setMessages([]);
    messagesRef.current = [];
    setInput("");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/ask-rf");
    }
  }, [handleStop]);

  // 7. Regenerate assistant response
  const handleRegenerate = useCallback(() => {
    if (messagesRef.current.length === 0 || isTyping) return;
    let lastQuery = "";
    for (let i = messagesRef.current.length - 1; i >= 0; i--) {
      if (messagesRef.current[i].sender === "user") {
        lastQuery = messagesRef.current[i].text;
        break;
      }
    }
    if (lastQuery) {
      const truncated = messagesRef.current.slice(0, -1);
      setMessages(truncated);
      messagesRef.current = truncated;
      void handleSend(lastQuery);
    }
  }, [isTyping, handleSend]);

  // 8. Edit user message
  const handleEditMessage = useCallback(
    (messageId: string, newText: string) => {
      const idx = messagesRef.current.findIndex((m) => m.id === messageId);
      if (idx < 0) return;
      const truncated = messagesRef.current.slice(0, idx);
      setMessages(truncated);
      messagesRef.current = truncated;
      void handleSend(newText);
    },
    [handleSend]
  );

  // Initial query trigger
  useEffect(() => {
    if (initialQuery && messages.length === 0 && session) {
      void handleSend(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, session]);

  return {
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
    handleStop,
    handleNewChat,
    handleRegenerate,
    handleEditMessage,
  };
}
