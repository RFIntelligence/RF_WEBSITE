import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const getSession = vi.fn();

  const mockCountsRow = {
    active_projects: BigInt(3),
    prev_projects: BigInt(2),
    proj_on_track: BigInt(2),
    proj_at_risk: BigInt(1),
    proj_blocked: BigInt(0),
    proj_completed: BigInt(1),
    open_convs: BigInt(1),
    prev_convs: BigInt(1),
    ins_30d: BigInt(5),
    ins_60d: BigInt(3),
    unread_insights: BigInt(2),
    members: BigInt(4),
    prev_members: BigInt(3),
    total_actioned: BigInt(10),
    accepted_actioned: BigInt(8),
    prev_total: BigInt(5),
    prev_accepted: BigInt(4),
    ai_docs_pending: BigInt(2),
    ai_docs_processed: BigInt(15),
    ai_docs_failed: BigInt(2),
    ai_reports_processing: BigInt(1),
    ai_reports_ready: BigInt(8),
    ai_reports_failed: BigInt(0),
    ai_convs_handling: BigInt(3),
    pending_tasks: BigInt(6),
    pending_escalations: BigInt(2),
    users_admin: BigInt(2),
    users_member: BigInt(2),
    users_client_admin: BigInt(0),
    users_client_employee: BigInt(0),
    invites_pending: BigInt(1),
  };

  const queryRaw = vi.fn(async () => [mockCountsRow]);

  const projectsFindMany = vi.fn(async (args: any) => {
    if (args?.where?.organizationId !== "org_tenant_1") return [];
    return [
      {
        id: "proj_123",
        name: "Enterprise ERP Rollout",
        accountName: "Acme Corp",
        status: "AT_RISK",
        progress: 45,
        dueDate: new Date(Date.now() + 86400000 * 2),
        openTasksCount: 4,
        ownerId: "u1",
        owner: { id: "u1", name: "Alice Admin" },
        tasks: [],
        activities: [],
      },
    ];
  });

  const insightsFindMany = vi.fn(async (args: any) => {
    if (args?.where?.organizationId !== "org_tenant_1") return [];
    return [
      {
        id: "ins_999",
        organizationId: "org_tenant_1",
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
        actions: [],
      },
    ];
  });

  const documentsFindMany = vi.fn(async (args: any) => {
    if (args?.where?.organizationId !== "org_tenant_1") return [];
    return [
      {
        id: "doc_fail_linked",
        fileName: "sow_project_alpha.pdf",
        failureReason: "Extraction schema timeout",
        projectId: "proj_123",
      },
      {
        id: "doc_fail_standalone",
        fileName: "raw_receipt_batch.csv",
        failureReason: "Unparseable CSV format",
        projectId: null,
      },
      {
        id: "",
        fileName: "unidentified_scan.png",
        failureReason: "Corrupted binary file",
        projectId: null,
      },
    ];
  });

  const activitiesFindMany = vi.fn(async (args: any) => {
    if (args?.where?.organizationId !== "org_tenant_1") return [];
    return [
      {
        id: "act_proj_valid",
        projectId: "proj_123",
        action: "Milestone reached",
        details: "Sprint 2 completed",
        type: "milestone",
        createdAt: new Date("2026-10-09T12:00:00Z"),
        author: { name: "Alice Admin", avatarInitials: "AA" },
        project: { name: "Enterprise ERP Rollout" },
      },
      {
        id: "act_proj_no_id",
        projectId: null,
        action: "General status note",
        details: "Meeting notes recorded",
        type: "status",
        createdAt: new Date("2026-10-09T11:00:00Z"),
        author: { name: "Bob", avatarInitials: "BO" },
        project: null,
      },
    ];
  });

  const auditLogsFindMany = vi.fn(async (args: any) => {
    if (args?.where?.organizationId !== "org_tenant_1") return [];
    return [
      {
        id: "audit_task",
        action: "task.created",
        entityType: "task",
        entityId: "task_456",
        metadataJson: null,
        createdAt: new Date("2026-10-09T15:00:00Z"),
        user: { name: "Alice", avatarInitials: "AA" },
      },
      {
        id: "audit_insight",
        action: "insight.generated",
        entityType: "insight",
        entityId: "ins_999",
        metadataJson: null,
        createdAt: new Date("2026-10-09T14:30:00Z"),
        user: null,
      },
      {
        id: "audit_conv",
        action: "conversation.escalated",
        entityType: "conversation",
        entityId: "conv_789",
        metadataJson: null,
        createdAt: new Date("2026-10-09T14:00:00Z"),
        user: null,
      },
      {
        id: "audit_doc",
        action: "document.uploaded",
        entityType: "document",
        entityId: "doc_101",
        metadataJson: null,
        createdAt: new Date("2026-10-09T13:30:00Z"),
        user: { name: "Alice", avatarInitials: "AA" },
      },
      {
        id: "audit_doc_no_id",
        action: "document.scanned",
        entityType: "document",
        entityId: "",
        metadataJson: null,
        createdAt: new Date("2026-10-09T13:00:00Z"),
        user: null,
      },
      {
        id: "audit_unknown",
        action: "system.maintenance",
        entityType: "unknown_entity",
        entityId: "xyz_999",
        metadataJson: null,
        createdAt: new Date("2026-10-09T12:30:00Z"),
        user: null,
      },
    ];
  });

  const conversationsFindMany = vi.fn(async () => []);

  // Single-record mocks
  const taskFindFirst = vi.fn(async (args: any) => {
    if (args?.where?.id === "task_456" && args?.where?.organizationId === "org_tenant_1") {
      return {
        id: "task_456",
        organizationId: "org_tenant_1",
        title: "[Insight] Re-index search catalog",
        description: "Optimize Elasticsearch indices [insightId:ins_999] [priority:HIGH]",
        status: "TODO",
        dueDate: new Date("2026-10-20T00:00:00Z"),
        assigneeId: "u1",
        assignee: { id: "u1", name: "Alice Admin", avatarInitials: "AA" },
        projectId: "proj_123",
        project: { id: "proj_123", name: "Enterprise ERP Rollout", accountName: "Acme Corp" },
        createdAt: new Date("2026-10-09T15:00:00Z"),
        updatedAt: new Date("2026-10-09T15:00:00Z"),
      };
    }
    return null;
  });

  const insightFindFirst = vi.fn(async (args: any) => {
    if (args?.where?.id === "ins_999" && args?.where?.organizationId === "org_tenant_1") {
      return {
        id: "ins_999",
        organizationId: "org_tenant_1",
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
        chartDataJson: JSON.stringify([{ label: "P99", value: 320 }]),
        businessImpact: "High",
        recommendedAction: "Optimize database indexes",
        createdAt: new Date("2026-10-09T10:00:00Z"),
        actions: [{ actionStatus: "PROPOSED" }],
      };
    }
    return null;
  });

  return {
    getSession,
    queryRaw,
    projectsFindMany,
    insightsFindMany,
    documentsFindMany,
    activitiesFindMany,
    auditLogsFindMany,
    conversationsFindMany,
    taskFindFirst,
    insightFindFirst,
  };
});

