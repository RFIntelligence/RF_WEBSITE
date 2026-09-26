"use client";

import React, { useState } from "react";
import { X, PackagePlus, Sparkles, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";

export interface AddItemSlideoverProps {
  isOpen: boolean;
  categories: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string; code: string }>;
  onClose: () => void;
  onItemCreated: (newItem: any) => void;
  onOpenAddCategory: () => void;
}

export function AddItemSlideover({
  isOpen,
  categories,
  locations,
  onClose,
  onItemCreated,
  onOpenAddCategory,
}: AddItemSlideoverProps) {
  // Required & Fast-add fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [initialQty, setInitialQty] = useState<number>(0);
  const [initialLocationId, setInitialLocationId] = useState(locations[0]?.id || "");

  // Progressive disclosure state (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields with sensible defaults
  const [costPrice, setCostPrice] = useState<string>("0");
  const [reorderPoint, setReorderPoint] = useState<string>("0");
  const [targetStock, setTargetStock] = useState<string>("0");
  const [sku, setSku] = useState("");
  const [autoSku, setAutoSku] = useState(true);
  const [unit, setUnit] = useState("UNITS");
  const [expiryTracking, setExpiryTracking] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please give this item a name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const priceNum = parseFloat(unitPrice);
    const parsedUnitPrice = isNaN(priceNum) || priceNum < 0 ? 0 : priceNum;

    const costNum = parseFloat(costPrice);
    const parsedCostPrice = isNaN(costNum) || costNum < 0 ? 0 : costNum;

    const reorderNum = parseInt(reorderPoint, 10);
    const parsedReorderPoint = isNaN(reorderNum) || reorderNum < 0 ? 0 : reorderNum;

    const targetNum = parseInt(targetStock, 10);
    const parsedTargetStock = isNaN(targetNum) || targetNum < 0 ? 0 : targetNum;

    const payload = {
      sku: autoSku ? undefined : (sku.trim() || undefined),
      name: name.trim(),
      categoryId: categoryId || undefined,
      unit,
      costPrice: parsedCostPrice,
      unitPrice: parsedUnitPrice,
      reorderPoint: parsedReorderPoint,
      targetStock: parsedTargetStock,
      description: description.trim() || undefined,
      expiryTrackingEnabled: expiryTracking,
      initialStock: initialQty > 0 && initialLocationId
        ? {
            locationId: initialLocationId,
            quantity: Number(initialQty),
            expiryDate: expiryTracking && expiryDate ? new Date(expiryDate).toISOString() : undefined,
          }
        : undefined,
    };

    try {
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create item");
      }

      onItemCreated(data.item);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create item. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl h-full flex flex-col bg-[var(--surface)] border-l border-[var(--border-strong)] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simplified Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] p-6 pb-4 bg-[var(--surface-elevated)]/40">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
              <PackagePlus className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Add Item</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Add a new product to your inventory.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── 1. FAST-ADD REQUIRED FIELDS (ALWAYS VISIBLE) ── */}

          {/* Field 1: Item Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">
              Item Name <span className="text-[var(--accent)]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. 5.8GHz Directional Antenna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Field 2 & 3: Category & Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Category
                </label>
                <button
                  type="button"
                  onClick={onOpenAddCategory}
                  className="text-[11px] font-medium text-[var(--accent)] hover:underline"
                >
                  + New
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Selling Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-[var(--text-muted)]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] pl-7 pr-3 py-2 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Field 4: Starting Quantity + Location (Folded into single natural row) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Starting stock &amp; location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min="0"
                  placeholder="Quantity (e.g. 20)"
                  value={initialQty === 0 ? "" : initialQty}
                  onChange={(e) => setInitialQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <select
                  value={initialLocationId}
                  onChange={(e) => setInitialLocationId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.code} ({loc.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Leave quantity as 0 if you are setting up the product before delivery.
            </p>
          </div>

          {/* ── 2. PROGRESSIVE DISCLOSURE (ADVANCED SETTINGS) ── */}
          <div className="pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
            >
              <span className="flex items-center gap-1.5">
                <span>Advanced settings</span>
                {!showAdvanced && (
                  <span className="text-[10px] font-normal text-[var(--text-muted)]">
                    (cost, alerts, barcode, expiry)
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform duration-200",
                  showAdvanced && "rotate-180"
                )}
              />
            </button>

            {/* Smoothly expandable container */}
            <div
              className={cn(
                "space-y-4 overflow-hidden transition-all duration-200 ease-in-out",
                showAdvanced ? "max-h-[600px] opacity-100 mt-3" : "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              {/* Cost Price, Alert Threshold, Target Shelf Max */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] text-[var(--text-secondary)]">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-[var(--text-secondary)]">
                    Alert below (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-[var(--text-secondary)]">
                    Shelf capacity (max)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    value={targetStock}
                    onChange={(e) => setTargetStock(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* SKU & Stock Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] text-[var(--text-secondary)]">
                      SKU / Barcode
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSku}
                        onChange={(e) => setAutoSku(e.target.checked)}
                        className="rounded text-[var(--accent)]"
                      />
                      <span>Auto-generate</span>
                    </label>
                  </div>
                  {!autoSku ? (
                    <input
                      type="text"
                      placeholder="e.g. ANT-58G-DIR"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] italic pt-1">
                      Generated automatically from category code
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-[var(--text-secondary)]">
                    Stock Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="UNITS">Units (Standard)</option>
                    <option value="PCS">Pieces (Pcs)</option>
                    <option value="PACKS">Packs / Box</option>
                    <option value="KG">Kilograms (Kg)</option>
                    <option value="G">Grams (g)</option>
                    <option value="LITRES">Litres (L)</option>
                    <option value="ML">Milliliters (ml)</option>
                  </select>
                </div>
              </div>

              {/* Calibration / Expiry Tracking */}
              <div className="space-y-2 pt-1 border-t border-[var(--border)]/60">
                <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expiryTracking}
                    onChange={(e) => setExpiryTracking(e.target.checked)}
                    className="rounded text-[var(--accent)]"
                  />
                  <span>Track calibration / batch shelf life date</span>
                </label>

                {expiryTracking && (
                  <div className="pt-1">
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                )}
              </div>

              {/* Description / Notes */}
              <div className="space-y-1 pt-1">
                <label className="block text-[11px] text-[var(--text-secondary)]">
                  Description / Storage notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details, part numbers, shelf storage notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="rounded-lg bg-[var(--accent)] text-black px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
