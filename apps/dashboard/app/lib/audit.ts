import { prisma } from "@/app/lib/db";

export interface WriteAuditLogInput {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit writer. Errors are caught and logged so they never
 * surface into the request path.
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", input.action, err);
  }
}
