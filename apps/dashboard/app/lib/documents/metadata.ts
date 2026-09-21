import { extensionOf } from "@/app/lib/uploads";

export interface DocumentMetadata {
  extension: string;
  contentType: string;
  byteSize: number;
  wordCount: number | null;
  charCount: number | null;
  lineCount: number | null;
  pageEstimate: number | null;
  emails: string[];
  urls: string[];
  dates: string[];
  amounts: string[];
  entitiesCount: number;
  excerpt: string | null;
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const URL_RE = /https?:\/\/[^\s)]+/gi;
const DATE_RE =
  /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi;
const AMOUNT_RE = /(?:\$|usd|inr|eur|gbp|€|£)\s?\d[\d,]*(?:\.\d+)?\s?[kmb]?/gi;

const MAX_LIST_ITEMS = 20;

function unique(matches: string[]): string[] {
  return [...new Set(matches.map((match) => match.trim()))];
}

function estimatePages(
  extension: string,
  byteSize: number,
  wordCount: number | null,
): number | null {
  if (extension === "pdf") {
    return Math.max(1, Math.ceil(byteSize / 50_000));
  }
  if (wordCount !== null) {
    return Math.max(1, Math.ceil(wordCount / 500));
  }
  return null;
}

export function extractMetadata(input: {
  text: string | null;
  fileName: string;
  contentType: string;
  byteSize: number;
}): DocumentMetadata {
  const extension = extensionOf(input.fileName);
  const base = {
    extension,
    contentType: input.contentType,
    byteSize: input.byteSize,
  };

  if (input.text === null) {
    return {
      ...base,
      wordCount: null,
      charCount: null,
      lineCount: null,
      pageEstimate: estimatePages(extension, input.byteSize, null),
      emails: [],
      urls: [],
      dates: [],
      amounts: [],
      entitiesCount: 0,
      excerpt: null,
    };
  }

  const text = input.text;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text.length ? text.split(/\r\n|\r|\n/).length : 0;

  const emails = unique(text.match(EMAIL_RE) ?? []);
  const urls = unique(text.match(URL_RE) ?? []);
  const dates = unique(text.match(DATE_RE) ?? []);
  const amounts = unique(text.match(AMOUNT_RE) ?? []);
  const entitiesCount =
    emails.length + urls.length + dates.length + amounts.length;

  return {
    ...base,
    wordCount,
    charCount: text.length,
    lineCount,
    pageEstimate: estimatePages(extension, input.byteSize, wordCount),
    emails: emails.slice(0, MAX_LIST_ITEMS),
    urls: urls.slice(0, MAX_LIST_ITEMS),
    dates: dates.slice(0, MAX_LIST_ITEMS),
    amounts: amounts.slice(0, MAX_LIST_ITEMS),
    entitiesCount,
    excerpt: text.slice(0, 280).replace(/\s+/g, " ").trim() || null,
  };
}
