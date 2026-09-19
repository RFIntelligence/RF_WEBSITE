"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  Download,
  FileCheck,
  Loader2,
  AlertCircle,
  FilePlus,
  Building2,
  Calendar,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";

type DocumentStatus = "PENDING" | "PROCESSED" | "FAILED";

interface ApiDocument {
  id: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  mimeType: string | null;
  processingStatus: DocumentStatus;
  linkedAccount: string | null;
  extractedEntitiesCount: number;
  failureReason: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
}

interface ApiReport {
  id: string;
  title: string;
  type: string;
  accountName: string;
  size: string;
  status: string;
  fileUrl: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
}

interface ApiProject {
  id: string;
  name: string;
  accountName: string;
  status: string;
}

const ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"reports" | "documents">("reports");
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUnauthorized = useCallback(() => {
    router.replace("/login");
  }, [router]);

  const loadDocuments = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as { documents: ApiDocument[] };
    setDocuments(data.documents);
  }, [handleUnauthorized]);

  const loadAll = useCallback(async () => {
    try {
      const [docsRes, reportsRes, projectsRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/reports"),
        fetch("/api/projects"),
      ]);

      if (
        docsRes.status === 401 ||
        reportsRes.status === 401 ||
        projectsRes.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (docsRes.ok) {
        setDocuments(((await docsRes.json()) as { documents: ApiDocument[] }).documents);
      }
      if (reportsRes.ok) {
        setReports(((await reportsRes.json()) as { reports: ApiReport[] }).reports);
      }
      if (projectsRes.ok) {
        setProjects(((await projectsRes.json()) as { projects: ApiProject[] }).projects);
      }
    } catch {
      setError("Could not load your documents. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    // Initial load; state updates happen only after the awaited fetches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [loadAll]);

  // Poll while any document is still being processed by the background job.
  const hasPending = documents.some((doc) => doc.processingStatus === "PENDING");
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => {
      void loadDocuments();
    }, 3000);
    return () => clearInterval(interval);
  }, [hasPending, loadDocuments]);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      try {
        const urlRes = await fetch("/api/documents/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            projectId: selectedProjectId || undefined,
          }),
        });

        if (urlRes.status === 401) {
          handleUnauthorized();
          return;
        }
        const urlData = (await urlRes.json().catch(() => null)) as
          | {
              uploadUrl: string;
              uploadToken: string;
              headers: Record<string, string>;
              error?: string;
            }
          | null;
        if (!urlRes.ok || !urlData?.uploadUrl) {
          throw new Error(urlData?.error || "Could not start the upload.");
        }

        const putRes = await fetch(urlData.uploadUrl, {
          method: "PUT",
          headers: urlData.headers,
          body: file,
        });
        if (!putRes.ok) {
          throw new Error("Uploading the file to storage failed.");
        }

        const confirmRes = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadToken: urlData.uploadToken,
            projectId: selectedProjectId || undefined,
          }),
        });
        const confirmData = (await confirmRes.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (!confirmRes.ok) {
          throw new Error(confirmData?.error || "Could not save the document.");
        }

        setActiveTab("documents");
        await loadAll();
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Upload failed. Please try again.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [selectedProjectId, handleUnauthorized, loadAll],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="dash-eyebrow">/ reports & documents</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Knowledge Repository & AI Reports
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Uploaded documents are processed in the background; reports are scoped to
            your organization.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-400">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <FileText className="size-4" />
          Generated Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "documents"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <FileCheck className="size-4" />
          Uploaded Documents ({documents.length})
        </button>
      </div>

      {/* Tab 1: Generated Reports */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] animate-pulse"
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <EmptyState label="No reports yet." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between space-y-4 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-xs px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)]">
                        {rep.type}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {rep.size}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                      {rep.title}
                    </h3>
                    {rep.project && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)]">
                        <FolderKanban className="size-3" />
                        {rep.project.name}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] space-y-2 text-[11px] text-[var(--text-muted)]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {rep.accountName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(rep.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono uppercase">
                        {rep.status}
                      </span>
                      {rep.fileUrl ? (
                        <a
                          href={rep.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[var(--accent)] font-medium hover:underline"
                        >
                          <Download className="size-3" />
                          Export
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          No file
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Uploaded Documents & Dropzone */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Project selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor="upload-project"
              className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]"
            >
              Associate with project
            </label>
            <select
              id="upload-project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} — {project.accountName}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.005]"
                : "border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)]/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileInputChange}
              disabled={isUploading}
              className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-label="Upload document"
            />
            <div className="size-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mb-3 shadow-xs">
              {isUploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <Upload className="size-6" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {isUploading
                ? "Uploading and queuing for processing…"
                : "Drag & drop contracts, transcripts, or notes"}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              PDF, DOC/DOCX, XLS/XLSX, TXT, MD, CSV, JSON, PNG, JPG, WEBP up to 50MB.
              RF AI extracts metadata automatically.
            </p>
          </div>

          {/* Uploaded Documents List */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/40 flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
              <span>Indexed Files ({documents.length})</span>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                Background processing status
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-elevated)]/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                        <FilePlus className="size-4 text-[var(--accent)]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-[var(--text-primary)]">
                          {doc.fileName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)] flex-wrap">
                          <span>{doc.fileSize}</span>
                          <span>·</span>
                          <span>{formatDate(doc.createdAt)}</span>
                          {doc.project && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-[var(--accent)] font-medium">
                                <FolderKanban className="size-3" />
                                {doc.project.name}
                              </span>
                            </>
                          )}
                          {doc.linkedAccount && (
                            <>
                              <span>·</span>
                              <span>{doc.linkedAccount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Processing Status Pill */}
                    <div className="flex items-center gap-3 shrink-0">
                      {doc.processingStatus === "PENDING" && (
                        <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-mono text-blue-400 border border-blue-500/20">
                          <Loader2 className="size-3 animate-spin" />
                          Processing…
                        </span>
                      )}

                      {doc.processingStatus === "PROCESSED" && (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          Processed
                          {doc.extractedEntitiesCount > 0
                            ? ` (${doc.extractedEntitiesCount} entities)`
                            : ""}
                        </span>
                      )}

                      {doc.processingStatus === "FAILED" && (
                        <span
                          title={doc.failureReason ?? undefined}
                          className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-mono text-rose-400 border border-rose-500/20"
                        >
                          <AlertCircle className="size-3" />
                          Processing error
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-10 text-center text-xs text-[var(--text-muted)]">
      {label}
    </div>
  );
}
