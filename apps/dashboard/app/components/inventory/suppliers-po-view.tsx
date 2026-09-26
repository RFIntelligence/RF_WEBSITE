"use client";

import React, { useState } from "react";
import {
  Building2,
  Truck,
  FileCheck2,
  Plus,
  Sparkles,
  User,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Send,
  X,
  ChevronRight,
  Filter,
  Search,
  Star,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import {
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  POStatus,
  InventoryItem,
  InventoryLocation,
  StockLevel,
  InventoryMovement,
  MovementType,
} from "@/app/lib/mock-inventory-data";

export const PO_STATUS_CONFIG: Record<
  POStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  DRAFT: {
    label: "AI Draft",
    bg: "rgba(168,85,247,0.12)",
    text: "rgb(192,132,252)",
    border: "rgba(168,85,247,0.35)",
  },
  SENT: {
    label: "Sent to Supplier",
    bg: "rgba(59,130,246,0.12)",
    text: "rgb(96,165,250)",
    border: "rgba(59,130,246,0.35)",
  },
  PARTIALLY_RECEIVED: {
    label: "Partially Received",
    bg: "rgba(245,158,11,0.12)",
    text: "rgb(251,191,36)",
    border: "rgba(245,158,11,0.35)",
  },
  RECEIVED: {
    label: "Fully Received",
    bg: "rgba(16,185,129,0.12)",
    text: "rgb(52,211,153)",
    border: "rgba(16,185,129,0.35)",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "rgba(244,63,94,0.12)",
    text: "rgb(251,113,133)",
    border: "rgba(244,63,94,0.35)",
  },
};

interface SuppliersPOViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  items: InventoryItem[];
  locations: InventoryLocation[];
  onSendPO: (poId: string) => void;
  onCreatePO: (newPO: Omit<PurchaseOrder, "id">) => void;
  onReceivePO: (
    poId: string,
    receivedItems: { itemId: string; quantityToReceive: number }[],
    locationId: string,
    receiverName: string
  ) => void;
}

