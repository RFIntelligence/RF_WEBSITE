import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { writeAuditLog } from "@/app/lib/audit";
import { createInviteToken } from "@/app/lib/invite-token";
import { sendEmail } from "@/app/lib/email";
import { rateLimit } from "@/app/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const VALID_ROLES = ["ADMIN", "MEMBER"] as const;
type InviteRole = (typeof VALID_ROLES)[number];

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

/**
 * List pending invitations for this organization (Admin only).
 */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (session.role !== "ADMIN") return json({ error: "Forbidden" }, 403);

  const invitations = await prisma.invitation.findMany({
    where: {
      organizationId: session.organizationId,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      invitedBy: { select: { name: true, email: true } },
    },
  });

  return json({ invitations });
}

/**
 * Send an invitation email to a new team member (Admin only).
 *
 * - Rate-limited to 10 invites per admin per minute.
 * - Re-uses an existing PENDING invite for the same email (idempotent).
 * - Creates a signed token embedded in the accept URL.
 * - Writes an AuditLog entry.
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (session.role !== "ADMIN") return json({ error: "Forbidden" }, 403);

  const rl = rateLimit(`invite:${session.userId}`, 10, 60_000);
  if (!rl.allowed) {
    return json({ error: "Too many requests — try again shortly" }, 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const roleRaw =
    typeof body.role === "string" ? body.role.trim().toUpperCase() : "MEMBER";

  if (!email || !email.includes("@")) {
    return json({ error: "A valid email address is required" }, 400);
  }
  if (!VALID_ROLES.includes(roleRaw as InviteRole)) {
    return json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` }, 400);
  }
  const role = roleRaw as InviteRole;

  // Block inviting an email that already belongs to an org member.
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { organizationId: true },
  });
  if (existingUser) {
    if (existingUser.organizationId === session.organizationId) {
      return json({ error: "That person is already a member of your organization" }, 409);
    }
    return json({ error: "That email is already registered" }, 409);
  }

  // Revoke any existing PENDING invites for this email in this org so only
  // one token is ever live at a time.
  await prisma.invitation.updateMany({
    where: {
      organizationId: session.organizationId,
      email,
      status: "PENDING",
    },
    data: { status: "REVOKED" },
  });

  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  // Create the invitation row first so we have an id for the token payload.
  const invitation = await prisma.invitation.create({
    data: {
      organizationId: session.organizationId,
      invitedById: session.userId,
      email,
      role,
      token: "pending", // replaced in the next step
      expiresAt,
    },
    select: { id: true, email: true, role: true, expiresAt: true },
  });

  // Sign the token with the invitation id embedded so it can be looked up.
  const token = createInviteToken(invitation.id);

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { token },
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const acceptUrl = `${appUrl}/accept-invitation?token=${encodeURIComponent(token)}`;

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true },
  });

  await sendEmail({
    to: email,
    subject: `You've been invited to join ${org?.name ?? "RF Intelligence"}`,
    body: [
      `Hi there,`,
      ``,
      `${session.name} has invited you to join ${org?.name ?? "RF Intelligence"} on RF Intelligence as a ${role}.`,
      ``,
      `Accept your invitation and set your password here:`,
      acceptUrl,
      ``,
      `This link expires in 7 days.`,
    ].join("\n"),
  });

  await writeAuditLog({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "INVITATION_SENT",
    entityType: "Invitation",
    entityId: invitation.id,
    metadata: { email, role },
  });

  const { notifyOrgDataChanged } = await import("@/app/lib/data-sync");
  await notifyOrgDataChanged(session.organizationId, ["team"]);

  return json(
    {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    },
    201,
  );
}
