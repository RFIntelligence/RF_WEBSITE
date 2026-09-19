import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { headObject, buildPublicUrl, isStorageConfigured } from "@/app/lib/storage";
import { verifyUploadToken } from "@/app/lib/upload-token";
import { MAX_UPLOAD_BYTES } from "@/app/lib/uploads";
import { formatBytes } from "@/app/lib/format";
import {
  DOCUMENT_PROCESS_EVENT,
  inngest,
} from "@/app/lib/inngest/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const STATUSES = ["PENDING", "PROCESSED", "FAILED"] as const;

type DocumentStatus = (typeof STATUSES)[number];

interface DocumentWithProject {
  id: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  mimeType: string | null;
  processingStatus: string;
  linkedAccount: string | null;
  extractedEntitiesCount: number;
  failureReason: string | null;
  createdAt: Date;
  project: { id: string; name: string } | null;
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function serializeDocument(document: DocumentWithProject) {
  return {
    id: document.id,
    fileName: document.fileName,
    fileSize: document.fileSize,
    fileUrl: document.fileUrl,
    mimeType: document.mimeType,
    processingStatus: document.processingStatus,
    linkedAccount: document.linkedAccount,
    extractedEntitiesCount: document.extractedEntitiesCount,
    failureReason: document.failureReason,
    createdAt: document.createdAt,
    project: document.project,
  };
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") || undefined;
  const statusParam = url.searchParams.get("status");
  const status: DocumentStatus | undefined = STATUSES.includes(
    statusParam as DocumentStatus,
  )
    ? (statusParam as DocumentStatus)
    : undefined;

  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limitParam)))
    : DEFAULT_LIMIT;

  const documents = await prisma.document.findMany({
    where: {
      organizationId: session.organizationId,
      ...(projectId ? { projectId } : {}),
      ...(status ? { processingStatus: status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { project: { select: { id: true, name: true } } },
  });

  return json({ documents: documents.map(serializeDocument) });
}

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  if (!isStorageConfigured()) {
    return json({ error: "File storage is not configured." }, 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const uploadToken = typeof body.uploadToken === "string" ? body.uploadToken : "";
  const verified = verifyUploadToken(uploadToken);

  // The token is signed by us and bound to this organization + user, so a
  // client cannot confirm an upload belonging to another tenant.
  if (
    !verified ||
    verified.organizationId !== session.organizationId ||
    verified.userId !== session.userId
  ) {
    return json({ error: "Invalid or expired upload token" }, 400);
  }

  const projectId =
    typeof body.projectId === "string" && body.projectId.length > 0
      ? body.projectId
      : null;
  const linkedAccount =
    typeof body.linkedAccount === "string" && body.linkedAccount.trim().length > 0
      ? body.linkedAccount.trim()
      : null;

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: session.organizationId },
      select: { id: true },
    });
    if (!project) {
      return json({ error: "Unknown project for this organization" }, 400);
    }
  }

  let head;
  try {
    head = await headObject(verified.key);
  } catch {
    return json({ error: "Uploaded file was not found in storage." }, 400);
  }

  if (head.contentLength > MAX_UPLOAD_BYTES) {
    return json(
      { error: `File is too large. Maximum size is ${formatBytes(MAX_UPLOAD_BYTES)}.` },
      400,
    );
  }

  const document = await prisma.document.create({
    data: {
      organizationId: session.organizationId,
      uploadedById: session.userId,
      projectId,
      fileName: verified.fileName,
      fileSize: formatBytes(head.contentLength),
      fileUrl: buildPublicUrl(verified.key),
      storageKey: verified.key,
      mimeType: verified.mimeType,
      processingStatus: "PENDING",
      linkedAccount,
    },
    include: { project: { select: { id: true, name: true } } },
  });

  // Hand off to the background processor. Failure to enqueue is non-fatal:
  // the document stays PENDING and can be retried.
  try {
    await inngest.send({
      name: DOCUMENT_PROCESS_EVENT,
      data: {
        documentId: document.id,
        organizationId: session.organizationId,
      },
    });
  } catch (error) {
    console.error("documents: failed to enqueue processing job", error);
  }

  return json({ document: serializeDocument(document) }, 201);
}
