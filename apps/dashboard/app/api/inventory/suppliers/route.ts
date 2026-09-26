import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  contactName: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
});

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const suppliers = await prisma.supplier.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { purchaseOrders: true },
      },
    },
  });

  return Response.json({
    suppliers: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      contactName: s.contactName,
      email: s.email,
      phone: s.phone,
      poCount: s._count.purchaseOrders,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSupplierSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supplier = await prisma.supplier.create({
    data: {
      organizationId: session.organizationId,
      name: parsed.data.name.trim(),
      contactName: parsed.data.contactName?.trim(),
      email: parsed.data.email?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
    },
  });

  return Response.json({ supplier }, { status: 201 });
}
