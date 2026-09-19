import { getSession } from "@/app/lib/session";
import { inngest, INSIGHT_GENERATE_EVENT } from "@/app/lib/inngest/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/insights/analyze
 *
 * Enqueues an on-demand insight generation run for the signed-in user's
 * organization. The organizationId is sourced exclusively from the verified
 * session — the request body is intentionally ignored.
 *
 * Returns immediately (202) once the Inngest event is sent; the job runs
 * asynchronously and results appear via the realtime notification channel.
 */
export async function POST(): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await inngest.send({
    name: INSIGHT_GENERATE_EVENT,
    data: {
      organizationId: session.organizationId,
      triggeredBy:    "manual" as const,
    },
  });

  return Response.json(
    { queued: true, message: "Insight analysis started. Results will appear shortly." },
    { status: 202 },
  );
}
