import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchPOStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"]),
  targetLocationId: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  context: RouteParams
): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchPOStatusSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const po = await prisma.purchaseOrder.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      items: true,
    },
  });

  if (!po) {
    return Response.json({ error: "Purchase order not found" }, { status: 404 });
  }

  const newStatus = parsed.data.status;
  const targetLocationId = parsed.data.targetLocationId;

  // If receiving, must provide a targetLocationId or have a primary location
  let locationId = targetLocationId;
  if (newStatus === "RECEIVED" && !locationId) {
    const primaryLoc = await prisma.inventoryLocation.findFirst({
      where: { organizationId: session.organizationId, isPrimary: true },
      select: { id: true },
    });
    locationId = primaryLoc?.id;
  }

  if (newStatus === "RECEIVED" && !locationId) {
    return Response.json(
      { error: "targetLocationId is required to receive purchase order" },
      { status: 400 }
    );
  }

  // Execute in transaction: update PO status and if RECEIVED, increment stock and log movements
  const result = await prisma.$transaction(async (tx) => {
    const updatedPo = await tx.purchaseOrder.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true },
    });

    if (newStatus === "RECEIVED" && locationId) {
      for (const lineItem of po.items) {
        // Upsert stock level
        let stock = await tx.inventoryStockLevel.findUnique({
          where: {
            itemId_locationId: {
              itemId: lineItem.itemId,
              locationId,
            },
          },
        });

        if (!stock) {
          stock = await tx.inventoryStockLevel.create({
            data: {
              itemId: lineItem.itemId,
              locationId,
              onHand: lineItem.quantity,
              reserved: 0,
            },
          });
        } else {
          await tx.inventoryStockLevel.update({
            where: { id: stock.id },
            data: {
              onHand: stock.onHand + lineItem.quantity,
            },
          });
        }

        // Record movement
        await tx.inventoryMovement.create({
          data: {
            organizationId: session.organizationId,
            itemId: lineItem.itemId,
            locationId,
            type: "RECEIPT",
            quantity: lineItem.quantity,
            reason: "VENDOR_RESTOCK",
            reference: `PO-${po.id.slice(-6).toUpperCase()}`,
            performedById: session.userId,
            notes: `Received PO line item`,
          },
        });
      }
    }

    return updatedPo;
  });

  return Response.json({ purchaseOrder: result });
}
