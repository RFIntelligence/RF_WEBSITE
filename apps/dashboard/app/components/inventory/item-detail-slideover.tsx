"use client";

import React, { useState, useEffect } from "react";
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
  itemId: string | null;
  locations: Array<{ id: string; name: string; code: string; isPrimary?: boolean }>;
  onClose: () => void;
  onItemUpdated: (updatedItem: any) => void;
  onOpenStockAdjust: (item: any) => void;
}

export function ItemDetailSlideover({
  itemId,
  locations,
  onClose,
  onItemUpdated,
  onOpenStockAdjust,
}: ItemDetailSlideoverProps) {
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [reorderPointInput, setReorderPointInput] = useState<number>(0);
  const [targetStockInput, setTargetStockInput] = useState<number>(0);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real details from /api/inventory/items/[id]
  useEffect(() => {
    if (!itemId) {
      setDetailItem(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/inventory/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item details");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setDetailItem(data.item);
          setReorderPointInput(data.item.reorderPoint);
          setTargetStockInput(data.item.targetStock);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [itemId]);

  if (!itemId) return null;

  if (loading || !detailItem) {
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
          <div className="flex items-center justify-between border-b border-[var(--border)] p-6 pb-5 bg-[var(--surface-elevated)]/40">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-elevated)] animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-[var(--surface-elevated)] rounded animate-pulse" />
                <div className="h-3 w-48 bg-[var(--surface-elevated)] rounded animate-pulse" />
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
          <div className="flex-1 flex items-center justify-center p-6 text-[var(--text-muted)]">
            {error ? (
              <div className="flex flex-col items-center gap-2 text-rose-400">
                <AlertCircle className="size-6" />
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-ping" />
                <span>Loading product specifications...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const item = detailItem;
  const status: InventoryStatus = item ? item.status : "HEALTHY";
  const statusCfg = INVENTORY_STATUS_CONFIG[status] || INVENTORY_STATUS_CONFIG.HEALTHY;
  const totalOnHand = item?.onHand ?? 0;
  const totalValue = totalOnHand * (item?.unitPrice ?? 0);
  const itemStockLevels: any[] = item?.stockLevels ?? [];
  const itemMovements: any[] = item?.movements ?? [];
  const sparklineData = item ? get90DaySparklineData(item, totalOnHand) : [];

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    try {
      const res = await fetch(`/api/inventory/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reorderPoint: Number(reorderPointInput),
          targetStock: Number(targetStockInput),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setDetailItem((prev: any) => ({
        ...prev,
        ...data.item,
      }));
      onItemUpdated(data.item);
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save settings");
    }
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

          {/* 5. Quick Stock Adjustment Trigger */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)]/40 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <PlusCircle className="size-4 text-[var(--accent)]" />
                Manage Stock (In / Out / Transfer)
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Record receipts, dispatch customer orders, perform shelf audits, or transfer stock.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenStockAdjust(item)}
              className="rounded-lg bg-[var(--accent)] text-black px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <PlusCircle className="size-3.5" />
              Adjust Stock
            </button>
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
