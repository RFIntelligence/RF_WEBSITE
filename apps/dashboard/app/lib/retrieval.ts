import { prisma } from "@/app/lib/db";

export type SourceType = "insight" | "project" | "report" | "document";

export interface RetrievedSource {
  id: string;
  type: SourceType;
  title: string;
  summary: string;
  createdAt: Date;
}

const PER_TYPE_LIMIT = 25;
const MAX_SOURCES = 6;

const STOPWORDS = new Set([
  "the", "and", "for", "are", "our", "you", "your", "with", "this", "that",
  "from", "what", "which", "who", "how", "why", "when", "where", "can", "could",
  "would", "should", "does", "did", "has", "have", "had", "was", "were", "will",
  "about", "into", "over", "under", "any", "all", "some", "most", "more", "than",
  "them", "they", "their", "there", "here", "its", "it's", "not", "but", "get",
  "give", "show", "tell", "need", "want", "please", "me", "my", "we", "us",
]);

function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
    ),
  );
}

function score(source: RetrievedSource, terms: string[]): number {
  if (terms.length === 0) return 0;
  const haystack = `${source.title} ${source.summary}`.toLowerCase();
  return terms.reduce((total, term) => (haystack.includes(term) ? total + 1 : total), 0);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface ParsedMetadata {
  excerpt: string | null;
  emails: string[];
  dates: string[];
  amounts: string[];
  wordCount: number | null;
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseMetadata(metadataJson: string | null): ParsedMetadata {
  const empty: ParsedMetadata = {
    excerpt: null,
    emails: [],
    dates: [],
    amounts: [],
    wordCount: null,
  };
  if (!metadataJson) return empty;

  try {
    const parsed = JSON.parse(metadataJson) as Record<string, unknown>;
    return {
      excerpt: typeof parsed.excerpt === "string" ? parsed.excerpt : null,
      emails: asStringList(parsed.emails),
      dates: asStringList(parsed.dates),
      amounts: asStringList(parsed.amounts),
      wordCount: typeof parsed.wordCount === "number" ? parsed.wordCount : null,
    };
  } catch {
    return empty;
  }
}

function documentSummary(document: {
  fileName: string;
  fileSize: string;
  linkedAccount: string | null;
  extractedEntitiesCount: number;
  metadataJson: string | null;
}): string {
  const meta = parseMetadata(document.metadataJson);
  return [
    `Uploaded document "${document.fileName}" (${document.fileSize})`,
    document.linkedAccount ? `account: ${document.linkedAccount}` : null,
    meta.wordCount !== null ? `${meta.wordCount} words` : null,
    `${document.extractedEntitiesCount} extracted entities`,
    meta.emails.length ? `emails: ${meta.emails.join(", ")}` : null,
    meta.dates.length ? `dates: ${meta.dates.join(", ")}` : null,
    meta.amounts.length ? `amounts: ${meta.amounts.join(", ")}` : null,
    meta.excerpt ? `Excerpt: ${meta.excerpt}` : null,
  ]
    .filter(Boolean)
    .join(". ");
}

/**
 * Retrieves the organization's Insights, Projects, Reports and processed
 * Documents relevant to the question.
 *
 * SECURITY: every Prisma query below includes `organizationId` in its WHERE
 * clause. There is intentionally no code path that queries these tables without
 * a tenant scope. Do not add one.
 */
export async function retrieveContext(
  organizationId: string,
  question: string,
): Promise<RetrievedSource[]> {
  if (!organizationId) {
    throw new Error("retrieveContext requires an organizationId");
  }

  const [insights, projects, reports, documents] = await Promise.all([
    prisma.insight.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: PER_TYPE_LIMIT,
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        body: true,
        accountName: true,
        whatHappened: true,
        whyDetected: true,
        businessImpact: true,
        recommendedAction: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: PER_TYPE_LIMIT,
      select: {
        id: true,
        name: true,
        accountName: true,
        status: true,
        progress: true,
        dueDate: true,
        openTasksCount: true,
        createdAt: true,
      },
    }),
    // Generated "Document Analysis" reports are metadata mirrors of a document
    // source, so they are excluded here to avoid duplicate context.
    prisma.report.findMany({
      where: { organizationId, documentId: null },
      orderBy: { createdAt: "desc" },
      take: PER_TYPE_LIMIT,
      select: {
        id: true,
        title: true,
        type: true,
        accountName: true,
        status: true,
        size: true,
        createdAt: true,
      },
    }),
    prisma.document.findMany({
      where: { organizationId, processingStatus: "PROCESSED" },
      orderBy: { createdAt: "desc" },
      take: PER_TYPE_LIMIT,
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        linkedAccount: true,
        extractedEntitiesCount: true,
        metadataJson: true,
        createdAt: true,
      },
    }),
  ]);

  const sources: RetrievedSource[] = [
    ...insights.map((insight) => ({
      id: insight.id,
      type: "insight" as const,
      title: insight.title,
      summary: [
        `${insight.type} insight (severity: ${insight.severity})`,
        insight.accountName ? `account: ${insight.accountName}` : null,
        insight.body,
        insight.whatHappened,
        `Why detected: ${insight.whyDetected}`,
        `Business impact: ${insight.businessImpact}`,
        `Recommended action: ${insight.recommendedAction}`,
      ]
        .filter(Boolean)
        .join(". "),
      createdAt: insight.createdAt,
    })),
    ...projects.map((project) => ({
      id: project.id,
      type: "project" as const,
      title: project.name,
      summary:
        `Project "${project.name}" for ${project.accountName}. ` +
        `Status: ${project.status}, ${project.progress}% complete, ` +
        `due ${formatDate(project.dueDate)}, ${project.openTasksCount} open tasks.`,
      createdAt: project.createdAt,
    })),
    ...reports.map((report) => ({
      id: report.id,
      type: "report" as const,
      title: report.title,
      summary:
        `Report "${report.title}" (${report.type}) for ${report.accountName}. ` +
        `Status: ${report.status}, size: ${report.size}.`,
      createdAt: report.createdAt,
    })),
    ...documents.map((document) => ({
      id: document.id,
      type: "document" as const,
      title: document.fileName,
      summary: documentSummary(document),
      createdAt: document.createdAt,
    })),
  ];

  const terms = tokenize(question);
  return sources
    .map((source) => ({ source, relevance: score(source, terms) }))
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        b.source.createdAt.getTime() - a.source.createdAt.getTime(),
    )
    .slice(0, MAX_SOURCES)
    .map((entry) => entry.source);
}