vi.mock("@/app/lib/session", () => ({
  getSession: h.getSession,
}));

vi.mock("@/app/lib/db", () => ({
  Prisma: {
    sql: (strings: TemplateStringsArray, ...values: any[]) => ({ strings, values }),
  },
  prisma: {
    $queryRaw: h.queryRaw,
    project: { findMany: h.projectsFindMany },
    insight: { findMany: h.insightsFindMany, findFirst: h.insightFindFirst },
    conversation: { findMany: h.conversationsFindMany },
    projectActivity: { findMany: h.activitiesFindMany },
    document: { findMany: h.documentsFindMany },
    auditLog: { findMany: h.auditLogsFindMany },
    task: { findFirst: h.taskFindFirst },
  },
}));

import { GET as getDashboard, invalidateDashboardCache } from "@/app/api/dashboard/route";
import { GET as getTask } from "@/app/api/tasks/[id]/route";
import { GET as getInsight } from "@/app/api/insights/[id]/route";

describe("Dashboard Contextual Navigation & Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateDashboardCache("org_tenant_1");
    invalidateDashboardCache("org_tenant_2");
  });

  describe("Important Alerts Navigation", () => {
    it("routes failed documents to the corresponding project when associated", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      const res = await getDashboard();
      expect(res.status).toBe(200);
      const data = await res.json();

      const projectDocAlert = data.alerts.find(
        (a: any) => a.id === "alert_doc_doc_fail_linked"
      );
      expect(projectDocAlert).toBeDefined();
      expect(projectDocAlert.ctaHref).toBe("/projects?id=proj_123");
      expect(projectDocAlert.ctaLabel).toBe("View in project");
    });

    it("routes standalone failed documents to the document pipeline with docId context", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      const res = await getDashboard();
      const data = await res.json();

      const standaloneAlert = data.alerts.find(
        (a: any) => a.id === "alert_doc_doc_fail_standalone"
      );
      expect(standaloneAlert).toBeDefined();
      expect(standaloneAlert.ctaHref).toBe(
        "/reports?tab=documents&docId=doc_fail_standalone"
      );
      expect(standaloneAlert.ctaLabel).toBe("View document");
    });

    it("displays alert without action when neither projectId nor valid docId exists", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      const res = await getDashboard();
      const data = await res.json();

      const namelessAlert = data.alerts.find(
        (a: any) => a.id === "alert_doc_"
      );
      expect(namelessAlert).toBeDefined();
      expect(namelessAlert.ctaHref).toBe("");
      expect(namelessAlert.ctaLabel).toBe("");
    });

    it("routes at-risk / blocked projects directly to project detail", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      const res = await getDashboard();
      const data = await res.json();

      const atRiskAlert = data.alerts.find(
        (a: any) => a.id === "alert_proj_proj_123"
      );
      expect(atRiskAlert).toBeDefined();
      expect(atRiskAlert.ctaHref).toBe("/projects?id=proj_123");
      expect(atRiskAlert.ctaLabel).toBe("Go to project");
    });

    it("routes critical insights to AI Insights with insight ID context", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      const res = await getDashboard();
      const data = await res.json();

      const insightAlert = data.alerts.find(
        (a: any) => a.id === "alert_ins_ins_999"
      );
      expect(insightAlert).toBeDefined();
      expect(insightAlert.ctaHref).toBe("/ai-insights?id=ins_999");
      expect(insightAlert.ctaLabel).toBe("View insight");
    });
  });

  describe("Recent Activity Navigation by Record Type", () => {
    it("routes project activity with valid projectId to /projects?id=...", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      h.activitiesFindMany.mockResolvedValueOnce([
        {
          id: "act_proj_valid",
          projectId: "proj_123",
          action: "Milestone reached",
          details: "Sprint 2 completed",
          type: "milestone",
          createdAt: new Date("2026-10-09T16:00:00Z"),
          author: { name: "Alice Admin", avatarInitials: "AA" },
          project: { name: "Enterprise ERP Rollout" },
        },
      ]);
      h.auditLogsFindMany.mockResolvedValueOnce([]);

      const res = await getDashboard();
      const data = await res.json();

      const act = data.recentActivities.find(
        (a: any) => a.id === "act_proj_valid"
      );
      expect(act).toBeDefined();
      expect(act.targetHref).toBe("/projects?id=proj_123");
    });

    it("leaves project activity without reliable projectId non-clickable", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      h.activitiesFindMany.mockResolvedValueOnce([
        {
          id: "act_proj_no_id",
          projectId: null,
          action: "General status note",
          details: "Meeting notes recorded",
          type: "status",
          createdAt: new Date("2026-10-09T16:00:00Z"),
          author: { name: "Bob", avatarInitials: "BO" },
          project: null,
        },
      ]);
      h.auditLogsFindMany.mockResolvedValueOnce([]);

      const res = await getDashboard();
      const data = await res.json();

      const act = data.recentActivities.find(
        (a: any) => a.id === "act_proj_no_id"
      );
      expect(act).toBeDefined();
      expect(act.targetHref).toBeUndefined();
    });

    it("routes task activity to /tasks?id=...", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      h.activitiesFindMany.mockResolvedValueOnce([]);
      h.auditLogsFindMany.mockResolvedValueOnce([
        {
          id: "audit_task",
          action: "task.created",
          entityType: "task",
          entityId: "task_456",
          metadataJson: null,
          createdAt: new Date("2026-10-09T16:00:00Z"),
          user: { name: "Alice", avatarInitials: "AA" },
        },
      ]);

      const res = await getDashboard();
      const data = await res.json();

      const act = data.recentActivities.find(
        (a: any) => a.id === "audit_audit_task"
      );
      expect(act).toBeDefined();
      expect(act.targetHref).toBe("/tasks?id=task_456");
    });

    it("routes insight activity to /ai-insights?id=...", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      h.activitiesFindMany.mockResolvedValueOnce([]);
      h.auditLogsFindMany.mockResolvedValueOnce([
        {
          id: "audit_insight",
          action: "insight.generated",
          entityType: "insight",
          entityId: "ins_999",
          metadataJson: null,
          createdAt: new Date("2026-10-09T16:00:00Z"),
          user: null,
        },
      ]);

      const res = await getDashboard();
      const data = await res.json();

      const act = data.recentActivities.find(
        (a: any) => a.id === "audit_audit_insight"
      );
      expect(act).toBeDefined();
      expect(act.targetHref).toBe("/ai-insights?id=ins_999");
    });

    it("routes conversation activity to /conversations?id=...", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      h.activitiesFindMany.mockResolvedValueOnce([]);
      h.auditLogsFindMany.mockResolvedValueOnce([
        {
          id: "audit_conv",
          action: "conversation.escalated",
          entityType: "conversation",
          entityId: "conv_789",
          metadataJson: null,
          createdAt: new Date("2026-10-09T16:00:00Z"),
          user: null,
        },
      ]);

      const res = await getDashboard();
      const data = await res.json();

      const act = data.recentActivities.find(
        (a: any) => a.id === "audit_audit_conv"
      );
      expect(act).toBeDefined();
      expect(act.targetHref).toBe("/conversations?id=conv_789");
    });

    it("routes document upload activity to /reports?tab=documents&docId=...", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      h.activitiesFindMany.mockResolvedValueOnce([]);
      h.auditLogsFindMany.mockResolvedValueOnce([
        {
          id: "audit_doc",
          action: "document.uploaded",
          entityType: "document",
          entityId: "doc_101",
          metadataJson: null,
          createdAt: new Date("2026-10-09T16:00:00Z"),
          user: { name: "Alice", avatarInitials: "AA" },
        },
      ]);

      const res = await getDashboard();
      const data = await res.json();

      const act = data.recentActivities.find(
        (a: any) => a.id === "audit_audit_doc"
      );
      expect(act).toBeDefined();
      expect(act.targetHref).toBe("/reports?tab=documents&docId=doc_101");
    });

    it("leaves activity without entityId or unknown entityType non-clickable", async () => {
      h.getSession.mockResolvedValueOnce({
        userId: "u1",
        organizationId: "org_tenant_1",
        role: "ADMIN",
        name: "Alice Admin",
        email: "alice@example.com",
      });

      h.activitiesFindMany.mockResolvedValueOnce([]);
      h.auditLogsFindMany.mockResolvedValueOnce([
        {
          id: "audit_doc_no_id",
          action: "document.scanned",
          entityType: "document",
          entityId: "",
          metadataJson: null,
          createdAt: new Date("2026-10-09T16:00:00Z"),
          user: null,
        },
        {
          id: "audit_unknown",
          action: "system.maintenance",
          entityType: "unknown_entity",
          entityId: "xyz_999",
          metadataJson: null,
          createdAt: new Date("2026-10-09T15:00:00Z"),
          user: null,
        },
      ]);

      const res = await getDashboard();
      const data = await res.json();

      const noIdDoc = data.recentActivities.find(
        (a: any) => a.id === "audit_audit_doc_no_id"
      );
      expect(noIdDoc).toBeDefined();
      expect(noIdDoc.targetHref).toBeUndefined();

      const unknownAct = data.recentActivities.find(
        (a: any) => a.id === "audit_audit_unknown"
      );
      expect(unknownAct).toBeDefined();
      expect(unknownAct.targetHref).toBeUndefined();
    });
  });

  describe("Single-Record Destination APIs & Cross-Tenant Security", () => {
    describe("GET /api/tasks/:id", () => {
      it("returns 401 when unauthenticated", async () => {
        h.getSession.mockResolvedValueOnce(null);
        const res = await getTask(new Request("http://localhost/api/tasks/task_456"), {
          params: Promise.resolve({ id: "task_456" }),
        });
        expect(res.status).toBe(401);
      });

      it("returns 404 when accessing task in another organization (cross-tenant protection)", async () => {
        h.getSession.mockResolvedValueOnce({
          userId: "u2",
          organizationId: "org_tenant_2", // Different org
          role: "ADMIN",
          name: "Other Admin",
          email: "other@example.com",
        });

        const res = await getTask(new Request("http://localhost/api/tasks/task_456"), {
          params: Promise.resolve({ id: "task_456" }),
        });
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toBe("Task not found");
      });

      it("returns 404 when task ID does not exist", async () => {
        h.getSession.mockResolvedValueOnce({
          userId: "u1",
          organizationId: "org_tenant_1",
          role: "ADMIN",
          name: "Alice Admin",
          email: "alice@example.com",
        });

        const res = await getTask(new Request("http://localhost/api/tasks/nonexistent"), {
          params: Promise.resolve({ id: "nonexistent" }),
        });
        expect(res.status).toBe(404);
      });

      it("returns formatted task when authorized for organization", async () => {
        h.getSession.mockResolvedValueOnce({
          userId: "u1",
          organizationId: "org_tenant_1",
          role: "ADMIN",
          name: "Alice Admin",
          email: "alice@example.com",
        });

        const res = await getTask(new Request("http://localhost/api/tasks/task_456"), {
          params: Promise.resolve({ id: "task_456" }),
        });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.task).toBeDefined();
        expect(json.task.id).toBe("task_456");
        expect(json.task.cleanTitle).toBe("Re-index search catalog");
        expect(json.task.sourceInsight?.id).toBe("ins_999");
        expect(json.task.priority).toBe("HIGH");
      });
    });

    describe("GET /api/insights/:id", () => {
      it("returns 401 when unauthenticated", async () => {
        h.getSession.mockResolvedValueOnce(null);
        const res = await getInsight(new Request("http://localhost/api/insights/ins_999"), {
          params: Promise.resolve({ id: "ins_999" }),
        });
        expect(res.status).toBe(401);
      });

      it("returns 404 when accessing insight in another organization (cross-tenant protection)", async () => {
        h.getSession.mockResolvedValueOnce({
          userId: "u2",
          organizationId: "org_tenant_2", // Different org
          role: "ADMIN",
          name: "Other Admin",
          email: "other@example.com",
        });

        const res = await getInsight(new Request("http://localhost/api/insights/ins_999"), {
          params: Promise.resolve({ id: "ins_999" }),
        });
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toBe("Insight not found");
      });

      it("returns 404 when insight ID does not exist", async () => {
        h.getSession.mockResolvedValueOnce({
          userId: "u1",
          organizationId: "org_tenant_1",
          role: "ADMIN",
          name: "Alice Admin",
          email: "alice@example.com",
        });

        const res = await getInsight(new Request("http://localhost/api/insights/nonexistent"), {
          params: Promise.resolve({ id: "nonexistent" }),
        });
        expect(res.status).toBe(404);
      });

      it("returns formatted insight when authorized for organization", async () => {
        h.getSession.mockResolvedValueOnce({
          userId: "u1",
          organizationId: "org_tenant_1",
          role: "ADMIN",
          name: "Alice Admin",
          email: "alice@example.com",
        });

        const res = await getInsight(new Request("http://localhost/api/insights/ins_999"), {
          params: Promise.resolve({ id: "ins_999" }),
        });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.insight).toBeDefined();
        expect(json.insight.id).toBe("ins_999");
        expect(json.insight.title).toBe("Database latency threshold exceeded");
        expect(json.insight.severity).toBe("CRITICAL");
        expect(json.insight.actionStatus).toBe("PROPOSED");
        expect(json.insight.detail.chartData).toEqual([{ label: "P99", value: 320 }]);
      });
    });
  });
});
