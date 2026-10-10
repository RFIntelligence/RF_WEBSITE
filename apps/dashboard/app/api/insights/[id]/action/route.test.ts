import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const getSession = vi.fn();

  const insightRow = {
    id: "ins_workflow_1",
    organizationId: "org_alpha",
    projectId: "proj_alpha_1",
    type: "RISK",
    severity: "CRITICAL",
    title: "Database latency threshold exceeded",
    body: "P99 latency jumped from 45ms to 320ms",
    accountName: "Acme Corp",
    ctaHref: "/ai-insights",
    ctaLabel: "Investigate",
    read: false,
    whatHappened: "Database latency spiked",
    whyDetected: "P99 monitor",
    chartTitle: "Latency Trend",
    chartType: "bar",
    chartDataJson: "[]",
    businessImpact: "High",
    recommendedAction: "Optimize database indexes",
    createdAt: new Date("2026-10-09T10:00:00Z"),
  };

  const projectRow = {
    id: "proj_alpha_1",
    name: "Enterprise ERP Rollout",
    organizationId: "org_alpha",
    openTasksCount: 2,
    progress: 50,
  };

  const taskList: any[] = [];

  const insightFindFirst = vi.fn(async (args: any) => {
    if (args?.where?.id === "ins_workflow_1" && args?.where?.organizationId === "org_alpha") {
      return insightRow;
    }
    return null;
  });

  const insightUpdate = vi.fn(async () => insightRow);
  const insightActionCreate = vi.fn(async (args: any) => ({ actionStatus: args.data.actionStatus }));
  const projectUpdate = vi.fn(async () => projectRow);

  const taskFindFirst = vi.fn(async (args: any) => {
    return taskList.find((t) => {
      if (t.organizationId !== args.where.organizationId) return false;
      if (args.where.OR) {
        return args.where.OR.some((cond: any) => {
          if (cond.title && t.title === cond.title) return true;
          if (cond.description?.contains && t.description?.includes(cond.description.contains)) return true;
          return false;
        });
      }
      return false;
    }) || null;
  });

  const taskCreate = vi.fn(async (args: any) => {
    const newTask = {
      id: `task_${taskList.length + 1}`,
      ...args.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    taskList.push(newTask);
    return newTask;
  });

  const taskFindMany = vi.fn(async (args: any) => {
    if (args?.where?.projectId) {
      return taskList.filter((t) => t.projectId === args.where.projectId);
    }
    return taskList;
  });

  const transaction = vi.fn(async (cb: (tx: any) => Promise<any>) => {
    const tx = {
      insight: { update: insightUpdate },
      insightAction: { create: insightActionCreate },
      task: {
        findFirst: taskFindFirst,
        create: taskCreate,
        findMany: taskFindMany,
      },
      project: { update: projectUpdate },
    };
    return cb(tx);
  });

  return {
    getSession,
    insightRow,
    projectRow,
    taskList,
    insightFindFirst,
    insightUpdate,
    insightActionCreate,
    projectUpdate,
    taskFindFirst,
    taskCreate,
    taskFindMany,
    transaction,
  };
});

vi.mock("@/app/lib/session", () => ({
  getSession: h.getSession,
}));

vi.mock("@/app/lib/db", () => ({
  prisma: {
    insight: { findFirst: h.insightFindFirst },
    $transaction: h.transaction,
  },
}));

vi.mock("@/app/api/dashboard/route", () => ({
  invalidateDashboardCache: vi.fn(),
}));

vi.mock("@/app/lib/data-sync", () => ({
  notifyOrgDataChanged: vi.fn(),
}));

vi.mock("@/app/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

import { POST } from "./route";

describe("POST /api/insights/:id/action (Insight-to-Task Workflow)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.taskList.length = 0;
  });

  it("returns 401 when unauthenticated", async () => {
    h.getSession.mockResolvedValueOnce(null);

    const res = await POST(
      new Request("http://localhost/api/insights/ins_workflow_1/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TASK_CREATED" }),
      }),
      { params: Promise.resolve({ id: "ins_workflow_1" }) }
    );

    expect(res.status).toBe(401);
  });

  it("returns 404 when insight belongs to another organization (cross-tenant protection)", async () => {
    h.getSession.mockResolvedValueOnce({
      userId: "usr_attacker",
      organizationId: "org_beta", // Mismatched organization
      role: "ADMIN",
    });

    const res = await POST(
      new Request("http://localhost/api/insights/ins_workflow_1/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TASK_CREATED" }),
      }),
      { params: Promise.resolve({ id: "ins_workflow_1" }) }
    );

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Insight not found");
  });

  it("successfully creates a task from insight with correct priority, source tags, and project link", async () => {
    h.getSession.mockResolvedValueOnce({
      userId: "usr_alice",
      organizationId: "org_alpha",
      role: "ADMIN",
    });

    const res = await POST(
      new Request("http://localhost/api/insights/ins_workflow_1/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TASK_CREATED" }),
      }),
      { params: Promise.resolve({ id: "ins_workflow_1" }) }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.insight.actionStatus).toBe("TASK_CREATED");
    expect(json.insight.read).toBe(true);

    // Verify task was created in database transaction
    expect(h.taskCreate).toHaveBeenCalledTimes(1);
    const createdTaskCall = h.taskCreate.mock.calls[0][0];
    expect(createdTaskCall.data).toMatchObject({
      organizationId: "org_alpha",
      title: "[Insight] Database latency threshold exceeded",
      description: expect.stringContaining("[insightId:ins_workflow_1][priority:HIGH]"),
      status: "TODO",
      assigneeId: "usr_alice",
      projectId: "proj_alpha_1",
    });

    // Verify project metrics update was triggered
    expect(h.projectUpdate).toHaveBeenCalledWith({
      where: { id: "proj_alpha_1" },
      data: expect.objectContaining({
        openTasksCount: expect.any(Number),
        progress: expect.any(Number),
      }),
    });
  });

  it("prevents duplicate task creation on repeated requests", async () => {
    h.getSession.mockResolvedValue({
      userId: "usr_alice",
      organizationId: "org_alpha",
      role: "ADMIN",
    });

    // First call: creates the task
    const res1 = await POST(
      new Request("http://localhost/api/insights/ins_workflow_1/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TASK_CREATED" }),
      }),
      { params: Promise.resolve({ id: "ins_workflow_1" }) }
    );
    expect(res1.status).toBe(200);
    expect(h.taskCreate).toHaveBeenCalledTimes(1);

    // Second call: existingTask is found, so taskCreate is not called again
    const res2 = await POST(
      new Request("http://localhost/api/insights/ins_workflow_1/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TASK_CREATED" }),
      }),
      { params: Promise.resolve({ id: "ins_workflow_1" }) }
    );
    expect(res2.status).toBe(200);
    expect(h.taskCreate).toHaveBeenCalledTimes(1); // Still 1, no duplicate
  });
});
