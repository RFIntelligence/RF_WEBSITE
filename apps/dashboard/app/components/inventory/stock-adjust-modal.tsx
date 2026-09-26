"use client";

import React, { useState } from "react";
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Sliders, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

export interface StockAdjustModalProps {
  isOpen: boolean;
  item: {
    id: string;
    sku: string;
    name: string;
    unit: string;
    onHand: number;
  } | null;
  locations: Array<{ id: string; name: string; code: string }>;
  onClose: () => void;
  onSuccess: (updatedItem: any) => void;
}

export function StockAdjustModal({
  isOpen,
  item,
  locations,
  onClose,
  onSuccess,
}: StockAdjustModalProps) {
  const [type, setType] = useState<"RECEIPT" | "SHIPMENT" | "TRANSFER" | "ADJUSTMENT">("RECEIPT");
  const [quantity, setQuantity] = useState<number>(10);
  const [locationId, setLocationId] = useState<string>(locations[0]?.id || "");
  const [toLocationId, setToLocationId] = useState<string>(locations[1]?.id || "");
  const [reason, setReason] = useState<string>("VENDOR_RESTOCK");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || quantity <= 0) {
      setError("Please specify a valid location and positive quantity.");
      return;
    }
    if (type === "TRANSFER" && (!toLocationId || toLocationId === locationId)) {
      setError("Please select a distinct destination location.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/inventory/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          locationId,
          type,
          quantity: Number(quantity),
          toLocationId: type === "TRANSFER" ? toLocationId : undefined,
          reason,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to adjust stock");
      }

      onSuccess(data.item);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <span className="font-mono text-[10px] uppercase text-[var(--accent)] font-semibold">
              {item.sku}
            </span>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Stock In / Out Adjustment
            </h2>
            <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
              {item.name} · Current Total: <strong className="text-[var(--text-primary)]">{item.onHand} {item.unit}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Segmented Type Control */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-xs">
              <button
                type="button"
                onClick={() => {
                  setType("RECEIPT");
                  setReason("VENDOR_RESTOCK");
                }}
                className={cn(
                  "flex items-center justify-center gap-1 py-1.5 rounded-md font-medium transition-colors",
                  type === "RECEIPT"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <ArrowDownRight className="size-3.5" />
                <span>Stock In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("SHIPMENT");
                  setReason("CUSTOMER_ORDER");
                }}
                className={cn(
                  "flex items-center justify-center gap-1 py-1.5 rounded-md font-medium transition-colors",
                  type === "SHIPMENT"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <ArrowUpRight className="size-3.5" />
                <span>Stock Out</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("TRANSFER");
                  setReason("INTER_STORE_TRANSFER");
                }}
                className={cn(
                  "flex items-center justify-center gap-1 py-1.5 rounded-md font-medium transition-colors",
                  type === "TRANSFER"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <ArrowLeftRight className="size-3.5" />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("ADJUSTMENT");
                  setReason("AUDIT_CORRECTION");
                }}
                className={cn(
                  "flex items-center justify-center gap-1 py-1.5 rounded-md font-medium transition-colors",
                  type === "ADJUSTMENT"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <Sliders className="size-3.5" />
                <span>Audit</span>
              </button>
            </div>
          </div>

          {/* Locations & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1">
                {type === "TRANSFER" ? "From Location" : "Store / Warehouse Location"}
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code} ({loc.name})
                  </option>
                ))}
              </select>
            </div>

            {type === "TRANSFER" ? (
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1">
                  To Location
                </label>
                <select
                  value={toLocationId}
                  onChange={(e) => setToLocationId(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {locations
                    .filter((l) => l.id !== locationId)
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.code} ({loc.name})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1">
                  Quantity ({item.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            )}
          </div>

          {type === "TRANSFER" && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Quantity to Transfer ({item.unit})
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* Reason & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Reason Code
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="VENDOR_RESTOCK">Vendor Restock / Inward</option>
                <option value="CUSTOMER_ORDER">Customer Order Picked</option>
                <option value="DAMAGED">Damaged / Broken</option>
                <option value="EXPIRED">Expired / Waste</option>
                <option value="AUDIT_CORRECTION">Inventory Audit Correction</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Reference / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. PO-8921 or Shelf Check"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-3.5 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[var(--accent)] text-black px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
