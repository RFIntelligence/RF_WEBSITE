"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  MapPin,
  TrendingUp,
  History,
  Settings2,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { cn } from "@/app/lib/utils";
import {
  InventoryItem,
  InventoryLocation,
  StockLevel,
  InventoryMovement,
  MovementType,
  InventoryStatus,
  getItemStatus,
  getTotalOnHand,
  get90DaySparklineData,
} from "@/app/lib/mock-inventory-data";

// ─── Status Config ─────────────────────────────────────────────────────────────

export const INVENTORY_STATUS_CONFIG: Record<
  InventoryStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  HEALTHY: {
    label: "Healthy",
    bg: "rgba(16,185,129,0.12)",
    text: "rgb(52,211,153)",
    border: "rgba(16,185,129,0.3)",
    dot: "rgb(16,185,129)",
  },
  LOW: {
    label: "Low Stock",
    bg: "rgba(245,158,11,0.12)",
    text: "rgb(251,191,36)",
    border: "rgba(245,158,11,0.3)",
    dot: "rgb(245,158,11)",
  },
  OUT: {
    label: "Out of Stock",
    bg: "rgba(244,63,94,0.12)",
    text: "rgb(251,113,133)",
    border: "rgba(244,63,94,0.3)",
    dot: "rgb(244,63,94)",
  },
  OVERSTOCKED: {
    label: "Overstocked",
    bg: "rgba(59,130,246,0.12)",
    text: "rgb(96,165,250)",
    border: "rgba(59,130,246,0.3)",
    dot: "rgb(59,130,246)",
  },
  EXPIRING: {
    label: "Expiring Soon",
    bg: "rgba(168,85,247,0.12)",
    text: "rgb(192,132,252)",
    border: "rgba(168,85,247,0.3)",
    dot: "rgb(168,85,247)",
  },
};

interface ItemDetailSlideoverProps {
  item: InventoryItem | null;
  locations: InventoryLocation[];
  stockLevels: StockLevel[];
  movements: InventoryMovement[];
  onClose: () => void;
  onUpdateReorderSettings: (itemId: string, newReorderPoint: number, newTargetStock: number) => void;
  onRecordMovement: (
    itemId: string,
    locationId: string,
    type: MovementType,
    quantity: number,
    reference: string,
    performedBy: string,
    notes?: string
  ) => void;
}

