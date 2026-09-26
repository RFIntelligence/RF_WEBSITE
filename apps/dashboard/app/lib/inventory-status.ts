import type {
  InventoryUnit,
  InventoryMovementType,
  PurchaseOrderStatus,
} from "@rf-intelligence/db";

export type InventoryStatus = "HEALTHY" | "LOW" | "OUT" | "OVERSTOCKED" | "EXPIRING";

export interface ComputedStatusParams {
  onHand: number;
  reorderPoint: number;
  targetStock: number;
  nearestExpiry?: Date | string | null;
  expiryTrackingEnabled?: boolean;
}

/**
 * Computes live inventory status dynamically from onHand, reorderPoint, targetStock, and batch expiry.
 * Never stored in the database.
 *
 * Rules:
 * 1. OUT: onHand <= 0
 * 2. EXPIRING: expiryTrackingEnabled is true and nearestExpiry is within 30 days
 * 3. LOW: onHand <= reorderPoint
 * 4. OVERSTOCKED: targetStock > 0 and onHand > targetStock
 * 5. HEALTHY: otherwise
 */
export function computeInventoryStatus({
  onHand,
  reorderPoint,
  targetStock,
  nearestExpiry,
  expiryTrackingEnabled,
}: ComputedStatusParams): InventoryStatus {
  if (onHand <= 0) {
    return "OUT";
  }

  if (expiryTrackingEnabled && nearestExpiry) {
    const expDate = typeof nearestExpiry === "string" ? new Date(nearestExpiry) : nearestExpiry;
    const now = new Date();
    const daysUntilExpiry = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiry <= 30) {
      return "EXPIRING";
    }
  }

  if (onHand <= reorderPoint) {
    return "LOW";
  }

  if (targetStock > 0 && onHand > targetStock) {
    return "OVERSTOCKED";
  }

  return "HEALTHY";
}
