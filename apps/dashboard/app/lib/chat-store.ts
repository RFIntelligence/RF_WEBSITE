/**
 * Ask RF Chat Store Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a localized persistence layer for Ask RF conversation sessions,
 * scoped per tenant (organizationId) and authenticated user (userId).
 * 
 * Guaranteed SSR-safe: all localStorage interactions are guarded by window checks
 * and wrapped in try/catch to never crash the client on blocked or full storage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ChatSource {
  id: string;
  type: "insight" | "project" | "report";
  title: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "rf";
  text: string;
  timestamp: string;
  sources?: ChatSource[];
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  organizationId: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  messages: ChatMessage[];
}

const STORAGE_PREFIX = "rf_ask_chats_v1";

export function getChatStorageKey(organizationId: string, userId: string): string {
  const org = organizationId?.trim() || "default_org";
  const usr = userId?.trim() || "default_user";
  return `${STORAGE_PREFIX}::${org}::${usr}`;
}

export function generateTitleFromPrompt(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "New conversation";
  const firstLine = trimmed.split("\n")[0].trim();
  const cleaned = firstLine.replace(/^[#\s\-*]+/, "").trim();
  const title = cleaned.slice(0, 42).replace(/[.,;:!?\-]+$/, "").trim();
  return title || "New conversation";
}

export const chatStore = {
  /**
   * List all chats for a given organization and user, sorted:
   * pinned first, then by updatedAt descending.
   */
  list(organizationId: string, userId: string): ChatSession[] {
    if (typeof window === "undefined") return [];
    try {
      const key = getChatStorageKey(organizationId, userId);
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return (parsed as ChatSession[]).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
    } catch (e) {
      console.warn("Failed to read chat history from storage:", e);
      return [];
    }
  },

  /**
   * Get a single chat by ID.
   */
  get(organizationId: string, userId: string, chatId: string): ChatSession | null {
    if (!chatId) return null;
    const list = this.list(organizationId, userId);
    return list.find((c) => c.id === chatId) || null;
  },

  /**
   * Create or save a chat session.
   * Dispatches 'rf:chat-updated' event.
   */
  save(chat: ChatSession): boolean {
    if (typeof window === "undefined" || !chat || !chat.id) return false;
    try {
      const key = getChatStorageKey(chat.organizationId, chat.userId);
      const current = this.list(chat.organizationId, chat.userId);
      const existingIdx = current.findIndex((c) => c.id === chat.id);
      let updated: ChatSession[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = chat;
      } else {
        updated = [chat, ...current];
      }
      window.localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("rf:chat-updated", {
          detail: { chatId: chat.id, organizationId: chat.organizationId, userId: chat.userId },
        })
      );
      return true;
    } catch (e) {
      console.warn("Failed to save chat to storage:", e);
      window.dispatchEvent(
        new CustomEvent("rf:storage-error", {
          detail: { message: "Failed to persist chat to storage (quota exceeded or storage blocked)." },
        })
      );
      return false;
    }
  },

  /**
   * Rename a chat.
   */
  rename(organizationId: string, userId: string, chatId: string, newTitle: string): void {
    const chat = this.get(organizationId, userId, chatId);
    if (!chat) return;
    chat.title = newTitle.trim() || "Untitled conversation";
    chat.updatedAt = Date.now();
    this.save(chat);
  },

  /**
   * Toggle pin status.
   */
  togglePin(organizationId: string, userId: string, chatId: string): boolean {
    const chat = this.get(organizationId, userId, chatId);
    if (!chat) return false;
    chat.pinned = !chat.pinned;
    chat.updatedAt = Date.now();
    this.save(chat);
    return !!chat.pinned;
  },

  /**
   * Delete a chat.
   * Dispatches 'rf:chat-deleted' event.
   */
  delete(organizationId: string, userId: string, chatId: string): void {
    if (typeof window === "undefined" || !chatId) return;
    try {
      const key = getChatStorageKey(organizationId, userId);
      const current = this.list(organizationId, userId);
      const filtered = current.filter((c) => c.id !== chatId);
      window.localStorage.setItem(key, JSON.stringify(filtered));
      window.dispatchEvent(
        new CustomEvent("rf:chat-deleted", {
          detail: { chatId, organizationId, userId },
        })
      );
    } catch (e) {
      console.warn("Failed to delete chat from storage:", e);
    }
  },
};
