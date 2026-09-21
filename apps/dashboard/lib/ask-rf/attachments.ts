/**
 * File signature (magic bytes) validation and text extraction for attachments.
 * Allows up to 4 files.
 * Images: png, jpeg, webp, gif (max 5MB each)
 * Documents: pdf, docx, txt, md, csv, xlsx (max 10MB each)
 */

export interface ValidatedAttachment {
  name: string;
  mimeType: string;
  size: number;
  extractedText?: string;
  isImage: boolean;
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_DOC_SIZE = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS = 4;

export function validateMagicBytes(buffer: Buffer): { mimeType: string; isImage: boolean } | null {
  if (buffer.length < 4) return null;

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mimeType: "image/png", isImage: true };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", isImage: true };
  }
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { mimeType: "image/gif", isImage: true };
  }
  // WEBP: 52 49 46 46 ... 57 45 42 50
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mimeType: "image/webp", isImage: true };
  }
  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mimeType: "application/pdf", isImage: false };
  }
  // ZIP / DOCX / XLSX: 50 4B 03 04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return { mimeType: "application/zip", isImage: false };
  }

  // Check if buffer is plain text / csv / md (no null bytes in first 512 bytes)
  const probeLen = Math.min(buffer.length, 512);
  let isText = true;
  for (let i = 0; i < probeLen; i++) {
    if (buffer[i] === 0x00) {
      isText = false;
      break;
    }
  }

  if (isText) {
    return { mimeType: "text/plain", isImage: false };
  }

  return null;
}

export function extractTextFromAttachment(name: string, buffer: Buffer): string {
  // Simple UTF-8 text parser for txt/md/csv
  const str = buffer.toString("utf-8");
  // Limit to token budget (~10,000 characters)
  return str.slice(0, 10000);
}
