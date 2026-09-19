import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { writeAuditLog } from "@/app/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_ROLES = ["ADMIN", "MEMBER"] as const;
type MemberRole = (typeof VALID_ROLES)[number];

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

/**
 * Change a member's role (Admin only).
 *
 * Last-Admin guard: an Admin cannot be demoted if they are the only Admin
 * left in the organization.
 */
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/organization/members/[id]">,
): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (session.role !== "ADMIN") return json({ error: "Forbidden" }, 403);

  const { id } = await ctx.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const roleRaw =
    typeof body.role === "string" ? body.role.trim().toUpperCase() : "";

  if (!VALID_ROLES.includes(roleRaw as MemberRole)) {
    return json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` }, 400);
  }
  const newRole = roleRaw as MemberRole;

  // Verify the target is in the same org.
  const target = await prisma.user.findFirst({
    where: { id, organizationId: session.organizationId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!target) return json({ error: "Member not found" }, 404);

  if (target.role === newRole) {
    return json({ error: "Member already has that role" }, 409);
  }

  // Last-Admin guard: block demoting an Admin when they're the only one.
  if (target.role === "ADMIN" && newRole === "MEMBER") {
    const adminCount = await prisma.user.count({
      where: { organizationId: session.organizationId, role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return json(
        {
          error:
            "Cannot demote the last Admin. Promote another member to Admin first.",
        },
        422,
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });

  await writeAuditLog({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "MEMBER_ROLE_CHANGED",
    entityType: "User",
    entityId: id,
    metadata: {
      targetEmail: target.email,
      before: target.role,
      after: newRole,
      changedBy: session.email,
    },
  });

  return json({ member: updated });
}

/**
 * Remove a member from the organization (Admin only).
 *
 * Last-Admin guard: cannot remove the last Admin.
 * Self-removal is also blocked (use account deletion for that).
 */
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/organization/members/[id]">,
): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (session.role !== "ADMIN") return json({ error: "Forbidden" }, 403);

  const { id } = await ctx.params;

  if (id === session.userId) {
    return json({ error: "You cannot remove yourself — contact another Admin" }, 422);
  }

  const target = await prisma.user.findFirst({
    where: { id, organizationId: session.organizationId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!target) return json({ error: "Member not found" }, 404);

  // Last-Admin guard: cannot delete the only Admin.
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { organizationId: session.organizationId, role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return json(
        {
          error:
            "Cannot remove the last Admin. Promote another member to Admin first.",
        },
        422,
      );
    }
  }

  await prisma.user.delete({ where: { id } });

  await writeAuditLog({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "MEMBER_REMOVED",
    entityType: "User",
    entityId: id,
    metadata: {
      targetEmail: target.email,
      targetName: target.name,
      targetRole: target.role,
      removedBy: session.email,
    },
  });

  return json({ ok: true });
}
