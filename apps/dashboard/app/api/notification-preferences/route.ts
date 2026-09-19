import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOOL_FIELDS = [
  "emailEnabled",
  "inAppEnabled",
  "emailAlerts",
  "riskSignals",
  "weeklyDigest",
  "slackIntegration",
] as const;

type BoolField = (typeof BOOL_FIELDS)[number];

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

/**
 * Returns the signed-in user's notification preferences.
 * If no row exists (user was created before the preferences feature) the
 * defaults are returned without writing to the DB.
 */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  const pref = await prisma.notificationPreference.findUnique({
    where: { userId: session.userId },
    select: {
      id: true,
      emailEnabled: true,
      inAppEnabled: true,
      emailAlerts: true,
      riskSignals: true,
      weeklyDigest: true,
      slackIntegration: true,
      updatedAt: true,
    },
  });

  if (!pref) {
    // Return schema defaults — no write.
    return json({
      preferences: {
        id: null,
        emailEnabled: true,
        inAppEnabled: true,
        emailAlerts: true,
        riskSignals: true,
        weeklyDigest: true,
        slackIntegration: false,
        updatedAt: null,
      },
    });
  }

  return json({ preferences: pref });
}

/**
 * Upsert the signed-in user's notification preferences.
 * Only boolean fields are accepted; unknown keys are ignored.
 */
export async function PATCH(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const body = (payload ?? {}) as Record<string, unknown>;

  // Collect only valid boolean fields from the body.
  const updates: Partial<Record<BoolField, boolean>> = {};
  for (const field of BOOL_FIELDS) {
    if (typeof body[field] === "boolean") {
      updates[field] = body[field] as boolean;
    }
  }

  if (Object.keys(updates).length === 0) {
    return json(
      {
        error: `Provide at least one of: ${BOOL_FIELDS.join(", ")}`,
      },
      400,
    );
  }

  const pref = await prisma.notificationPreference.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      organizationId: session.organizationId,
      ...updates,
    },
    update: updates,
    select: {
      id: true,
      emailEnabled: true,
      inAppEnabled: true,
      emailAlerts: true,
      riskSignals: true,
      weeklyDigest: true,
      slackIntegration: true,
      updatedAt: true,
    },
  });

  return json({ preferences: pref });
}
