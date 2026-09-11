"use client";

import React, { useState } from "react";
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
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface GeneratedReport {
  id: string;
  title: string;
  type: "QBR Deck" | "Executive Summary" | "Health Scorecard" | "Pipeline Risk";
  accountName: string;
  createdAt: string;
  author: string;
  size: string;
  status: "ready" | "processing";
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  processingStatus: "indexed" | "processing" | "failed";
  linkedAccount?: string;
  extractedEntitiesCount: number;
}

const INITIAL_REPORTS: GeneratedReport[] = [
  {
    id: "rep_1",
    title: "GlobalFin Q3 QBR Presentation Deck",
    type: "QBR Deck",
    accountName: "GlobalFin",
    createdAt: "Sep 10, 2026",
    author: "RF AI Agent",
    size: "14.2 MB",
    status: "ready",
  },
  {
    id: "rep_2",
    title: "Acme Corp Executive Sentiment Briefing",
    type: "Executive Summary",
    accountName: "Acme Corp",
    createdAt: "Sep 09, 2026",
    author: "Jordan Ellis",
    size: "2.8 MB",
    status: "ready",
  },
  {
    id: "rep_3",
    title: "Meridian Health Q3 Retention & Seat Analysis",
    type: "Health Scorecard",
    accountName: "Meridian Health",
    createdAt: "Sep 07, 2026",
    author: "RF AI Agent",
    size: "5.1 MB",
    status: "ready",
  },
  {
    id: "rep_4",
    title: "Q4 Enterprise Concentration & HHI Audit",
    type: "Pipeline Risk",
    accountName: "Cross-Account",
    createdAt: "Sep 04, 2026",
    author: "RF AI Agent",
    size: "8.4 MB",
    status: "ready",
  },
];

const INITIAL_DOCUMENTS: UploadedDocument[] = [
  {
    id: "doc_1",
    fileName: "Acme_Master_Services_Agreement_2026.pdf",
    fileSize: "4.5 MB",
    uploadedAt: "Sep 08, 2026",
    uploadedBy: "Jordan Ellis",
    processingStatus: "indexed",
    linkedAccount: "Acme Corp",
    extractedEntitiesCount: 38,
  },
  {
    id: "doc_2",
    fileName: "Meridian_Clinical_Security_Compliance_V2.pdf",
    fileSize: "12.1 MB",
    uploadedAt: "Sep 06, 2026",
    uploadedBy: "Priya Sharma",
    processingStatus: "indexed",
    linkedAccount: "Meridian Health",
    extractedEntitiesCount: 64,
  },
  {
    id: "doc_3",
    fileName: "Northstar_Labs_Onboarding_Signoff.docx",
    fileSize: "1.2 MB",
    uploadedAt: "Sep 02, 2026",
    uploadedBy: "Tom Kwan",
    processingStatus: "indexed",
    linkedAccount: "Northstar Labs",
    extractedEntitiesCount: 19,
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"reports" | "documents">("reports");
  const [reports, setReports] = useState<GeneratedReport[]>(INITIAL_REPORTS);
  const [documents, setDocuments] = useState<UploadedDocument[]>(INITIAL_DOCUMENTS);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file.name, (file.size / (1024 * 1024)).toFixed(1) + " MB");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      simulateFileUpload(file.name, (file.size / (1024 * 1024)).toFixed(1) + " MB");
    }
  };

  const simulateFileUpload = (fileName: string, fileSize: string) => {
    const newDocId = `doc_${Date.now()}`;
    const newDoc: UploadedDocument = {
      id: newDocId,
      fileName,
      fileSize,
      uploadedAt: "Just now",
      uploadedBy: "Jordan Ellis",
      processingStatus: "processing",
      linkedAccount: "Acme Corp",
      extractedEntitiesCount: 0,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveTab("documents");

    // Simulate AI indexing background completion
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === newDocId
            ? { ...doc, processingStatus: "indexed", extractedEntitiesCount: 24 }
            : doc
        )
      );
    }, 2500);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newRep: GeneratedReport = {
        id: `rep_${Date.now()}`,
        title: "Q4 Customer Health & Churn Vulnerability Report",
        type: "Executive Summary",
        accountName: "Acme Corp",
        createdAt: "Just now",
        author: "RF AI Agent",
        size: "3.4 MB",
        status: "ready",
      };
      setReports((prev) => [newRep, ...prev]);
      setIsGenerating(false);
    }, 1500);
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
            AI-compiled presentation decks, contract analyses, and indexed customer documentation.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {isGenerating ? "Compiling Report..." : "Generate AI Report"}
        </button>
      </div>

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
                </div>

                <div className="pt-3 border-t border-[var(--border)] space-y-2 text-[11px] text-[var(--text-muted)]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3" />
                      {rep.accountName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {rep.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono">By {rep.author}</span>
                    <button
                      onClick={() => alert(`Downloading ${rep.title}...`)}
                      className="flex items-center gap-1 text-xs text-[var(--accent)] font-medium hover:underline"
                    >
                      <Download className="size-3" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Uploaded Documents & Dropzone */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Interactive Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.005]"
                : "border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)]/40"
            }`}
          >
            <input
              type="file"
              onChange={handleFileInputChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Upload document"
            />
            <div className="size-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mb-3 shadow-xs">
              <Upload className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Drag & drop contracts, transcripts, or notes
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              PDF, DOCX, TXT up to 50MB. RF AI will automatically extract entities, terms, and sentiment.
            </p>
          </div>

          {/* Uploaded Documents List */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/40 flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
              <span>Indexed Files ({documents.length})</span>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                NLP Knowledge Graph Status
              </span>
            </div>

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
                        <span>Uploaded by {doc.uploadedBy}</span>
                        <span>·</span>
                        <span>{doc.uploadedAt}</span>
                        {doc.linkedAccount && (
                          <>
                            <span>·</span>
                            <span className="text-[var(--accent)] font-medium">
                              {doc.linkedAccount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Processing Status Pill */}
                  <div className="flex items-center gap-3 shrink-0">
                    {doc.processingStatus === "indexed" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        Indexed ({doc.extractedEntitiesCount} entities)
                      </span>
                    )}

                    {doc.processingStatus === "processing" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-mono text-blue-400 border border-blue-500/20">
                        <Loader2 className="size-3 animate-spin" />
                        AI Extraction in Progress...
                      </span>
                    )}

                    {doc.processingStatus === "failed" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-mono text-rose-400 border border-rose-500/20">
                        <AlertCircle className="size-3" />
                        Processing Error
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
