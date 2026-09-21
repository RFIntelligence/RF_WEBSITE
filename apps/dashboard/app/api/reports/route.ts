import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

interface ReportWithProject {
  id: string;
  title: string;
  type: string;
  accountName: string;
  size: string;
  status: string;
  fileUrl: string | null;
  createdAt: Date;
  project: { id: string; name: string } | null;
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function parseLimit(raw: string | null): number {
  const parsed = raw === null || raw.trim() === "" ? NaN : Number(raw);
  return Number.isFinite(parsed)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(parsed)))
    : DEFAULT_LIMIT;
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") || undefined;
  const limit = parseLimit(url.searchParams.get("limit"));

  const reports = await prisma.report.findMany({
    where: {
      organizationId: session.organizationId,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { project: { select: { id: true, name: true } } },
  });

  return json({
    reports: reports.map((report: ReportWithProject) => ({
      id: report.id,
      title: report.title,
      type: report.type,
      accountName: report.accountName,
      size: report.size,
      status: report.status,
      fileUrl: report.fileUrl,
      createdAt: report.createdAt,
      project: report.project,
    })),
  });
}
