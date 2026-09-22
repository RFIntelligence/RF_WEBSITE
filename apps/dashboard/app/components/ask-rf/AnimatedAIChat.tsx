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
  Paperclip,
  X,
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
  currentOrg?: string;
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
  messages,
  input,
  setInput,
  isTyping,
  onSend,
  onRegenerate,
  error,
  onRetry,
}: AnimatedAIChatProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>({});
  const [attachments, setAttachments] = useState<Array<{ name: string; size: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 180,
  });

  const promptChips = [
    "List my team members",
    "Which accounts are at risk?",
    "Summarize recent project activity",
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 4 - attachments.length);
    const added = newFiles.map((f) => ({ name: f.name, size: f.size }));
    setAttachments((prev) => [...prev, ...added].slice(0, 4));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleFileSelect(e.clipboardData.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

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
        void onSend();
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
      {/* ── Soft Ambient Glows ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full filter blur-[128px] pointer-events-none" />
      </div>

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
                    transition={{ duration: 0.25 }}
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
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-3.5 w-full group"
                >
                  {/* RF Avatar Pill */}
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

                    {/* Sources row */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-0.5">
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

                    {/* Action buttons */}
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
          /* ── Empty State: Heading <= 5 words, Chips above Composer ── */
          <div className="flex-1 flex flex-col items-center justify-center pb-12">
            <motion.div
              className="relative z-10 space-y-6 w-full max-w-xl text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white/90">
                What would you like to know?
              </h1>

              {/* Quick Questions preloaded prompt chips directly above input bar */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block">
                  Quick Questions
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {promptChips.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      onClick={() => onSend(promptText)}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 text-white/75 hover:text-white transition-all shadow-sm"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimal Glass Composer */}
              <div
                onPaste={handlePaste}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.06] shadow-2xl mt-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                {/* Attachment chips */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.06] border border-white/10 text-[11px] text-white/80"
                      >
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-white/40 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask RF..."
                    className="w-full px-3 py-2 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/25 min-h-[52px]"
                    style={{ overflow: "hidden" }}
                  />
                </div>

                <div className="px-3 pb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach files"
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (input.trim() && !isTyping) void onSend();
                    }}
                    disabled={isTyping || !input.trim()}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                      input.trim()
                        ? "bg-white text-[#0A0A0B] shadow-md hover:bg-white/90"
                        : "bg-white/[0.05] text-white/30 cursor-not-allowed"
                    )}
                  >
                    {isTyping ? (
                      <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <SendIcon className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Relative Thinking Indicator ── */}
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
                <div className="w-6 h-6 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center text-center">
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
            <div
              onPaste={handlePaste}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              {/* Attachment chips */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.06] border border-white/10 text-[11px] text-white/80"
                    >
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-white/40 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask RF..."
                  className="w-full px-3 py-2 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/25 min-h-[52px]"
                  style={{ overflow: "hidden" }}
                />
              </div>

              <div className="px-3 pb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach files"
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (input.trim() && !isTyping) void onSend();
                  }}
                  disabled={isTyping || !input.trim()}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                    input.trim()
                      ? "bg-white text-[#0A0A0B] shadow-md hover:bg-white/90"
                      : "bg-white/[0.05] text-white/30 cursor-not-allowed"
                  )}
                >
                  {isTyping ? (
                    <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <SendIcon className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
