import { prisma } from "@/app/lib/db";
import { getObjectText, headObject } from "@/app/lib/storage";
import { extractMetadata } from "@/app/lib/documents/metadata";
import { formatBytes } from "@/app/lib/format";

const MAX_TEXT_BYTES = 5 * 1024 * 1024;

const TEXT_LIKE_MIME = [
  "text/",
  "application/json",
  "application/xml",
  "application/csv",
];

export function isTextLike(contentType: string | undefined): boolean {
  if (!contentType) return false;
  const normalized = contentType.toLowerCase();
  return TEXT_LIKE_MIME.some((prefix) => normalized.startsWith(prefix));
}

export type ProcessResult =
  | { status: "PROCESSED"; entitiesCount: number }
  | { status: "FAILED"; reason: string };

function accountNameFor(document: {
  linkedAccount: string | null;
  project: { accountName: string } | null;
}): string {
  return document.linkedAccount ?? document.project?.accountName ?? "Unassigned";
}

/**
 * Core document-processing routine, also invoked by the Inngest function.
 *
 * Tenant safety: the document is loaded with `findFirst({ id, organizationId })`
 * and updated with `updateMany({ id, organizationId })`, so a document can only
 * ever be read or mutated within its own organization.
 *
 * A lightweight, metadata-only Report row is generated for every successfully
 * processed document (no LLM call). The upsert is keyed on `documentId`, so
 * reprocessing a document refreshes its report instead of duplicating it.
 */
export async function processDocument(
  documentId: string,
  organizationId: string,
): Promise<ProcessResult> {
  const document = await prisma.document.findFirst({
    where: { id: documentId, organizationId },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      mimeType: true,
      storageKey: true,
      projectId: true,
      linkedAccount: true,
      uploadedById: true,
      project: { select: { accountName: true } },
    },
  });

  if (!document) {
    throw new Error(
      `Document ${documentId} was not found in organization ${organizationId}`,
    );
  }

  try {
    if (!document.storageKey) {
      throw new Error("Document has no storage key");
    }

    const head = await headObject(document.storageKey);
    const contentType = document.mimeType ?? head.contentType ?? "application/octet-stream";

    let text: string | null = null;
    if (isTextLike(contentType) && head.contentLength <= MAX_TEXT_BYTES) {
      text = await getObjectText(document.storageKey, MAX_TEXT_BYTES);
    }

    const metadata = extractMetadata({
      text,
      fileName: document.fileName,
      contentType,
      byteSize: head.contentLength,
    });
    const fileSize = formatBytes(head.contentLength);

    await prisma.document.updateMany({
      where: { id: document.id, organizationId },
      data: {
        processingStatus: "PROCESSED",
        metadataJson: JSON.stringify(metadata),
        extractedEntitiesCount: metadata.entitiesCount,
        fileSize,
        failureReason: null,
      },
    });

    // Best-effort: a reporting failure must not fail the document itself.
    try {
      const reportData = {
        title: `Analysis: ${document.fileName}`,
        type: "Document Analysis",
        accountName: accountNameFor(document),
        size: fileSize,
        status: "READY" as const,
        fileUrl: document.fileUrl,
        projectId: document.projectId,
      };

      await prisma.report.upsert({
        where: { documentId: document.id },
        create: {
          organizationId,
          createdById: document.uploadedById,
          documentId: document.id,
          ...reportData,
        },
        update: reportData,
      });
    } catch (error) {
      console.error("documents: failed to generate report", error);
    }

    return { status: "PROCESSED", entitiesCount: metadata.entitiesCount };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown processing error";
    await prisma.document.updateMany({
      where: { id: document.id, organizationId },
      data: { processingStatus: "FAILED", failureReason: reason },
    });
    return { status: "FAILED", reason };
  }
}
