"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import {
  Sparkles,
  ArrowUpIcon,
  SendIcon,
  LoaderIcon,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  FolderKanban,
  FileBarChart,
  History,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, ChatSource } from "@/app/lib/chat-store";

// Auto-resizing textarea hook
interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

// TypingDots animation
function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)",
          }}
        />
      ))}
    </div>
  );
}

// Suggestion chip interface
interface SuggestionPrompt {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

interface AnimatedAIChatProps {
  currentOrg: string;
  messages: ChatMessage[];
  input: string;
  setInput: (val: string) => void;
  isTyping: boolean;
  onSend: (text?: string) => Promise<void>;
  onRegenerate?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export function AnimatedAIChat({
  currentOrg,
  messages,
  input,
  setInput,
  isTyping,
  onSend,
  onRegenerate,
  error,
  onRetry,
}: AnimatedAIChatProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [inputFocused, setInputFocused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const suggestions: SuggestionPrompt[] = [
    {
      icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
      label: "Which accounts are most at risk this quarter?",
      prompt: "Which accounts are most at risk this quarter?",
    },
    {
      icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
      label: "What's driving pipeline concentration in Q4?",
      prompt: "What's driving pipeline concentration in Q4?",
    },
    {
      icon: <FileBarChart className="w-3.5 h-3.5 text-red-300" />,
      label: "Show me renewal opportunities this month",
      prompt: "Show me renewal opportunities this month",
    },
    {
      icon: <FolderKanban className="w-3.5 h-3.5 text-rose-300" />,
      label: "Summarise the latest project activity",
      prompt: "Summarise the latest project activity",
    },
  ];

  // Mouse move glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-scroll to bottom on new messages or typing state
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Autofocus textarea after load & when response finishes
  useEffect(() => {
    if (!isTyping && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isTyping, textareaRef]);

  // Sync textarea height with value changes
  useEffect(() => {
    adjustHeight(!input);
  }, [input, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isTyping) {
        onSend();
      }
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // non-fatal
    }
  };

  const toggleFeedback = (id: string, type: "up" | "down") => {
    setFeedbackMap((prev) => ({
      ...prev,
      [id]: prev[id] === type ? (null as unknown as "up") : type,
    }));
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-transparent text-white relative overflow-hidden">
      {/* ── Soft Red/Rose Ambient Glows ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-red-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>

      {/* ── Dynamic Mouse-Follow Glow when focused (recolored to red/rose) ── */}
      {inputFocused && (
        <motion.div
          className="fixed w-[45rem] h-[45rem] rounded-full pointer-events-none z-0 opacity-[0.035] bg-gradient-to-r from-red-600 via-rose-600 to-red-500 blur-[110px]"
          animate={{
            x: mousePosition.x - 360,
            y: mousePosition.y - 360,
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 150,
            mass: 0.5,
          }}
        />
      )}

      {/* ── Main Chat Column ── */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-2xl mx-auto px-4 overflow-hidden">
        {/* Scrollable message thread when conversation has messages */}
        {hasMessages ? (
          <div
            ref={chatScrollContainerRef}
            className="flex-1 overflow-y-auto pt-6 pb-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
          >
            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              const isLatest = idx === messages.length - 1;

              if (isUser) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end w-full"
                  >
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg">
                      <p className="text-sm text-white/95 leading-relaxed whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                      <span className="block text-[10px] font-mono text-white/30 text-right mt-1.5">
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              }

              // Assistant message
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3.5 w-full group"
                >
                  {/* RF Avatar Pill Circle */}
                  <div className="w-7 h-7 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <span className="text-[11px] font-bold text-red-200">RF</span>
                  </div>

                  {/* Message body */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div
                      className={cn(
                        "rounded-2xl p-4 bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl shadow-xl text-sm leading-relaxed text-white/90 prose prose-invert max-w-none",
                        msg.error && "border-red-500/30 bg-red-950/20 text-red-200"
                      )}
                    >
                      {msg.error ? (
                        <p>{msg.text}</p>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3 border border-white/10 rounded-xl">
                                <table className="w-full text-xs text-left">{children}</table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="border-b border-white/10 bg-white/[0.03] p-2.5 font-mono uppercase text-[10px] tracking-wider text-white/50">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border-b border-white/5 p-2.5 text-xs text-white/80">{children}</td>
                            ),
                            code: ({ className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || "");
                              const isInline = !match && !String(children).includes("\n");
                              if (isInline) {
                                return (
                                  <code
                                    className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-red-300"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <div className="relative group/code my-3 rounded-xl bg-black/80 border border-white/10 overflow-hidden">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/10 text-[10px] font-mono text-white/40">
                                    <span>{match ? match[1] : "code"}</span>
                                    <button
                                      type="button"
                                      onClick={() => navigator.clipboard.writeText(String(children))}
                                      className="hover:text-white transition-colors flex items-center gap-1"
                                    >
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </button>
                                  </div>
                                  <pre className="p-3 text-xs overflow-x-auto text-white/90 font-mono">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              );
                            },
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Sources row if present */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-0.5">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
                          Sources
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {msg.sources.map((src) => {
                            const href =
                              src.type === "project"
                                ? "/projects"
                                : src.type === "report"
                                ? "/reports"
                                : "/ai-insights";
                            const Icon =
                              src.type === "project"
                                ? FolderKanban
                                : src.type === "report"
                                ? FileBarChart
                                : Sparkles;

                            return (
                              <Link
                                key={src.id}
                                href={href}
                                title={`${src.type}: ${src.title}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs text-white/70 hover:border-red-500/40 hover:text-white hover:bg-white/[0.05] transition-all group/src"
                              >
                                <Icon className="w-3 h-3 text-red-400 shrink-0" />
                                <span className="font-mono text-[10px] text-white/40">{src.label}</span>
                                <span className="max-w-[160px] truncate">{src.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover/src:opacity-100 transition-opacity" />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action buttons (Copy, Regenerate, Thumbs, Timestamp) */}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 pt-1">
                      <span>{msg.timestamp}</span>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>

                      {isLatest && onRegenerate && (
                        <button
                          type="button"
                          onClick={onRegenerate}
                          disabled={isTyping}
                          className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-40"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() => toggleFeedback(msg.id, "up")}
                          className={cn(
                            "p-1 rounded hover:bg-white/5 transition-colors",
                            feedbackMap[msg.id] === "up" ? "text-emerald-400" : "hover:text-white"
                          )}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFeedback(msg.id, "down")}
                          className={cn(
                            "p-1 rounded hover:bg-white/5 transition-colors",
                            feedbackMap[msg.id] === "down" ? "text-red-400" : "hover:text-white"
                          )}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* ── Hero Screen (when no messages yet) ── */
          <div className="flex-1 flex flex-col items-center justify-center pb-8">
            <motion.div
              className="relative z-10 space-y-10 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Heading & Subtitle */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-block"
                >
                  <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 via-white/80 to-white/40 pb-1">
                    Ask RF anything about {currentOrg}
                  </h1>
                  <motion.div
                    className="h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </motion.div>
                <motion.p
                  className="text-sm text-white/40 font-normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Answers grounded in your organization&apos;s records
                </motion.p>
              </div>

              {/* ── Glass Composer Card (Pasted Component Reproduction) ── */}
              <motion.div
                className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="p-4">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder={`Ask RF anything about ${currentOrg}...`}
                    className={cn(
                      "w-full px-4 py-3 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/20 min-h-[60px]",
                      "transition-all duration-200 ease-in-out"
                    )}
                    style={{ overflow: "hidden" }}
                  />
                </div>

                <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Based only on {currentOrg} data</span>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => {
                      if (input.trim() && !isTyping) onSend();
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isTyping || !input.trim()}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                      input.trim()
                        ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                        : "bg-white/[0.05] text-white/40 cursor-not-allowed"
                    )}
                  >
                    {isTyping ? (
                      <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                    ) : (
                      <SendIcon className="w-4 h-4" />
                    )}
                    <span>Send</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* ── Suggestion Chips (4 real prompts with Lucide icons) ── */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.prompt}
                    type="button"
                    onClick={() => onSend(suggestion.prompt)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-xs sm:text-sm text-white/60 hover:text-white/90 transition-all relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {suggestion.icon}
                    <span>{suggestion.label}</span>
                    <motion.div
                      className="absolute inset-0 border border-white/[0.05] rounded-lg"
                      initial={false}
                      animate={{
                        opacity: [0, 1],
                        scale: [0.98, 1],
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Unobtrusive trust copy */}
              <div className="text-center pt-2">
                <p className="text-[11px] font-mono text-white/30 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Answers grounded in your organization&apos;s records · Tenant-scoped retrieval</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Relative Thinking Pill (Positioned above composer in chat pane) ── */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="mx-auto mb-3 backdrop-blur-2xl bg-white/[0.03] rounded-full px-4 py-2 shadow-lg border border-white/[0.07] z-30"
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-6 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-red-200">RF</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <span>Thinking</span>
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Inline Error Banner with Retry ── */}
        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30 backdrop-blur-xl flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* ── Bottom Anchored Composer (When conversation has messages) ── */}
        {hasMessages && (
          <div className="shrink-0 pb-4 pt-2">
            <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={`Ask RF anything about ${currentOrg}...`}
                  className={cn(
                    "w-full px-3 py-2 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/20 min-h-[52px]",
                    "transition-all duration-200 ease-in-out"
                  )}
                  style={{ overflow: "hidden" }}
                />
              </div>

              <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] text-white/30 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Answers grounded in your organization&apos;s records</span>
                  <span className="sm:hidden">Tenant-scoped</span>
                </div>

                <motion.button
                  type="button"
                  onClick={() => {
                    if (input.trim() && !isTyping) onSend();
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isTyping || !input.trim()}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2",
                    input.trim()
                      ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                      : "bg-white/[0.05] text-white/40 cursor-not-allowed"
                  )}
                >
                  {isTyping ? (
                    <LoaderIcon className="w-3.5 h-3.5 animate-[spin_2s_linear_infinite]" />
                  ) : (
                    <SendIcon className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
