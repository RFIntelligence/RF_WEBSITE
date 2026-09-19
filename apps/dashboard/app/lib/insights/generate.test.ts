/**
 * Org-isolation tests for insight generation.
 *
 * These tests verify that:
 *   1. collectOrgContext (via the full pipeline) only pulls data belonging to
 *      the target organization.
 *   2. generateInsightsForOrg writes Insight rows scoped to that org.
 *   3. A second org's data is never included in prompts or rows even when both
 *      orgs have data in the same DB.
 *
 * The LLM call is stubbed so tests run without network or API keys.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Module stubs ─────────────────────────────────────────────────────────────

// Stub the LLM fetch so no real HTTP calls are made
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Stub deliverNotifications and publishToChannel so they're no-ops
vi.mock("@/app/lib/notifications", () => ({
  deliverNotifications: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/app/lib/realtime/server", () => ({
  publishToChannel:     vi.fn().mockResolvedValue(true),
  isRealtimeConfigured: vi.fn().mockReturnValue(false),
}));

// Stub prisma with in-memory stores
const orgA = { id: "org_a", name: "Org Alpha" };
const orgB = { id: "org_b", name: "Org Beta" };

const projectsA = [
  {
    id: "proj_a1", name: "Alpha Project", accountName: "Alpha Client",
    status: "ON_TRACK", progress: 50, dueDate: new Date("2027-01-01"),
    openTasksCount: 3,
    activities: [],
  },
];

const projectsB = [
  {
    id: "proj_b1", name: "Beta Project", accountName: "Beta Client",
    status: "AT_RISK", progress: 20, dueDate: new Date("2026-11-01"),
    openTasksCount: 8,
    activities: [],
  },
];

// Track created insight data to assert on later
const createdInsights: Array<{ data: Record<string, unknown> }> = [];

vi.mock("@/app/lib/db", () => ({
  prisma: {
    organization: {
      findUniqueOrThrow: vi.fn(({ where }: { where: { id: string } }) => {
        if (where.id === orgA.id) return Promise.resolve(orgA);
        if (where.id === orgB.id) return Promise.resolve(orgB);
        throw new Error(`org not found: ${where.id}`);
      }),
    },
    project: {
      findMany: vi.fn(({ where }: { where: { organizationId: string } }) => {
        if (where.organizationId === orgA.id) return Promise.resolve(projectsA);
        if (where.organizationId === orgB.id) return Promise.resolve(projectsB);
        return Promise.resolve([]);
      }),
      findFirst: vi.fn().mockResolvedValue(null), // no duplicate check hits
    },
    document: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    conversation: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findMany: vi.fn(({ where }: { where: { organizationId: string } }) => {
        if (where.organizationId === orgA.id) return Promise.resolve([{ id: "usr_a1" }]);
        if (where.organizationId === orgB.id) return Promise.resolve([{ id: "usr_b1" }]);
        return Promise.resolve([]);
      }),
    },
    insight: {
      findFirst: vi.fn().mockResolvedValue(null), // no duplicate
      create: vi.fn((args: { data: Record<string, unknown> }) => {
        createdInsights.push({ data: args.data });
        return Promise.resolve({ id: `ins_${createdInsights.length}` });
      }),
    },
    notification: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      findMany:   vi.fn().mockResolvedValue([]),
    },
    notificationPreference: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// ─── Subject under test ───────────────────────────────────────────────────────

import { generateInsightsForOrg } from "./generate";

// ─── LLM response factory ─────────────────────────────────────────────────────

function makeLLMResponse(insights: unknown[]): Response {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        choices: [
          {
            message: {
              content: JSON.stringify(insights),
            },
          },
        ],
      }),
  } as unknown as Response;
}

const ORG_A_INSIGHT = {
  type: "RISK", severity: "WARNING",
  title: "Alpha risk detected",
  body:  "Alpha project is stalling.",
  accountName: "Alpha Client",
  ctaHref: "/projects", ctaLabel: "View project",
  whatHappened: "Progress stalled at 50%.",
  whyDetected: "No activity in 7 days.",
  chartTitle: "Progress over time",
  chartType: "line",
  chartData: [{ label: "Week 1", value: 50 }],
  businessImpact: "Delivery at risk.",
  recommendedAction: "Schedule sync with owner.",
};

const ORG_B_INSIGHT = {
  type: "RISK", severity: "CRITICAL",
  title: "Beta renewal at risk",
  body:  "Beta project is severely behind.",
  accountName: "Beta Client",
  ctaHref: "/projects", ctaLabel: "View project",
  whatHappened: "Only 20% complete with 8 open tasks.",
  whyDetected: "Velocity dropped below baseline.",
  chartTitle: "Task burndown",
  chartType: "bar",
  chartData: [{ label: "Sep", value: 8 }],
  businessImpact: "$200K contract at risk.",
  recommendedAction: "Escalate to executive sponsor.",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("generateInsightsForOrg — org isolation", () => {
  beforeEach(() => {
    createdInsights.length = 0;
    vi.clearAllMocks();
    // Default: LLM returns org-A insight for org-A runs
    mockFetch.mockResolvedValue(makeLLMResponse([ORG_A_INSIGHT]));
    process.env.DEEPSEEK_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.DEEPSEEK_API_KEY;
  });

  it("writes insight rows scoped to the correct org", async () => {
    const result = await generateInsightsForOrg(orgA.id);

    expect(result.generated).toBe(1);
    expect(result.error).toBeUndefined();
    expect(createdInsights).toHaveLength(1);
    expect(createdInsights[0].data.organizationId).toBe(orgA.id);
  });

  it("does not write any rows with orgB's organizationId when running for orgA", async () => {
    await generateInsightsForOrg(orgA.id);

    for (const ins of createdInsights) {
      expect(ins.data.organizationId).not.toBe(orgB.id);
    }
  });

  it("prompt sent to LLM only contains orgA projects, not orgB projects", async () => {
    await generateInsightsForOrg(orgA.id);

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs).toBeDefined();
    const body = JSON.parse(callArgs[1].body as string) as {
      messages: Array<{ role: string; content: string }>;
    };
    const userMessage = body.messages.find((m) => m.role === "user")?.content ?? "";

    // orgA project must appear
    expect(userMessage).toContain("Alpha Project");
    expect(userMessage).toContain("Alpha Client");

    // orgB project must NOT appear
    expect(userMessage).not.toContain("Beta Project");
    expect(userMessage).not.toContain("Beta Client");
  });

  it("running for orgB does not include orgA data in the prompt", async () => {
    mockFetch.mockResolvedValue(makeLLMResponse([ORG_B_INSIGHT]));
    await generateInsightsForOrg(orgB.id);

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body as string) as {
      messages: Array<{ role: string; content: string }>;
    };
    const userMessage = body.messages.find((m) => m.role === "user")?.content ?? "";

    expect(userMessage).toContain("Beta Project");
    expect(userMessage).not.toContain("Alpha Project");
  });

  it("rows created for orgB have orgB organizationId", async () => {
    mockFetch.mockResolvedValue(makeLLMResponse([ORG_B_INSIGHT]));
    await generateInsightsForOrg(orgB.id);

    expect(createdInsights).toHaveLength(1);
    expect(createdInsights[0].data.organizationId).toBe(orgB.id);
    expect(createdInsights[0].data.organizationId).not.toBe(orgA.id);
  });

  it("returns early without LLM call if org has no data", async () => {
    // Override project/document/conversation mocks to return empty
    const { prisma } = await import("@/app/lib/db");
    vi.mocked(prisma.project.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.document.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([]);

    const result = await generateInsightsForOrg(orgA.id);

    expect(result.generated).toBe(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns error result (not throw) when LLM call fails", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("Internal Server Error") });

    const result = await generateInsightsForOrg(orgA.id);

    expect(result.error).toMatch(/LLM call failed/);
    expect(result.generated).toBe(0);
    expect(createdInsights).toHaveLength(0);
  });

  it("skips duplicate insights created within the last 24 hours", async () => {
    const { prisma } = await import("@/app/lib/db");
    // Simulate existing insight with same title
    vi.mocked(prisma.insight.findFirst).mockResolvedValueOnce({ id: "existing_id" } as never);

    const result = await generateInsightsForOrg(orgA.id);

    expect(result.generated).toBe(0);
    expect(result.skippedDuplicates).toBe(1);
    expect(createdInsights).toHaveLength(0);
  });

  it("rejects missing organizationId without hitting the DB", async () => {
    const result = await generateInsightsForOrg("");

    expect(result.error).toMatch(/organizationId is required/);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
