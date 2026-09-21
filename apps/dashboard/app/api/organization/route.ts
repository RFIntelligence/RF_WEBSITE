import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { writeAuditLog } from "@/app/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 120;
const MAX_PLAN_LENGTH = 60;

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { id: true, name: true, plan: true, createdAt: true },
  });
  if (!org) return json({ error: "Organization not found" }, 404);

  return json({ organization: org });
}

/**
 * Update organization name / plan. Admin only.
 * Writes an AuditLog entry on every successful change.
 */
export async function PATCH(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (session.role !== "ADMIN") return json({ error: "Forbidden" }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const plan = typeof body.plan === "string" ? body.plan.trim() : undefined;

  if (name === undefined && plan === undefined) {
    return json({ error: "Provide at least one of: name, plan" }, 400);
  }
  if (name !== undefined && (name.length === 0 || name.length > MAX_NAME_LENGTH)) {
    return json(
      { error: `Organization name must be 1–${MAX_NAME_LENGTH} characters` },
      400,
    );
  }
  if (plan !== undefined && (plan.length === 0 || plan.length > MAX_PLAN_LENGTH)) {
    return json(
      { error: `Plan must be 1–${MAX_PLAN_LENGTH} characters` },
      400,
    );
  }

  const existing = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true, plan: true },
  });
  if (!existing) return json({ error: "Organization not found" }, 404);

  const updated = await prisma.organization.update({
    where: { id: session.organizationId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(plan !== undefined ? { plan } : {}),
    },
    select: { id: true, name: true, plan: true, updatedAt: true },
  });

  await writeAuditLog({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "ORGANIZATION_UPDATED",
    entityType: "Organization",
    entityId: session.organizationId,
    metadata: {
      before: { name: existing.name, plan: existing.plan },
      after: { name: updated.name, plan: updated.plan },
    },
  });

  return json({ organization: updated });
}
