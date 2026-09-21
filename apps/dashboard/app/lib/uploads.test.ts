import { describe, expect, it } from "vitest";
import {
  MAX_UPLOAD_BYTES,
  resolveMimeType,
  validateUploadInput,
} from "@/app/lib/uploads";

describe("validateUploadInput", () => {
  it("accepts an allowed file", () => {
    const result = validateUploadInput({
      fileName: "contract.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mimeType).toBe("application/pdf");
      expect(result.extension).toBe("pdf");
    }
  });

  it("rejects a disallowed extension", () => {
    const result = validateUploadInput({
      fileName: "malware.exe",
      mimeType: "application/octet-stream",
      fileSize: 10,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects files over the size limit", () => {
    const result = validateUploadInput({
      fileName: "huge.pdf",
      mimeType: "application/pdf",
      fileSize: MAX_UPLOAD_BYTES + 1,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-positive size", () => {
    const result = validateUploadInput({
      fileName: "empty.pdf",
      mimeType: "application/pdf",
      fileSize: 0,
    });
    expect(result.ok).toBe(false);
  });

  it("infers the mime type from the extension when the browser omits it", () => {
    const result = validateUploadInput({ fileName: "notes.md", fileSize: 5 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mimeType).toBe("text/markdown");
  });

  it("resolveMimeType falls back to the extension for unknown mime types", () => {
    expect(resolveMimeType("data.csv", "application/octet-stream")).toBe("text/csv");
    expect(resolveMimeType("photo.jpeg")).toBe("image/jpeg");
  });
});
