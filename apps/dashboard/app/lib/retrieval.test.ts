import { beforeEach, describe, expect, it, vi } from "vitest";

interface Row {
  organizationId: string;
  createdAt: Date;
  [key: string]: unknown;
}

const h = vi.hoisted(() => {
  const now = new Date("2026-09-19T10:00:00Z");

  const insights: Row[] = [
    {
      id: "ins_1",
      organizationId: "org_a",
      type: "RISK",
      severity: "CRITICAL",
      title: "Pipeline concentration risk",
      body: "3 accounts represent 61% of Q4 ARR.",
      accountName: null,
      whatHappened: "Concentration detected.",
      whyDetected: "HHI score 0.38.",
      businessImpact: "Target at risk.",
      recommendedAction: "Diversify.",
      createdAt: now,
    },
  ];
  const projects: Row[] = [
    {
      id: "proj_1",
      organizationId: "org_a",
      name: "Acme Renewal Prep",
      accountName: "Acme Corp",
      status: "AT_RISK",
      progress: 45,
      dueDate: now,
      openTasksCount: 9,
      createdAt: now,
    },
  ];
  const reports: Row[] = [
    {
      id: "rep_1",
      organizationId: "org_a",
      title: "GlobalFin Q3 QBR",
      type: "QBR Deck",
      accountName: "GlobalFin",
      status: "READY",
      size: "14 MB",
      createdAt: now,
    },
  ];
  const documents: Row[] = [
    {
      id: "doc_1",
      organizationId: "org_a",
      fileName: "doc3_repayment_statement.txt",
      fileSize: "3.8 KB",
      linkedAccount: "Acme Corp",
      extractedEntitiesCount: 6,
      metadataJson: JSON.stringify({
        excerpt: "Repayment schedule for the Acme facility.",
        emails: ["jane@acme.com"],
        dates: ["2026-09-20"],
        amounts: ["$1,200"],
        wordCount: 120,
      }),
      createdAt: now,
    },
    {
      id: "doc_other",
      organizationId: "org_b",
      fileName: "secret.txt",
      fileSize: "1 KB",
      linkedAccount: null,
      extractedEntitiesCount: 1,
      metadataJson: null,
      createdAt: now,
    },
  ];

  function finder(rows: Row[]) {
    return vi.fn(async (args: { where?: { organizationId?: string } }) => {
      const organizationId = args?.where?.organizationId;
      if (typeof organizationId !== "string" || organizationId.length === 0) {
        throw new Error("[tenant-guard] missing organizationId");
      }
      return rows.filter((row) => row.organizationId === organizationId);
    });
  }

  const insightFindMany = finder(insights);
  const projectFindMany = finder(projects);
  const reportFindMany = finder(reports);
  const documentFindMany = finder(documents);

  return {
    insightFindMany,
    projectFindMany,
    reportFindMany,
    documentFindMany,
    prisma: {
      insight: { findMany: insightFindMany },
      project: { findMany: projectFindMany },
      report: { findMany: reportFindMany },
      document: { findMany: documentFindMany },
    },
  };
});

vi.mock("@/app/lib/db", () => ({ prisma: h.prisma }));

import { retrieveContext } from "./retrieval";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("retrieveContext", () => {
  it("includes processed documents and excludes other tenants", async () => {
    const sources = await retrieveContext("org_a", "doc3 repayment statement");

    const docSource = sources.find((source) => source.type === "document");
    expect(docSource).toBeDefined();
    expect(docSource?.title).toBe("doc3_repayment_statement.txt");
    expect(docSource?.summary).toContain("Repayment schedule");
    expect(docSource?.summary).toContain("jane@acme.com");

    expect(sources.some((source) => source.title === "secret.txt")).toBe(false);
    expect(h.documentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_a",
          processingStatus: "PROCESSED",
        }),
      }),
    );
  });

  it("excludes generated document-analysis reports to avoid duplicate context", async () => {
    await retrieveContext("org_a", "anything");
    expect(h.reportFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org_a", documentId: null }),
      }),
    );
  });

  it("throws without an organization id", async () => {
    await expect(retrieveContext("", "hi")).rejects.toThrow();
  });
});
