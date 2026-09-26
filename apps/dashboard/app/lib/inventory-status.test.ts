import { describe, it, expect } from "vitest";
import { computeInventoryStatus } from "@/app/lib/inventory-status";

describe("Phase 4: Inventory Status Calculation Guardrails", () => {
  it("returns OUT when onHand is 0 or negative", () => {
    expect(
      computeInventoryStatus({
        onHand: 0,
        reorderPoint: 10,
        targetStock: 50,
      })
    ).toBe("OUT");

    expect(
      computeInventoryStatus({
        onHand: -2,
        reorderPoint: 10,
        targetStock: 50,
      })
    ).toBe("OUT");
  });

  it("identifies EXPIRING at the 30-day boundary", () => {
    const now = new Date();
    // Exactly 30 days from now
    const thirtyDaysOut = new Date(now.getTime() + 30 * 86_400_000);
    // 31 days from now (not expiring)
    const thirtyOneDaysOut = new Date(now.getTime() + 31 * 86_400_000);

    expect(
      computeInventoryStatus({
        onHand: 40,
        reorderPoint: 10,
        targetStock: 50,
        expiryTrackingEnabled: true,
        nearestExpiry: thirtyDaysOut,
      })
    ).toBe("EXPIRING");

    expect(
      computeInventoryStatus({
        onHand: 40,
        reorderPoint: 10,
        targetStock: 50,
        expiryTrackingEnabled: true,
        nearestExpiry: thirtyOneDaysOut,
      })
    ).toBe("HEALTHY");
  });

  it("handles LOW boundary when onHand == reorderPoint", () => {
    expect(
      computeInventoryStatus({
        onHand: 15,
        reorderPoint: 15,
        targetStock: 50,
      })
    ).toBe("LOW");

    // 1 above reorderPoint is HEALTHY
    expect(
      computeInventoryStatus({
        onHand: 16,
        reorderPoint: 15,
        targetStock: 50,
      })
    ).toBe("HEALTHY");
  });

  it("handles OVERSTOCKED boundary when onHand > targetStock", () => {
    expect(
      computeInventoryStatus({
        onHand: 50,
        reorderPoint: 10,
        targetStock: 50,
      })
    ).toBe("HEALTHY");

    expect(
      computeInventoryStatus({
        onHand: 51,
        reorderPoint: 10,
        targetStock: 50,
      })
    ).toBe("OVERSTOCKED");
  });
});
