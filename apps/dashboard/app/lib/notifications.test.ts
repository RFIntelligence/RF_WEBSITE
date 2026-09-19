import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const state = {
    preferences: [] as Array<{
      userId: string;
      inAppEnabled: boolean;
      emailEnabled: boolean;
      emailAlerts: boolean;
      riskSignals: boolean;
      weeklyDigest: boolean;
    }>,
    users: [] as Array<{ id: string; email: string }>,
  };

  const notificationPreference = {
    findMany: vi.fn(async (args: { where?: { userId?: { in?: string[] } } }) => {
      const ids = args?.where?.userId?.in ?? [];
      return state.preferences.filter((pref) => ids.includes(pref.userId));
    }),
  };
  const user = {
    findMany: vi.fn(async (args: { where?: { id?: { in?: string[] } } }) => {
      const ids = args?.where?.id?.in ?? [];
      return state.users.filter((row) => ids.includes(row.id));
    }),
  };
  const notification = {
    createMany: vi.fn(async () => ({ count: 1 })),
  };
  const sendEmail = vi.fn(async () => ({ delivered: true, provider: "console" }));

  return {
    state,
    sendEmail,
    prisma: { notificationPreference, user, notification },
  };
});

vi.mock("@/app/lib/db", () => ({ prisma: h.prisma }));
vi.mock("@/app/lib/email", () => ({ sendEmail: h.sendEmail }));

import { deliverNotifications } from "./notifications";

function preference(overrides: Partial<(typeof h.state.preferences)[number]> & { userId: string }) {
  return {
    inAppEnabled: true,
    emailEnabled: true,
    emailAlerts: true,
    riskSignals: true,
    weeklyDigest: true,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  h.state.preferences = [];
  h.state.users = [
    { id: "usr_a", email: "a@example.com" },
    { id: "usr_b", email: "b@example.com" },
  ];
});

describe("deliverNotifications", () => {
  it("creates in-app notifications and emails by default when no preference exists", async () => {
    const result = await deliverNotifications({
      organizationId: "org_a",
      recipientIds: ["usr_a"],
      title: "New message",
      body: "Hello",
    });

    expect(h.prisma.notification.createMany).toHaveBeenCalledTimes(1);
    expect(h.sendEmail).toHaveBeenCalledTimes(1);
    expect(result[0]).toMatchObject({ userId: "usr_a", emailed: true });
  });

  it("does not email a user who disabled email notifications", async () => {
    h.state.preferences = [preference({ userId: "usr_a", emailEnabled: false })];
    await deliverNotifications({
      organizationId: "org_a",
      recipientIds: ["usr_a"],
      title: "New message",
      body: "Hello",
    });

    expect(h.prisma.notification.createMany).toHaveBeenCalledTimes(1);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("does not email when the specific category is disabled", async () => {
    h.state.preferences = [preference({ userId: "usr_a", emailAlerts: false })];
    await deliverNotifications({
      organizationId: "org_a",
      recipientIds: ["usr_a"],
      title: "New message",
      body: "Hello",
      category: "emailAlerts",
    });

    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("skips in-app notifications when in-app delivery is disabled", async () => {
    h.state.preferences = [preference({ userId: "usr_a", inAppEnabled: false })];
    const result = await deliverNotifications({
      organizationId: "org_a",
      recipientIds: ["usr_a"],
      title: "New message",
      body: "Hello",
    });

    expect(h.prisma.notification.createMany).not.toHaveBeenCalled();
    expect(result[0]).toMatchObject({ userId: "usr_a" });
  });

  it("batches recipients into a single insert and deduplicates them", async () => {
    await deliverNotifications({
      organizationId: "org_a",
      recipientIds: ["usr_a", "usr_a", "usr_b"],
      title: "New message",
      body: "Hello",
    });

    expect(h.prisma.notification.createMany).toHaveBeenCalledTimes(1);
    expect(h.prisma.notification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: "usr_a" }),
        expect.objectContaining({ userId: "usr_b" }),
      ]),
    });
    expect(h.sendEmail).toHaveBeenCalledTimes(2);
  });
});
