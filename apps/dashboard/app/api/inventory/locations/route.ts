import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().min(1, "Code is required").max(20),
  address: z.string().max(255).optional(),
  isPrimary: z.boolean().optional(),
});

/**
 * GET /api/inventory/locations
 */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const locations = await prisma.inventoryLocation.findMany({
    where: { organizationId: session.organizationId },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      isPrimary: true,
      createdAt: true,
    },
  });

  return Response.json({
    locations: locations.map((loc) => ({
      ...loc,
      createdAt: loc.createdAt.toISOString(),
    })),
  });
}

/**
 * POST /api/inventory/locations
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createLocationSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const location = await prisma.inventoryLocation.create({
      data: {
        organizationId: session.organizationId,
        name: parsed.data.name.trim(),
        code: parsed.data.code.trim().toUpperCase(),
        address: parsed.data.address?.trim(),
        isPrimary: parsed.data.isPrimary ?? false,
      },
    });

    return Response.json(
      {
        location: {
          ...location,
          createdAt: location.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.code === "P2002") {
      return Response.json(
        { error: `Location with code "${parsed.data.code}" already exists.` },
        { status: 409 }
      );
    }
    console.error("POST /api/inventory/locations error:", err);
    return Response.json({ error: "Failed to create location" }, { status: 500 });
  }
}
