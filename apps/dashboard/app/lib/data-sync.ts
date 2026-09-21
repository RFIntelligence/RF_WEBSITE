import { publishToChannel } from "@/app/lib/realtime/server";
import { orgChannel } from "@/app/lib/realtime/channels";
import { invalidateDashboardCache } from "@/app/api/dashboard/route";
import { revalidateTag } from "next/cache";

export type DashboardSection =
  | "projects"
  | "insights"
  | "conversations"
  | "reports"
  | "documents"
  | "messages"
  | "team"
  | "account"
  | "alerts";

// In-memory per-org data version tracker
const orgDataVersions = new Map<string, number>();

export function getOrgDataVersion(orgId: string): number {
  return orgDataVersions.get(orgId) ?? 1;
}

/**
 * Notifies the system that organization data has changed.
 * (a) Bumps the organization's data version (for cache invalidation).
 * (b) Publishes a realtime event on the existing realtime channel.
 * (c) Revalidates dashboard cache and Next.js tags.
 */
export async function notifyOrgDataChanged(
  orgId: string,
  sections: DashboardSection[],
): Promise<void> {
  if (!orgId) return;

  // 1. Bump data version
  const currentVer = orgDataVersions.get(orgId) ?? 1;
  const nextVer = currentVer + 1;
  orgDataVersions.set(orgId, nextVer);

  // 2. Invalidate server-side in-memory dashboard cache
  invalidateDashboardCache(orgId);

  // 3. Revalidate Next.js cache tags
  try {
    // Next.js 16 revalidateTag expects (tag, profile) e.g. 'max'
    // @ts-expect-error Next.js 16 profile argument
    revalidateTag(`org-${orgId}`, "max");
    // @ts-expect-error Next.js 16 profile argument
    revalidateTag(`dashboard-${orgId}`, "max");
  } catch {
    // Non-fatal if called outside Next.js request context
  }

  // 4. Publish realtime event to notifications / messages channel
  try {
    const channel = orgChannel(orgId, "notifications");
    await publishToChannel(channel, "org:data-changed", {
      orgId,
      dataVersion: nextVer,
      sections,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn("notifyOrgDataChanged: realtime publish failed", err);
  }
}
