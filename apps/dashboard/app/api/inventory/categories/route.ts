import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

/**
 * GET /api/inventory/categories
 * Returns categories for the session's organization with item counts in a single groupBy query.
 */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Fetch categories
  const categories = await prisma.inventoryCategory.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 2. Fetch item counts grouped by categoryId in 1 round trip
  const itemCounts = await prisma.inventoryItem.groupBy({
    by: ["categoryId"],
    where: {
      organizationId: session.organizationId,
      categoryId: { not: null },
    },
    _count: { _all: true },
  });

  const countMap = new Map<string, number>();
  for (const c of itemCounts) {
    if (c.categoryId) {
      countMap.set(c.categoryId, c._count._all);
    }
  }

  const payload = categories.map((cat) => ({
    ...cat,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
    itemCount: countMap.get(cat.id) ?? 0,
  }));

  return Response.json({ categories: payload });
}

/**
 * POST /api/inventory/categories
 * Body: { name, description? }
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

  const parsed = createCategorySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.inventoryCategory.create({
      data: {
        organizationId: session.organizationId,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(
      {
        category: {
          ...category,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
          itemCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    // Unique constraint on [organizationId, name]
    if (err?.code === "P2002") {
      return Response.json(
        { error: `Category with name "${parsed.data.name}" already exists in your organization.` },
        { status: 409 }
      );
    }
    console.error("POST /api/inventory/categories error:", err);
    return Response.json({ error: "Failed to create category" }, { status: 500 });
  }
}
