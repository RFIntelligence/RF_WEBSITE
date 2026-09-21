import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { withTiming } from "@/app/lib/timing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CachedOrg {
  org: { id: string; name: string; plan: string } | null;
  expiresAt: number;
}
const orgCache = new Map<string, CachedOrg>();
const ORG_CACHE_TTL_MS = 60_000;

export async function GET(): Promise<Response> {
  return withTiming("GET /api/auth/session", async () => {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let organization: { id: string; name: string; plan: string } | null = null;
    const cached = orgCache.get(session.organizationId);
    if (cached && cached.expiresAt > Date.now()) {
      organization = cached.org;
    } else {
      organization = await prisma.organization.findUnique({
        where: { id: session.organizationId },
        select: { id: true, name: true, plan: true },
      });
      orgCache.set(session.organizationId, {
        org: organization,
        expiresAt: Date.now() + ORG_CACHE_TTL_MS,
      });
    }

    return Response.json({
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
      organization,
    });
  });
}
