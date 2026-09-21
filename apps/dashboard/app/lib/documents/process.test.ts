import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const findFirst = vi.fn();
  const updateMany = vi.fn();
  const upsert = vi.fn();
  const headObject = vi.fn();
  const getObjectText = vi.fn();
  return {
    findFirst,
    updateMany,
    upsert,
    headObject,
    getObjectText,
    prisma: {
      document: { findFirst, updateMany },
      report: { upsert },
    },
  };
});

vi.mock("@/app/lib/db", () => ({ prisma: h.prisma }));
vi.mock("@/app/lib/storage", () => ({
  headObject: h.headObject,
  getObjectText: h.getObjectText,
}));

import { processDocument } from "@/app/lib/documents/process";

function documentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc_a",
    fileName: "notes.txt",
    fileUrl: "https://storage.example/org_a/notes.txt",
    mimeType: "text/plain",
    storageKey: "org_a/notes.txt",
    projectId: "proj_a",
    linkedAccount: "Acme Corp",
    uploadedById: "usr_a",
    project: { accountName: "Meridian Health" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("processDocument", () => {
  it("marks PROCESSED, scopes queries by organization and generates a report", async () => {
    h.findFirst.mockResolvedValue(documentRow());
    h.headObject.mockResolvedValue({ contentLength: 160, contentType: "text/plain" });
    h.getObjectText.mockResolvedValue(
      "Contact jane@acme.com on 2026-09-20 about $1,200. See https://acme.com/docs",
    );
    h.updateMany.mockResolvedValue({ count: 1 });
    h.upsert.mockResolvedValue({ id: "rep_a" });

    const result = await processDocument("doc_a", "org_a");

    expect(result.status).toBe("PROCESSED");
    expect(h.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "doc_a", organizationId: "org_a" } }),
    );

    const updateArg = h.updateMany.mock.calls[0][0] as {
      where: { id: string; organizationId: string };
      data: { processingStatus: string; extractedEntitiesCount: number };
    };
    expect(updateArg.where).toEqual({ id: "doc_a", organizationId: "org_a" });
    expect(updateArg.data.processingStatus).toBe("PROCESSED");
    expect(updateArg.data.extractedEntitiesCount).toBeGreaterThan(0);

    expect(h.upsert).toHaveBeenCalledTimes(1);
    const upsertArg = h.upsert.mock.calls[0][0] as {
      where: { documentId: string };
      create: {
        organizationId: string;
        createdById: string;
        documentId: string;
        type: string;
        accountName: string;
        projectId: string | null;
      };
    };
    expect(upsertArg.where).toEqual({ documentId: "doc_a" });
    expect(upsertArg.create).toMatchObject({
      organizationId: "org_a",
      createdById: "usr_a",
      documentId: "doc_a",
      type: "Document Analysis",
      accountName: "Acme Corp",
      projectId: "proj_a",
    });
  });

  it("falls back to the project account when no linked account is set", async () => {
    h.findFirst.mockResolvedValue(documentRow({ linkedAccount: null }));
    h.headObject.mockResolvedValue({ contentLength: 10, contentType: "text/plain" });
    h.getObjectText.mockResolvedValue("hello");
    h.updateMany.mockResolvedValue({ count: 1 });
    h.upsert.mockResolvedValue({ id: "rep_a" });

    await processDocument("doc_a", "org_a");

    const upsertArg = h.upsert.mock.calls[0][0] as {
      create: { accountName: string };
    };
    expect(upsertArg.create.accountName).toBe("Meridian Health");
  });

  it("marks FAILED when the object cannot be read and does not generate a report", async () => {
    h.findFirst.mockResolvedValue(documentRow());
    h.headObject.mockRejectedValue(new Error("object not found"));
    h.updateMany.mockResolvedValue({ count: 1 });

    const result = await processDocument("doc_a", "org_a");

    expect(result.status).toBe("FAILED");
    const updateArg = h.updateMany.mock.calls[0][0] as {
      where: { id: string; organizationId: string };
      data: { processingStatus: string; failureReason: string };
    };
    expect(updateArg.where).toEqual({ id: "doc_a", organizationId: "org_a" });
    expect(updateArg.data.processingStatus).toBe("FAILED");
    expect(updateArg.data.failureReason).toContain("object not found");
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("refuses to process a document outside the organization", async () => {
    h.findFirst.mockResolvedValue(null);
    await expect(processDocument("doc_b", "org_a")).rejects.toThrow();
    expect(h.updateMany).not.toHaveBeenCalled();
    expect(h.upsert).not.toHaveBeenCalled();
  });
});
