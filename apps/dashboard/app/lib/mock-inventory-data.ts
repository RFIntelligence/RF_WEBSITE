/**
 * Inventory Type Definitions & Sparkline helper.
 * (Mock data arrays removed per Phase 3 requirement).
 */

export type InventoryStatus = 'HEALTHY' | 'LOW' | 'OUT' | 'OVERSTOCKED' | 'EXPIRING';

export type MovementType = 'RECEIPT' | 'SHIPMENT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'WASTAGE';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryId?: string | null;
  unitPrice: number;
  costPrice?: number;
  unit: string;
  reorderPoint: number;
  targetStock: number;
  expiryDate?: string | null;
  nearestExpiry?: string | null;
  description?: string | null;
  onHand?: number;
  status?: InventoryStatus;
  stockValue?: number;
  stockLevels?: StockLevel[];
}

export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  isPrimary?: boolean;
}

export interface StockLevel {
  id: string;
  itemId?: string;
  locationId: string;
  locationName?: string;
  locationCode?: string;
  onHand: number;
  reserved: number;
  available: number;
  updatedAt?: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  locationId: string;
  locationCode?: string;
  locationName?: string;
  type: MovementType;
  quantity: number;
  reason?: string | null;
  reference?: string | null;
  timestamp: string;
  performedBy: string;
  notes?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  category?: string;
  rating?: number;
  onTimeDeliveryRate?: number;
  averageLeadTimeDays?: number;
  poCount?: number;
}

export type POStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber?: string;
  supplierId: string;
  supplierName?: string;
  targetLocationId?: string;
  status: POStatus;
  createdAt: string;
  sentAt?: string | null;
  expectedDeliveryDate?: string | null;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string | null;
  createdByType?: string;
  createdByName?: string;
}

export function getTotalOnHand(itemId: string, stockLevels: StockLevel[]): number {
  return stockLevels
    .filter((sl) => !sl.itemId || sl.itemId === itemId)
    .reduce((sum, sl) => sum + sl.onHand, 0);
}

export function getItemTotalValue(item: InventoryItem, stockLevels: StockLevel[]): number {
  const totalQty = getTotalOnHand(item.id, stockLevels);
  return totalQty * item.unitPrice;
}

export function getItemStatus(item: InventoryItem, stockLevels: StockLevel[]): InventoryStatus {
  const total = getTotalOnHand(item.id, stockLevels);

  if (item.expiryDate || item.nearestExpiry) {
    const exp = item.expiryDate || item.nearestExpiry;
    const timeDiff = new Date(exp!).getTime() - Date.now();
    if (timeDiff > 0 && timeDiff <= 30 * 86400 * 1000) {
      return "EXPIRING";
    }
  }

  if (total === 0) return "OUT";
  if (total <= item.reorderPoint) return "LOW";
  if (item.targetStock > 0 && total > item.targetStock) return "OVERSTOCKED";
  return "HEALTHY";
}

export function get90DaySparklineData(item: { sku: string; targetStock: number; reorderPoint: number }, currentOnHand: number) {
  const points: { date: string; onHand: number; reorderPoint: number }[] = [];
  const days = 90;
  let simulatedStock = currentOnHand;

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (i !== 0) {
      const charCode = (item.sku || "SKU").charCodeAt(i % Math.max(1, item.sku?.length || 1));
      const isSpike = (i % 22 === 0);
      const isDrop = (i % 5 === 0);

      if (isSpike) {
        simulatedStock = Math.max(0, simulatedStock - Math.round((item.targetStock * 0.4) + (charCode % 5)));
      } else if (isDrop) {
        simulatedStock = Math.min(item.targetStock * 1.4, simulatedStock + (charCode % 4) + 1);
      }
    } else {
      simulatedStock = currentOnHand;
    }

    points.push({
      date: dateStr,
      onHand: Math.max(0, Math.round(simulatedStock)),
      reorderPoint: item.reorderPoint,
    });
  }

  return points;
}
