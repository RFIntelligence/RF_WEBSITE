import { prisma } from "@/app/lib/db";
import { sendEmail } from "@/app/lib/email";

/**
 * Preference-aware notification delivery.
 *
 * In-app notifications are written to the `Notification` model in a single
 * batched insert and emails are only dispatched when the recipient's
 * `NotificationPreference` allows the relevant category. A missing preference
 * row falls back to the model defaults (in-app + email enabled).
 */

export type NotificationCategory =
  | "emailAlerts"
  | "riskSignals"
  | "weeklyDigest";

export interface DeliverNotificationInput {
  organizationId: string;
  recipientIds: string[];
  title: string;
  body: string;
  category?: NotificationCategory;
}

export interface DeliveredNotification {
  userId: string;
  emailed: boolean;
}

interface PreferenceRow {
  userId: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  emailAlerts: boolean;
  riskSignals: boolean;
  weeklyDigest: boolean;
}

function categoryAllowsEmail(
  pref: PreferenceRow,
  category: NotificationCategory,
): boolean {
  if (!pref.emailEnabled) return false;
  return pref[category] === true;
}

export async function deliverNotifications(
  input: DeliverNotificationInput,
): Promise<DeliveredNotification[]> {
  const recipients = [...new Set(input.recipientIds)].filter(Boolean);
  if (recipients.length === 0) return [];

  const category = input.category ?? "emailAlerts";

  const [preferences, users] = await Promise.all([
    prisma.notificationPreference.findMany({
      where: { userId: { in: recipients }, organizationId: input.organizationId },
    }),
    prisma.user.findMany({
      where: { id: { in: recipients }, organizationId: input.organizationId },
      select: { id: true, email: true },
    }),
  ]);

  const prefByUser = new Map(
    preferences.map((pref: PreferenceRow) => [pref.userId, pref]),
  );

  const inAppRows: Array<{
    organizationId: string;
    userId: string;
    title: string;
    body: string;
  }> = [];
  const emailTargets: Array<{ id: string; email: string }> = [];

  for (const user of users) {
    const pref = prefByUser.get(user.id);

    if (!pref || pref.inAppEnabled) {
      inAppRows.push({
        organizationId: input.organizationId,
        userId: user.id,
        title: input.title,
        body: input.body,
      });
    }

    if (!pref || categoryAllowsEmail(pref, category)) {
      emailTargets.push(user);
    }
  }

  if (inAppRows.length > 0) {
    await prisma.notification.createMany({ data: inAppRows });
  }

  const emailed = await Promise.all(
    emailTargets.map(async (user) => {
      const result = await sendEmail({
        to: user.email,
        subject: input.title,
        body: input.body,
      });
      return { userId: user.id, emailed: result.delivered };
    }),
  );

  const emailedByUser = new Map(emailed.map((entry) => [entry.userId, entry.emailed]));
  return users.map((user) => ({
    userId: user.id,
    emailed: emailedByUser.get(user.id) ?? false,
  }));
}
