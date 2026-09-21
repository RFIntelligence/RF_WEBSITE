import { createHash } from "crypto";
import { getOrgDataVersion } from "@/app/lib/data-sync";
import { PROMPT_VERSION } from "./domain-config";

export interface AskRfCacheEntry {
  answer: string;
  sources: Array<{
    id: string;
    type: string;
    title: string;
    label: string;
  }>;
  tier: string;
  cached: boolean;
  dataVersion: number;
  timestamp: number;
  ttlMs: number;
}

export interface CacheKeyParams {
  prompt: string;
  organizationId: string;
  userId: string;
  userRole: string;
  modelId: string;
  history?: Array<{ sender: string; text: string }>;
}

// In-memory LRU cache (~500 entries max)
const MAX_CACHE_ENTRIES = 500;
const memoryCache = new Map<string, AskRfCacheEntry>();

/**
 * Normalizes input text: trim, collapse whitespace, lowercase, strip trailing punctuation.
 */
export function normalizePrompt(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?!.,;:]+$/, "");
}

/**
 * Checks if a question is context-dependent (follow-up).
 */
export function isFollowUpQuestion(text: string): boolean {
  const norm = normalizePrompt(text);
  const words = norm.split(" ");
  if (words.length <= 6) return true;

  const followUpStarters = [
    "and",
    "also",
    "what about",
    "how about",
    "them",
    "those",
    "it",
    "that",
    "this",
    "he",
    "she",
    "they",
    "their",
  ];

  return followUpStarters.some((prefix) => norm.startsWith(prefix));
}

/**
 * Generates SHA-256 cache key.
 */
export function computeCacheKey(params: CacheKeyParams): string {
  const normalized = normalizePrompt(params.prompt);
  const dataVersion = getOrgDataVersion(params.organizationId);

  let historyHash = "";
  if (params.history && params.history.length > 0 && isFollowUpQuestion(normalized)) {
    const lastTwo = params.history.slice(-2);
    const historyStr = JSON.stringify(
      lastTwo.map((m) => ({ sender: m.sender, text: normalizePrompt(m.text) }))
    );
    historyHash = createHash("sha256").update(historyStr).digest("hex").slice(0, 16);
  }

  const keyPayload = [
    normalized,
    params.organizationId,
    params.userId,
    params.userRole,
    PROMPT_VERSION,
    params.modelId,
    String(dataVersion),
    historyHash,
  ].join("::");

  return createHash("sha256").update(keyPayload).digest("hex");
}

export function getFromCache(key: string, orgId: string): AskRfCacheEntry | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const currentOrgVersion = getOrgDataVersion(orgId);
  // Invalidate if org dataVersion bumped
  if (entry.dataVersion !== currentOrgVersion) {
    memoryCache.delete(key);
    return null;
  }

  // Invalidate if TTL expired
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    memoryCache.delete(key);
    return null;
  }

  return entry;
}

export function saveToCache(
  key: string,
  entry: Omit<AskRfCacheEntry, "cached" | "timestamp">
): void {
  // Respect 64KB entry cap
  const serialized = JSON.stringify(entry);
  if (Buffer.byteLength(serialized, "utf8") > 64 * 1024) {
    return;
  }

  // Evict oldest if exceeding max entries
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }

  memoryCache.set(key, {
    ...entry,
    cached: true,
    timestamp: Date.now(),
  });
}

export function clearAskRfCache(): void {
  memoryCache.clear();
}
