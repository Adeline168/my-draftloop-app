import type { ExtractionStatus } from "@/lib/types";

// Text extraction is plain code, not AI — kept out of lib/ai/ per the
// architecture's "core runs without AI" split. Runs server-side only
// (Node buffers, pdf/docx parsers).

const MAX_EXTRACTED_CHARS = 40_000; // generous cap; prompt-time truncation happens separately

export interface ExtractResult {
  text: string | null;
  status: ExtractionStatus;
}

function isTextLike(fileName: string, mimeType: string | null): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    mimeType === "text/plain" ||
    mimeType === "text/markdown"
  );
}

function isPdf(fileName: string, mimeType: string | null): boolean {
  return fileName.toLowerCase().endsWith(".pdf") || mimeType === "application/pdf";
}

function isDocx(fileName: string, mimeType: string | null): boolean {
  return (
    fileName.toLowerCase().endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

export async function extractText(
  bytes: Buffer,
  fileName: string,
  mimeType: string | null,
): Promise<ExtractResult> {
  try {
    if (isTextLike(fileName, mimeType)) {
      const text = bytes.toString("utf-8");
      return { text: text.slice(0, MAX_EXTRACTED_CHARS), status: "done" };
    }

    if (isPdf(fileName, mimeType)) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: bytes });
      try {
        const result = await parser.getText();
        return { text: result.text.slice(0, MAX_EXTRACTED_CHARS), status: "done" };
      } finally {
        await parser.destroy();
      }
    }

    if (isDocx(fileName, mimeType)) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: bytes });
      return { text: result.value.slice(0, MAX_EXTRACTED_CHARS), status: "done" };
    }

    return { text: null, status: "unsupported" };
  } catch {
    return { text: null, status: "failed" };
  }
}
