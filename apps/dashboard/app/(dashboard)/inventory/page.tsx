"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  AlertTriangle,
  Clock,
  CalendarDays,
  MapPin,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  TrendingUp,
  Building2,
  FileCheck2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/app/lib/utils";
import {
  MOCK_ITEMS,
  MOCK_LOCATIONS,
  MOCK_STOCK_LEVELS,
  MOCK_MOVEMENTS,
  MOCK_SUPPLIERS,
  MOCK_PURCHASE_ORDERS,
  InventoryItem,
  InventoryLocation,
  StockLevel,
  InventoryMovement,
  MovementType,
  InventoryStatus,
  Supplier,
  PurchaseOrder,
  getItemStatus,
  getTotalOnHand,
  getItemTotalValue,
} from "@/app/lib/mock-inventory-data";
import {
  ItemDetailSlideover,
  INVENTORY_STATUS_CONFIG,
} from "@/app/components/inventory/item-detail-slideover";
import { SuppliersPOView } from "@/app/components/inventory/suppliers-po-view";

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function InventorySkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-3.5 w-24 bg-[var(--surface-elevated)] rounded" />
        <div className="h-8 w-64 sm:w-80 bg-[var(--surface-elevated)] rounded-lg" />
        <div className="h-4 w-96 bg-[var(--surface-elevated)] rounded" />
      </div>

      {/* KPI skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]"
          />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-64 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]" />

      {/* Table skeleton */}
      <div className="h-80 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);

  // Top level active tab: "STOCK" | "SUPPLIERS_POS"
  const [activeTab, setActiveTab] = useState<"STOCK" | "SUPPLIERS_POS">("STOCK");

  // Core Data in Local State
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [locations] = useState<InventoryLocation[]>(MOCK_LOCATIONS);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>(MOCK_STOCK_LEVELS);
  const [movements, setMovements] = useState<InventoryMovement[]>(MOCK_MOVEMENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);

  // Selected item for Slide-Over
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Filter & Search states (Stock tab)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Sorting state (Stock tab)
  const [sortField, setSortField] = useState<"sku" | "name" | "category" | "onHand" | "status" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Simulate initial load skeleton
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ── Derived KPI Metrics ──

  const totalStockValue = useMemo(() => {
    return items.reduce((sum, item) => sum + getItemTotalValue(item, stockLevels), 0);
  }, [items, stockLevels]);

  const lowStockCount = useMemo(() => {
    return items.filter((item) => getItemStatus(item, stockLevels) === "LOW").length;
  }, [items, stockLevels]);

  const deadStockCount = useMemo(() => {
    const activeItemIds = new Set(movements.map((m) => m.itemId));
    return items.filter((item) => {
      const isOver = getItemStatus(item, stockLevels) === "OVERSTOCKED";
      const isIdle = !activeItemIds.has(item.id);
      return isOver || isIdle;
    }).length;
  }, [items, stockLevels, movements]);

  const expiringSoonCount = useMemo(() => {
    return items.filter((item) => getItemStatus(item, stockLevels) === "EXPIRING").length;
  }, [items, stockLevels]);

  // ── Stock By Location Chart Data ──
  const stockByLocationData = useMemo(() => {
    return locations.map((loc) => {
      let healthyCount = 0;
      let lowCount = 0;
      let outCount = 0;
      let valSum = 0;

      items.forEach((item) => {
        const sl = stockLevels.find((s) => s.itemId === item.id && s.locationId === loc.id);
        const qty = sl?.onHand ?? 0;
        valSum += qty * item.unitPrice;

        if (qty === 0) outCount++;
        else if (qty <= Math.ceil(item.reorderPoint / locations.length)) lowCount++;
        else healthyCount++;
      });

      return {
        location: loc.code,
        name: loc.name,
        Healthy: healthyCount,
        Low: lowCount,
        Out: outCount,
        stockValue: Math.round(valSum),
      };
    });
  }, [items, locations, stockLevels]);

  // ── Unique Categories for Filter Dropdown ──
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set).sort();
  }, [items]);

  // ── Filtered & Sorted Items ──
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;

      const itemSt = getItemStatus(item, stockLevels);
      const matchesStatus = selectedStatus === "ALL" || itemSt === selectedStatus;

      let matchesLoc = true;
      if (selectedLocation !== "ALL") {
        const sl = stockLevels.find((s) => s.itemId === item.id && s.locationId === selectedLocation);
        matchesLoc = (sl?.onHand ?? 0) > 0;
      }

      return matchesSearch && matchesCat && matchesStatus && matchesLoc;
    });
  }, [items, stockLevels, searchQuery, selectedCategory, selectedLocation, selectedStatus]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortField === "sku") {
        aVal = a.sku;
        bVal = b.sku;
      } else if (sortField === "name") {
        aVal = a.name;
        bVal = b.name;
      } else if (sortField === "category") {
        aVal = a.category;
        bVal = b.category;
      } else if (sortField === "onHand") {
        aVal = getTotalOnHand(a.id, stockLevels);
        bVal = getTotalOnHand(b.id, stockLevels);
      } else if (sortField === "price") {
        aVal = a.unitPrice;
        bVal = b.unitPrice;
      } else if (sortField === "status") {
        aVal = getItemStatus(a, stockLevels);
        bVal = getItemStatus(b, stockLevels);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortOrder, stockLevels]);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ── Local State Mutators for Slide-Over ──

  const handleUpdateReorderSettings = (
    itemId: string,
    newReorderPoint: number,
    newTargetStock: number
  ) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, reorderPoint: newReorderPoint, targetStock: newTargetStock }
          : i
      )
    );
  };

  const handleRecordMovement = (
    itemId: string,
    locationId: string,
    type: MovementType,
    quantity: number,
    reference: string,
    performedBy: string,
    notes?: string
  ) => {
    const newMovementId = `mov_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newMov: InventoryMovement = {
      id: newMovementId,
      itemId,
      locationId,
      type,
      quantity,
      reference,
      timestamp,
      performedBy,
      notes,
    };

    setMovements((prev) => [newMov, ...prev]);

    setStockLevels((prev) => {
      const existingIdx = prev.findIndex((s) => s.itemId === itemId && s.locationId === locationId);
      const isAddition = type === "RECEIPT" || type === "RETURN" || (type === "ADJUSTMENT" && quantity > 0);
      const deltaQty = isAddition ? Math.abs(quantity) : -Math.abs(quantity);

      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentSl = updated[existingIdx];
        const newOnHand = Math.max(0, currentSl.onHand + deltaQty);
        const newAvail = Math.max(0, newOnHand - currentSl.reserved);

        updated[existingIdx] = {
          ...currentSl,
          onHand: newOnHand,
          available: newAvail,
          updatedAt: timestamp,
        };
        return updated;
      } else {
        const newSl: StockLevel = {
          id: `sl_${itemId}_${locationId}`,
          itemId,
          locationId,
          onHand: Math.max(0, deltaQty),
          reserved: 0,
          available: Math.max(0, deltaQty),
          updatedAt: timestamp,
        };
        return [...prev, newSl];
      }
    });
  };

  // ── Local State Mutators for Purchase Orders & Suppliers ──

  const handleSendPO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === poId
          ? {
              ...po,
              status: "SENT",
              sentAt: new Date().toISOString(),
              createdByName: "Alex Rivera (Approved)",
            }
          : po
      )
    );
  };

  const handleCreatePO = (newPOData: Omit<PurchaseOrder, "id">) => {
    const newPO: PurchaseOrder = {
      ...newPOData,
      id: `po_${Date.now()}`,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
  };

  const handleReceivePO = (
    poId: string,
    receivedItems: { itemId: string; quantityToReceive: number }[],
    locationId: string,
    receiverName: string
  ) => {
    const timestamp = new Date().toISOString();
    let targetPoNumber = "";

    // 1. Update Purchase Order Items & Status
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        targetPoNumber = po.poNumber;

        const updatedItems = po.items.map((line) => {
          const recMatch = receivedItems.find((r) => r.itemId === line.itemId);
          const addQty = recMatch ? recMatch.quantityToReceive : 0;
          return {
            ...line,
            receivedQuantity: line.receivedQuantity + addQty,
          };
        });

        const isFullyReceived = updatedItems.every(
          (line) => line.receivedQuantity >= line.quantity
        );

        return {
          ...po,
          items: updatedItems,
          status: isFullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED",
        };
      })
    );

    // 2. Automatically Update Inventory Stock & Movement Logs for each received item!
    receivedItems.forEach((rec) => {
      if (rec.quantityToReceive > 0) {
        handleRecordMovement(
          rec.itemId,
          locationId,
          "RECEIPT",
          rec.quantityToReceive,
          targetPoNumber || `PO-DELIVERY-${poId}`,
          receiverName,
          `Received delivery against PO ${targetPoNumber}`
        );
      }
    });
  };

  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  if (loading) return <InventorySkeleton />;

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* ── Main Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">/ inventory &amp; procurement</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Warehouse Stock &amp; Supplier Management
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Monitor real-time SKU balances, reorder points, AI draft purchase orders, and supplier delivery performance.
          </p>
        </div>

        {/* Top-Level Module Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveTab("STOCK")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              activeTab === "STOCK"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            <Package className="size-4 text-[var(--accent)]" />
            <span>Stock Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SUPPLIERS_POS")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              activeTab === "SUPPLIERS_POS"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            <Building2 className="size-4 text-[var(--accent)]" />
            <span>Suppliers &amp; Purchase Orders</span>
            {purchaseOrders.filter((p) => p.status === "DRAFT").length > 0 && (
              <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {purchaseOrders.filter((p) => p.status === "DRAFT").length} drafts
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── TAB 1: INVENTORY STOCK OVERVIEW ── */}
      {activeTab === "STOCK" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* 1. KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 shadow-sm hover:border-[var(--border-strong)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Total Stock Value
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <DollarSign className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
                  ${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 mt-1">
                  <TrendingUp className="size-3" />
                  <span>Across {items.length} active SKUs</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 shadow-sm hover:border-[var(--border-strong)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Low Stock Items
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <AlertTriangle className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
                  {lowStockCount} <span className="text-xs text-[var(--text-muted)] font-normal">SKUs</span>
                </p>
                <p className="text-[11px] text-amber-400 font-mono mt-1">
                  {lowStockCount > 0 ? "Requires reorder PO" : "Stock levels optimal"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 shadow-sm hover:border-[var(--border-strong)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Dead Stock Items
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <Clock className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
                  {deadStockCount} <span className="text-xs text-[var(--text-muted)] font-normal">SKUs</span>
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-1">
                  Idle or excess capacity
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 shadow-sm hover:border-[var(--border-strong)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Expiring Soon
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <CalendarDays className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
                  {expiringSoonCount} <span className="text-xs text-[var(--text-muted)] font-normal">SKUs</span>
                </p>
                <p className="text-[11px] text-purple-400 font-mono mt-1">
                  Expires within 60 days
                </p>
              </div>
            </div>
          </div>

          {/* 2. Stock-by-Location Bar Chart */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin className="size-4 text-[var(--accent)]" />
                  Stock Distribution by Location
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Comparative breakdown of Healthy, Low, and Out-of-stock items across fulfillment centers.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                {locations.map((loc) => (
                  <span key={loc.id} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    {loc.name}: <strong className="text-[var(--text-primary)]">${stockByLocationData.find((d) => d.location === loc.code)?.stockValue.toLocaleString()}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByLocationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Healthy" fill="rgb(16,185,129)" radius={[4, 4, 0, 0]} name="Healthy Stock" />
                  <Bar dataKey="Low" fill="rgb(245,158,11)" radius={[4, 4, 0, 0]} name="Low Stock" />
                  <Bar dataKey="Out" fill="rgb(244,63,94)" radius={[4, 4, 0, 0]} name="Out of Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Sortable & Filterable Table Section */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 size-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by SKU, product name, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]">
                  <Filter className="size-3.5 text-[var(--text-muted)]" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent font-mono focus:outline-none text-[var(--text-primary)]"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]">
                  <MapPin className="size-3.5 text-[var(--text-muted)]" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-transparent font-mono focus:outline-none text-[var(--text-primary)]"
                  >
                    <option value="ALL">All Locations</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]">
                  <SlidersHorizontal className="size-3.5 text-[var(--text-muted)]" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent font-mono focus:outline-none text-[var(--text-primary)]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="HEALTHY">Healthy</option>
                    <option value="LOW">Low Stock</option>
                    <option value="OUT">Out of Stock</option>
                    <option value="OVERSTOCKED">Overstocked</option>
                    <option value="EXPIRING">Expiring Soon</option>
                  </select>
                </div>
              </div>
            </div>

            {sortedItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-3">
                <Package className="size-10 text-[var(--text-muted)] mx-auto opacity-50" />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">No inventory items found</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    No items match your active search filter "{searchQuery}" or selected dropdown filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                    setSelectedLocation("ALL");
                    setSelectedStatus("ALL");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-xs text-[var(--text-primary)] border border-[var(--border)] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] select-none">
                    <tr>
                      <th
                        onClick={() => handleSortToggle("sku")}
                        className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>SKU</span>
                          {sortField === "sku" ? (
                            sortOrder === "asc" ? <ArrowUp className="size-3 text-[var(--accent)]" /> : <ArrowDown className="size-3 text-[var(--accent)]" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSortToggle("name")}
                        className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Item Name</span>
                          {sortField === "name" ? (
                            sortOrder === "asc" ? <ArrowUp className="size-3 text-[var(--accent)]" /> : <ArrowDown className="size-3 text-[var(--accent)]" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSortToggle("category")}
                        className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Category</span>
                          {sortField === "category" ? (
                            sortOrder === "asc" ? <ArrowUp className="size-3 text-[var(--accent)]" /> : <ArrowDown className="size-3 text-[var(--accent)]" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3">Location Breakdown</th>

                      <th
                        onClick={() => handleSortToggle("onHand")}
                        className="px-4 py-3 text-right cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Total On Hand</span>
                          {sortField === "onHand" ? (
                            sortOrder === "asc" ? <ArrowUp className="size-3 text-[var(--accent)]" /> : <ArrowDown className="size-3 text-[var(--accent)]" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSortToggle("price")}
                        className="px-4 py-3 text-right cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Unit Price</span>
                          {sortField === "price" ? (
                            sortOrder === "asc" ? <ArrowUp className="size-3 text-[var(--accent)]" /> : <ArrowDown className="size-3 text-[var(--accent)]" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSortToggle("status")}
                        className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          {sortField === "status" ? (
                            sortOrder === "asc" ? <ArrowUp className="size-3 text-[var(--accent)]" /> : <ArrowDown className="size-3 text-[var(--accent)]" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </div>
                      </th>

                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--border)]">
                    {sortedItems.map((item) => {
                      const onHand = getTotalOnHand(item.id, stockLevels);
                      const status = getItemStatus(item, stockLevels);
                      const statusCfg = INVENTORY_STATUS_CONFIG[status];
                      const itemStock = stockLevels.filter((s) => s.itemId === item.id);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className="group cursor-pointer hover:bg-[var(--surface-elevated)]/60 transition-colors"
                        >
                          <td className="px-4 py-3.5 font-mono font-semibold text-[var(--accent)] whitespace-nowrap">
                            {item.sku}
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-[var(--text-muted)] whitespace-nowrap">
                            <span className="rounded bg-[var(--surface-elevated)] px-2 py-0.5 text-[10px] uppercase border border-[var(--border)]">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {locations.map((loc) => {
                                const qty = itemStock.find((s) => s.locationId === loc.id)?.onHand ?? 0;
                                return (
                                  <span
                                    key={loc.id}
                                    className={cn(
                                      "font-mono text-[10px] px-1.5 py-0.5 rounded border",
                                      qty > 0
                                        ? "bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border)]"
                                        : "bg-black/20 text-[var(--text-muted)] opacity-50 border-transparent"
                                    )}
                                    title={`${loc.name}: ${qty} ${item.unit}`}
                                  >
                                    {loc.code}: <strong>{qty}</strong>
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right font-mono font-bold text-[var(--text-primary)] whitespace-nowrap">
                            {onHand} <span className="text-[10px] text-[var(--text-muted)] font-normal">{item.unit}</span>
                          </td>

                          <td className="px-4 py-3.5 text-right font-mono text-[var(--text-primary)] whitespace-nowrap">
                            ${item.unitPrice.toFixed(2)}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase border"
                              style={{
                                background: statusCfg.bg,
                                color: statusCfg.text,
                                borderColor: statusCfg.border,
                              }}
                            >
                              <span
                                aria-hidden
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: statusCfg.dot }}
                              />
                              {statusCfg.label}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 text-center">
                            <ChevronRight className="size-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SUPPLIERS & PURCHASE ORDERS ── */}
      {activeTab === "SUPPLIERS_POS" && (
        <div className="animate-in fade-in duration-150">
          <SuppliersPOView
            suppliers={suppliers}
            purchaseOrders={purchaseOrders}
            items={items}
            locations={locations}
            onSendPO={handleSendPO}
            onCreatePO={handleCreatePO}
            onReceivePO={handleReceivePO}
          />
        </div>
      )}

      {/* ── Slide-Over Detail Component ── */}
      <ItemDetailSlideover
        item={selectedItem}
        locations={locations}
        stockLevels={stockLevels}
        movements={movements}
        onClose={() => setSelectedItemId(null)}
        onUpdateReorderSettings={handleUpdateReorderSettings}
        onRecordMovement={handleRecordMovement}
      />
    </div>
  );
}
