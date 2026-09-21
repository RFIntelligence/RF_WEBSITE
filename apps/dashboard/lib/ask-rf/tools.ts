import { prisma } from "@/app/lib/db";
import { z } from "zod";

/**
 * Server-side tools for Category A (WORKSPACE_DATA).
 * Rule: organizationId and userId come directly from the session, never from model arguments.
 * Safe fields are selected; sensitive fields (passwords, tokens, sessions) are never exposed.
 * Counts, totals, and arithmetic are calculated here in TypeScript, never by the LLM.
 */

export interface ToolContext {
  organizationId: string;
  userId: string;
  userRole: string;
}

export const getTeamMembersSchema = z.object({});
export const getProjectsSchema = z.object({
  status: z.enum(["ON_TRACK", "AT_RISK", "BLOCKED", "COMPLETED", "ALL"]).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export const getInsightsSchema = z.object({
  severity: z.enum(["CRITICAL", "WARNING", "INFO", "ALL"]).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export const getCustomerConversationsSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
});
export const getReportsSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
});
export const searchDocumentsSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export const getAccountInfoSchema = z.object({});

export async function executeGetTeamMembers(ctx: ToolContext) {
  const members = await prisma.user.findMany({
    where: { organizationId: ctx.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const total = members.length;
  const roleBreakdown = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    roleBreakdown,
    members: members.map((m) => ({
      name: m.name,
      role: m.role,
      email: m.email,
      status: "Active",
      joined: m.createdAt.toISOString().slice(0, 10),
    })),
  };
}

export async function executeGetProjects(
  ctx: ToolContext,
  args: z.infer<typeof getProjectsSchema>
) {
  const where: Record<string, unknown> = { organizationId: ctx.organizationId };
  if (args.status && args.status !== "ALL") {
    where.status = args.status;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        accountName: true,
        status: true,
        progress: true,
        dueDate: true,
        openTasksCount: true,
      },
      orderBy: { updatedAt: "desc" },
      take: args.limit ?? 50,
    }),
    prisma.project.count({ where }),
  ]);

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    returnedCount: projects.length,
    statusCounts,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      accountName: p.accountName,
      status: p.status,
      progressPercent: p.progress,
      dueDate: p.dueDate.toISOString().slice(0, 10),
      openTasks: p.openTasksCount,
    })),
  };
}

export async function executeGetInsights(
  ctx: ToolContext,
  args: z.infer<typeof getInsightsSchema>
) {
  const where: Record<string, unknown> = { organizationId: ctx.organizationId };
  if (args.severity && args.severity !== "ALL") {
    where.severity = args.severity;
  }

  const [insights, total] = await Promise.all([
    prisma.insight.findMany({
      where,
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        body: true,
        accountName: true,
        businessImpact: true,
        recommendedAction: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: args.limit ?? 50,
    }),
    prisma.insight.count({ where }),
  ]);

  return {
    total,
    returnedCount: insights.length,
    insights: insights.map((i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity,
      type: i.type,
      accountName: i.accountName,
      impact: i.businessImpact,
      recommendation: i.recommendedAction,
      date: i.createdAt.toISOString().slice(0, 10),
    })),
  };
}

export async function executeGetCustomerConversations(
  ctx: ToolContext,
  args: z.infer<typeof getCustomerConversationsSchema>
) {
  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: { organizationId: ctx.organizationId },
      select: {
        id: true,
        topic: true,
        contextLabel: true,
        rfLead: true,
        unread: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: args.limit ?? 50,
    }),
    prisma.conversation.count({ where: { organizationId: ctx.organizationId } }),
  ]);

  return {
    total,
    returnedCount: conversations.length,
    conversations: conversations.map((c) => ({
      id: c.id,
      topic: c.topic,
      context: c.contextLabel,
      rfLead: c.rfLead,
      unread: c.unread,
      lastUpdated: c.updatedAt.toISOString().slice(0, 10),
    })),
  };
}

export async function executeGetReports(
  ctx: ToolContext,
  args: z.infer<typeof getReportsSchema>
) {
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { organizationId: ctx.organizationId },
      select: {
        id: true,
        title: true,
        type: true,
        accountName: true,
        status: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: args.limit ?? 50,
    }),
    prisma.report.count({ where: { organizationId: ctx.organizationId } }),
  ]);

  return {
    total,
    returnedCount: reports.length,
    reports: reports.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      accountName: r.accountName,
      status: r.status,
      size: r.size,
      date: r.createdAt.toISOString().slice(0, 10),
    })),
  };
}

export async function executeSearchDocuments(
  ctx: ToolContext,
  args: z.infer<typeof searchDocumentsSchema>
) {
  const where: Record<string, unknown> = {
    organizationId: ctx.organizationId,
    processingStatus: "PROCESSED",
  };

  if (args.query?.trim()) {
    where.OR = [
      { fileName: { contains: args.query.trim(), mode: "insensitive" } },
      { linkedAccount: { contains: args.query.trim(), mode: "insensitive" } },
      { metadataJson: { contains: args.query.trim(), mode: "insensitive" } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        linkedAccount: true,
        extractedEntitiesCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: args.limit ?? 50,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    total,
    returnedCount: documents.length,
    documents: documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      size: d.fileSize,
      linkedAccount: d.linkedAccount,
      entitiesCount: d.extractedEntitiesCount,
      date: d.createdAt.toISOString().slice(0, 10),
    })),
  };
}

export async function executeGetAccountInfo(ctx: ToolContext) {
  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: {
      id: true,
      name: true,
      plan: true,
      createdAt: true,
    },
  });

  if (!org) return { error: "Organization not found" };

  return {
    organizationName: org.name,
    plan: org.plan,
    memberSince: org.createdAt.toISOString().slice(0, 10),
  };
}
