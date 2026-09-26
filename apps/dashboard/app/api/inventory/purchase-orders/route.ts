import { getSession } from "@/app/lib/session";
import { prisma, Prisma } from "@/app/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createPOSchema = z.object({
  supplierId: z.string().min(1),
  expectedAt: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      quantity: z.number().int().positive(),
      unitCost: z.number().nonnegative(),
    })
  ).min(1),
});

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pos = await prisma.purchaseOrder.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      items: {
        include: {
          item: { select: { id: true, sku: true, name: true, unit: true } },
        },
      },
    },
  });

  return Response.json({
    purchaseOrders: pos.map((po) => ({
      id: po.id,
      supplierId: po.supplierId,
      supplierName: po.supplier.name,
      status: po.status,
      expectedAt: po.expectedAt ? po.expectedAt.toISOString() : null,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
      items: po.items.map((i) => ({
        id: i.id,
        itemId: i.itemId,
        sku: i.item.sku,
        name: i.item.name,
        unit: i.item.unit,
        quantity: i.quantity,
        unitCost: Number(i.unitCost),
        totalCost: i.quantity * Number(i.unitCost),
      })),
      totalAmount: po.items.reduce(
        (sum, i) => sum + i.quantity * Number(i.unitCost),
        0
      ),
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

  const parsed = createPOSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const po = await prisma.purchaseOrder.create({
    data: {
      organizationId: session.organizationId,
      supplierId: parsed.data.supplierId,
      expectedAt: parsed.data.expectedAt ? new Date(parsed.data.expectedAt) : null,
      items: {
        create: parsed.data.items.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
          unitCost: new Prisma.Decimal(i.unitCost),
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return Response.json({ purchaseOrder: po }, { status: 201 });
}