export function SuppliersPOView({
  suppliers,
  purchaseOrders,
  items,
  locations,
  onSendPO,
  onCreatePO,
  onReceivePO,
}: SuppliersPOViewProps) {
  const [subTab, setSubTab] = useState<"POS" | "SUPPLIERS">("POS");
  const [poFilterStatus, setPoFilterStatus] = useState<string>("ALL");
  const [poSearch, setPoSearch] = useState<string>("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<string | null>(null);

  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [reviewingDraftPO, setReviewingDraftPO] = useState<PurchaseOrder | null>(null);

  // Filtered POs
  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesStatus = poFilterStatus === "ALL" || po.status === poFilterStatus;
    const supp = suppliers.find((s) => s.id === po.supplierId);
    const query = poSearch.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (po.poNumber ?? "").toLowerCase().includes(query) ||
      (supp?.name ?? "").toLowerCase().includes(query) ||
      (po.createdByName ?? "").toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* ── Sub Navigation Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab("POS")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors border",
              subTab === "POS"
                ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                : "bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
            )}
          >
            <FileCheck2 className="size-4" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("SUPPLIERS")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors border",
              subTab === "SUPPLIERS"
                ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                : "bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
            )}
          >
            <Building2 className="size-4" />
            <span>Approved Suppliers ({suppliers.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setPreselectedSupplierId(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm transition-colors"
        >
          <Plus className="size-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* ── SUB-TAB 1: PURCHASE ORDERS (Kanban / Filterable List) ── */}
      {subTab === "POS" && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border)]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search PO #, supplier, or creator..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                <Filter className="size-3.5" /> Status:
              </span>
              {["ALL", "DRAFT", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setPoFilterStatus(st)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-mono font-semibold uppercase rounded transition-colors border",
                    poFilterStatus === st
                      ? "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/40"
                      : "bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* List of PO Cards */}
          {filteredPOs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
              <FileCheck2 className="size-8 text-[var(--text-muted)] mx-auto opacity-50" />
              <p>No purchase orders found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPOs.map((po) => {
                const supplier = suppliers.find((s) => s.id === po.supplierId);
                const isDraft = po.status === "DRAFT";
                const isSent = po.status === "SENT";
                const isPartial = po.status === "PARTIALLY_RECEIVED";
                const isReceived = po.status === "RECEIVED";
                const statusCfg = PO_STATUS_CONFIG[po.status];

                return (
                  <div
                    key={po.id}
                    className={cn(
                      "rounded-xl border p-5 space-y-4 transition-all relative overflow-hidden flex flex-col justify-between",
                      isDraft
                        ? "border-purple-500/40 bg-purple-950/10 shadow-[0_0_15px_rgba(168,85,247,0.08)]"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    {/* Top Row: PO Number & Status Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-[var(--text-primary)]">
                              {po.poNumber}
                            </span>

                            {/* Visually Distinct AI Draft Badge */}
                            {po.createdByType === "AI_AGENT" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                <Sparkles className="size-3 text-purple-300" />
                                AI Drafted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border)]">
                                <User className="size-3" />
                                {po.createdByName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
                            {supplier?.name ?? "Supplier"} ({supplier?.code})
                          </p>
                        </div>

                        {/* Status Pill */}
                        <span
                          className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded border shrink-0"
                          style={{
                            background: statusCfg.bg,
                            color: statusCfg.text,
                            borderColor: statusCfg.border,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Items Summary */}
                      <div className="mt-3 space-y-1 pt-2 border-t border-[var(--border)]/60">
                        {po.items.map((line, idx) => {
                          const itemObj = items.find((i) => i.id === line.itemId);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]"
                            >
                              <span className="truncate max-w-[220px]">
                                {line.quantity}x {itemObj?.name ?? line.itemId}
                              </span>
                              <span>
                                ${(line.quantity * line.unitPrice).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Metadata & Action Buttons */}
                    <div className="space-y-3 pt-3 border-t border-[var(--border)]/60">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[var(--text-muted)]">Total Amount:</span>
                        <span className="text-base font-bold text-emerald-400">
                          ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          Delivery: {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                        </span>
                        {po.sentAt && (
                          <span className="flex items-center gap-1 text-[var(--accent)]">
                            <Send className="size-3" /> Sent {new Date(po.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      {/* Action CTAs */}
                      <div className="pt-1 flex items-center gap-2">
                        {isDraft && (
                          <button
                            type="button"
                            onClick={() => onSendPO(po.id)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-colors"
                          >
                            <Send className="size-3.5" />
                            <span>Review &amp; Approve AI Draft</span>
                          </button>
                        )}

                        {(isSent || isPartial) && (
                          <button
                            type="button"
                            onClick={() => setReceivingPO(po)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm transition-colors"
                          >
                            <PackageCheck className="size-3.5" />
                            <span>Receive Items</span>
                          </button>
                        )}

                        {isReceived && (
                          <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                            <CheckCircle2 className="size-4" />
                            Fully Stocked &amp; Closed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: SUPPLIERS LIST ── */}
      {subTab === "SUPPLIERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supp) => {
            const activePOs = purchaseOrders.filter(
              (p) => p.supplierId === supp.id && p.status !== "RECEIVED" && p.status !== "CANCELLED"
            ).length;

            return (
              <div
                key={supp.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4 shadow-sm hover:border-[var(--border-strong)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--accent)] rounded">
                        {supp.code}
                      </span>
                      <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                        {supp.name}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">{supp.category}</p>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      <Star className="size-3 fill-amber-400" />
                      {(supp.rating ?? 4.8).toFixed(1)}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 pt-3 border-t border-[var(--border)]/60 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">On-Time Delivery:</span>
                      <span className="font-bold text-emerald-400">{supp.onTimeDeliveryRate}%</span>
                    </div>
                    {/* Delivery Rate Bar */}
                    <div className="h-1.5 w-full bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${supp.onTimeDeliveryRate}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[var(--text-muted)]">Avg Lead Time:</span>
                      <span className="text-[var(--text-primary)]">{supp.averageLeadTimeDays} days</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Contact:</span>
                      <span className="text-[var(--text-secondary)]">{supp.contactName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {activePOs} active POs
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedSupplierId(supp.id);
                      setIsCreateOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    <span>Create PO</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE PO MODAL ── */}
      {isCreateOpen && (
        <CreatePOModal
          suppliers={suppliers}
          items={items}
          locations={locations}
          preselectedSupplierId={preselectedSupplierId}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(newPO) => {
            onCreatePO(newPO);
            setIsCreateOpen(false);
          }}
        />
      )}

      {/* ── RECEIVE PO MODAL ── */}
      {receivingPO && (
        <ReceivePOModal
          po={receivingPO}
          items={items}
          locations={locations}
          suppliers={suppliers}
          onClose={() => setReceivingPO(null)}
          onSubmit={(receivedItems, locationId, receiverName) => {
            onReceivePO(receivingPO.id, receivedItems, locationId, receiverName);
            setReceivingPO(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Create PO Modal Sub-Component ────────────────────────────────────────────

function CreatePOModal({
  suppliers,
  items,
  locations,
  preselectedSupplierId,
  onClose,
  onSubmit,
}: {
  suppliers: Supplier[];
  items: InventoryItem[];
  locations: InventoryLocation[];
  preselectedSupplierId: string | null;
  onClose: () => void;
  onSubmit: (po: Omit<PurchaseOrder, "id">) => void;
}) {
  const [supplierId, setSupplierId] = useState<string>(
    preselectedSupplierId || suppliers[0]?.id || ""
  );
  const [targetLocationId, setTargetLocationId] = useState<string>(
    locations[0]?.id || ""
  );
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(20);
  const [saveAsDraft, setSaveAsDraft] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");

  const selectedItemObj = items.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !selectedItemId || quantity <= 0) return;

    const unitPrice = selectedItemObj?.unitPrice ?? 100;
    const totalAmount = quantity * unitPrice;
    const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    onSubmit({
      poNumber,
      supplierId,
      targetLocationId,
      status: saveAsDraft ? "DRAFT" : "SENT",
      createdAt: new Date().toISOString(),
      sentAt: saveAsDraft ? null : new Date().toISOString(),
      expectedDeliveryDate: deliveryDate.toISOString(),
      items: [
        {
          itemId: selectedItemId,
          quantity,
          unitPrice,
          receivedQuantity: 0,
        },
      ],
      totalAmount,
      notes,
      createdByType: saveAsDraft ? "AI_AGENT" : "HUMAN",
      createdByName: saveAsDraft ? "RF Intelligence Agent" : "Alex Rivera",
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Plus className="size-4 text-[var(--accent)]" />
            Create Purchase Order
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
              Select Supplier
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
              Target Warehouse Hub
            </label>
            <select
              value={targetLocationId}
              onChange={(e) => setTargetLocationId(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                Item to Order
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.sku} - {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                Order Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
              Notes / Purpose
            </label>
            <input
              type="text"
              placeholder="e.g. Restocking for upcoming satellite contract"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* AI Draft vs Human Send Choice */}
          <div className="pt-2">
            <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1.5">
              Initial PO Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaveAsDraft(true)}
                className={cn(
                  "flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all",
                  saveAsDraft
                    ? "border-purple-500 bg-purple-950/40 text-purple-300"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                )}
              >
                <Sparkles className="size-3.5" />
                <span>Save as AI Draft</span>
              </button>

              <button
                type="button"
                onClick={() => setSaveAsDraft(false)}
                className={cn(
                  "flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all",
                  !saveAsDraft
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                )}
              >
                <Send className="size-3.5" />
                <span>Send Immediately</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Receive PO Modal Sub-Component ───────────────────────────────────────────

function ReceivePOModal({
  po,
  items,
  locations,
  suppliers,
  onClose,
  onSubmit,
}: {
  po: PurchaseOrder;
  items: InventoryItem[];
  locations: InventoryLocation[];
  suppliers: Supplier[];
  onClose: () => void;
  onSubmit: (receivedItems: { itemId: string; quantityToReceive: number }[], locationId: string, receiverName: string) => void;
}) {
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    po.items.forEach((line) => {
      map[line.itemId] = Math.max(0, line.quantity - (line.receivedQuantity ?? 0));
    });
    return map;
  });

  const [receiverName, setReceiverName] = useState("Alex Rivera");
  const [targetLocationId, setTargetLocationId] = useState(po.targetLocationId ?? locations[0]?.id ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = po.items.map((line) => ({
      itemId: line.itemId,
      quantityToReceive: Number(receiveQtys[line.itemId] || 0),
    }));

    onSubmit(payload, targetLocationId, receiverName);
  };

  const supplier = suppliers.find((s) => s.id === po.supplierId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <PackageCheck className="size-4 text-[var(--accent)]" />
              Receive Purchase Order {po.poNumber}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{supplier?.name}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase">
              Line Items Receiving Sheet
            </label>
            {po.items.map((line) => {
              const itemObj = items.find((i) => i.id === line.itemId);
              const remaining = line.quantity - (line.receivedQuantity ?? 0);

              return (
                <div
                  key={line.itemId}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 space-y-1.5"
                >
                  <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                    <span>{itemObj?.name ?? line.itemId}</span>
                    <span className="font-mono text-[var(--accent)]">{itemObj?.sku}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>Ordered: {line.quantity}</span>
                    <span>Prev Received: {line.receivedQuantity}</span>
                    <span className="text-amber-400 font-bold">Remaining: {remaining}</span>
                  </div>

                  <div className="pt-1">
                    <label className="block text-[9px] font-mono text-[var(--text-muted)] uppercase mb-0.5">
                      Receive Quantity in this Shipment
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={remaining}
                      value={receiveQtys[line.itemId] ?? 0}
                      onChange={(e) =>
                        setReceiveQtys((prev) => ({
                          ...prev,
                          [line.itemId]: Math.min(remaining, Math.max(0, Number(e.target.value))),
                        }))
                      }
                      className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-mono text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                Receive Into Warehouse
              </label>
              <select
                value={targetLocationId}
                onChange={(e) => setTargetLocationId(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                Receiver Name
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            >
              Confirm Delivery Receipt &amp; Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