export function ItemDetailSlideover({
  item,
  locations,
  stockLevels,
  movements,
  onClose,
  onUpdateReorderSettings,
  onRecordMovement,
}: ItemDetailSlideoverProps) {
  if (!item) return null;

  const itemStockLevels = stockLevels.filter((sl) => sl.itemId === item.id);
  const itemMovements = movements.filter((m) => m.itemId === item.id);
  const totalOnHand = getTotalOnHand(item.id, stockLevels);
  const status = getItemStatus(item, stockLevels);
  const statusCfg = INVENTORY_STATUS_CONFIG[status];
  const totalValue = totalOnHand * item.unitPrice;

  // Form states
  const [reorderPointInput, setReorderPointInput] = useState<number>(item.reorderPoint);
  const [targetStockInput, setTargetStockInput] = useState<number>(item.targetStock);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Movement Form states
  const [movType, setMovType] = useState<MovementType>("RECEIPT");
  const [movLocationId, setMovLocationId] = useState<string>(locations[0]?.id ?? "");
  const [movQty, setMovQty] = useState<number>(10);
  const [movRef, setMovRef] = useState<string>(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [movUser, setMovUser] = useState<string>("Alex Rivera");
  const [movNotes, setMovNotes] = useState<string>("");
  const [movementToast, setMovementToast] = useState<string | null>(null);

  // 90-day Sparkline
  const sparklineData = get90DaySparklineData(item, totalOnHand);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateReorderSettings(item.id, Number(reorderPointInput), Number(targetStockInput));
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleRecordMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movLocationId || movQty <= 0) return;

    onRecordMovement(
      item.id,
      movLocationId,
      movType,
      Number(movQty),
      movRef.trim() || "REF-LOG",
      movUser.trim() || "Inventory Operator",
      movNotes.trim()
    );

    const locName = locations.find((l) => l.id === movLocationId)?.code ?? "Warehouse";
    setMovementToast(`Recorded ${movType} of ${movQty} ${item.unit} at ${locName}`);
    setTimeout(() => setMovementToast(null), 4000);

    // Reset reference for next entry
    setMovRef(`REF-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setMovNotes("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-slideover-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl h-full flex flex-col bg-[var(--surface)] border-l border-[var(--border-strong)] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Slideover Header ── */}
        <div className="flex items-start justify-between border-b border-[var(--border)] p-6 pb-5 bg-[var(--surface-elevated)]/40">
          <div className="flex items-start gap-3.5 min-w-0">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
              style={{
                background: statusCfg.bg,
                borderColor: statusCfg.border,
                color: statusCfg.text,
              }}
            >
              <Package className="size-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded font-mono text-[11px] font-semibold uppercase px-2 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--accent)]">
                  {item.sku}
                </span>
                <span className="rounded text-[11px] font-mono uppercase px-2 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
                  {item.category}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-mono uppercase font-semibold border"
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
              </div>
              <h2
                id="item-slideover-title"
                className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight truncate"
              >
                {item.name}
              </h2>
              {item.description && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close slideover"
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-3">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Total On Hand
              </span>
              <p className="text-lg font-bold text-[var(--text-primary)] font-mono mt-0.5">
                {totalOnHand}{" "}
                <span className="text-xs text-[var(--text-muted)] font-normal">
                  {item.unit}
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-3">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Unit Value
              </span>
              <p className="text-lg font-bold text-[var(--text-primary)] font-mono mt-0.5">
                ${item.unitPrice.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-3">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Total Valuation
              </span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-3">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Reorder Point
              </span>
              <p className="text-lg font-bold text-[var(--accent)] font-mono mt-0.5">
                {item.reorderPoint}{" "}
                <span className="text-xs text-[var(--text-muted)] font-normal">min</span>
              </p>
            </div>
          </div>

          {/* 1. Stock Per Location Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <MapPin className="size-4 text-[var(--accent)]" />
                Stock Per Location
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {locations.length} fulfillment centers
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {locations.map((loc) => {
                const sl = itemStockLevels.find((s) => s.locationId === loc.id) ?? {
                  onHand: 0,
                  reserved: 0,
                  available: 0,
                };
                const percentOfTarget = item.targetStock > 0
                  ? Math.min(100, Math.round((sl.onHand / (item.targetStock / locations.length)) * 100))
                  : 0;

                return (
                  <div
                    key={loc.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/30 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {loc.code}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-mono font-semibold bg-[var(--accent)]/15 text-[var(--accent)] px-1.5 py-0.5 rounded border border-[var(--accent)]/30">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {loc.name}
                    </p>

                    <div className="space-y-1 font-mono text-xs pt-1 border-t border-[var(--border)]/60">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">On Hand:</span>
                        <span className="font-bold text-[var(--text-primary)]">{sl.onHand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Reserved:</span>
                        <span className="text-amber-400">{sl.reserved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Available:</span>
                        <span className="text-emerald-400">{sl.available}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                        <span>Target Fill</span>
                        <span>{percentOfTarget}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--surface)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                          style={{ width: `${percentOfTarget}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. 90-Day On-Hand Sparkline */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <TrendingUp className="size-4 text-[var(--accent)]" />
                  90-Day On-Hand Stock Trend
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Plausible historical stock levels with reorder threshold reference line
                </p>
              </div>
              <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">
                Min Threshold: {item.reorderPoint}
              </span>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id="itemStockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    interval={15}
                  />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <ReferenceLine
                    y={item.reorderPoint}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `Reorder Min: ${item.reorderPoint}`,
                      fill: "#f59e0b",
                      fontSize: 10,
                      position: "insideTopRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="onHand"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#itemStockGrad)"
                    name="On Hand Stock"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Movement History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <History className="size-4 text-[var(--accent)]" />
                Recent Movement History
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {itemMovements.length} recorded events
              </span>
            </div>

            {itemMovements.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--text-muted)] italic">
                No movements recorded yet for this item. Use the form below to record the first movement.
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/20 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)] font-mono text-[10px] uppercase text-[var(--text-muted)]">
                    <tr>
                      <th className="px-3 py-2">Timestamp</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2">Ref #</th>
                      <th className="px-3 py-2">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/60 font-mono">
                    {itemMovements.map((m) => {
                      const isPositive = m.quantity > 0 || m.type === "RECEIPT" || m.type === "RETURN";
                      const locCode = locations.find((l) => l.id === m.locationId)?.code ?? "WH";

                      return (
                        <tr key={m.id} className="hover:bg-[var(--surface-elevated)]/40 transition-colors">
                          <td className="px-3 py-2 text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                            {new Date(m.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                m.type === "RECEIPT" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                                m.type === "SHIPMENT" && "bg-rose-500/15 text-rose-400 border border-rose-500/30",
                                m.type === "TRANSFER" && "bg-blue-500/15 text-blue-400 border border-blue-500/30",
                                m.type === "ADJUSTMENT" && "bg-purple-500/15 text-purple-400 border border-purple-500/30",
                                m.type === "RETURN" && "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              )}
                            >
                              {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                              {m.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">{locCode}</td>
                          <td
                            className={cn(
                              "px-3 py-2 text-right font-bold",
                              isPositive ? "text-emerald-400" : "text-rose-400"
                            )}
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-muted)] truncate max-w-[100px]" title={m.reference}>
                            {m.reference}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-muted)] truncate max-w-[90px]" title={m.performedBy}>
                            {m.performedBy}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Editable Reorder Settings */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sliders className="size-4 text-[var(--accent)]" />
                Reorder Threshold Settings
              </h3>
              {settingsSavedToast && (
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-in fade-in">
                  <CheckCircle2 className="size-3" /> Saved to local state!
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Adjust minimum reorder threshold and target stock level to update local inventory status.
            </p>

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Reorder Point (Min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={reorderPointInput}
                  onChange={(e) => setReorderPointInput(Number(e.target.value))}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Target Stock (Max)
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetStockInput}
                  onChange={(e) => setTargetStockInput(Number(e.target.value))}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-md bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-primary)] px-3 py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Settings2 className="size-3.5 text-[var(--accent)]" />
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* 5. "Record Movement" Form */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)]/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <PlusCircle className="size-4 text-[var(--accent)]" />
                Record Stock Movement
              </h3>
              {movementToast && (
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-in fade-in">
                  <CheckCircle2 className="size-3" /> {movementToast}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Appends a new receipt, shipment, or adjustment event to update stock levels live.
            </p>

            <form onSubmit={handleRecordMovementSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                    Movement Type
                  </label>
                  <select
                    value={movType}
                    onChange={(e) => setMovType(e.target.value as MovementType)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="RECEIPT">RECEIPT (Stock +)</option>
                    <option value="SHIPMENT">SHIPMENT (Stock -)</option>
                    <option value="TRANSFER">TRANSFER (Inter-location)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (Audit)</option>
                    <option value="RETURN">RETURN (RMA +)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                    Target Location
                  </label>
                  <select
                    value={movLocationId}
                    onChange={(e) => setMovLocationId(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                    Quantity ({item.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movQty}
                    onChange={(e) => setMovQty(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                    Reference # (PO/SO)
                  </label>
                  <input
                    type="text"
                    required
                    value={movRef}
                    onChange={(e) => setMovRef(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                    Performed By
                  </label>
                  <input
                    type="text"
                    required
                    value={movUser}
                    onChange={(e) => setMovUser(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                    Notes / Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received batch PO shipment"
                    value={movNotes}
                    onChange={(e) => setMovNotes(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="size-4" />
                  Append Movement &amp; Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Slideover Footer ── */}
        <div className="flex items-center justify-between border-t border-[var(--border)] p-4 bg-[var(--surface-elevated)]/40">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            Item ID: {item.id}
          </span>
          <button
            onClick={onClose}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
