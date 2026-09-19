import { randomUUID } from "node:crypto";
import { formatBytes } from "@/app/lib/format";

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export const ALLOWED_EXTENSIONS = new Set(Object.keys(MIME_BY_EXTENSION));
export const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));
export const ALLOWED_EXTENSIONS_LABEL = [...ALLOWED_EXTENSIONS].join(", ");

export function extensionOf(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index + 1).toLowerCase() : "";
}

export function resolveMimeType(
  fileName: string,
  mimeType?: string,
): string | undefined {
  if (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) return mimeType;
  return MIME_BY_EXTENSION[extensionOf(fileName)];
}

export type UploadValidationResult =
  | {
      ok: true;
      fileName: string;
      mimeType: string;
      fileSize: number;
      extension: string;
    }
  | { ok: false; error: string };

export function validateUploadInput(input: {
  fileName?: unknown;
  mimeType?: unknown;
  fileSize?: unknown;
}): UploadValidationResult {
  const fileName = typeof input.fileName === "string" ? input.fileName.trim() : "";
  if (!fileName) return { ok: false, error: "fileName is required" };
  if (fileName.length > 255) {
    return { ok: false, error: "fileName must be 255 characters or fewer" };
  }

  const extension = extensionOf(fileName);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      error: `Unsupported file type. Allowed types: ${ALLOWED_EXTENSIONS_LABEL}`,
    };
  }

  const fileSize =
    typeof input.fileSize === "number" ? input.fileSize : Number(input.fileSize);
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return { ok: false, error: "fileSize must be a positive number" };
  }
  if (fileSize > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File is too large. Maximum size is ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    };
  }

  const mimeType = resolveMimeType(
    fileName,
    typeof input.mimeType === "string" ? input.mimeType : undefined,
  );
  if (!mimeType) {
    return { ok: false, error: "Unsupported file type." };
  }

  return { ok: true, fileName, mimeType, fileSize, extension };
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

export function buildStorageKey(organizationId: string, fileName: string): string {
  const year = new Date().getUTCFullYear();
  return `${organizationId}/${year}/${randomUUID()}-${sanitizeFileName(fileName)}`;
}
