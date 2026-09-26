"use client";

import React, { useState } from "react";
import { X, Layers, Plus, Trash2, AlertCircle } from "lucide-react";

export interface CategoryModalProps {
  isOpen: boolean;
  categories: Array<{ id: string; name: string; description?: string; itemCount: number }>;
  onClose: () => void;
  onCategoryCreated: (newCat: any) => void;
}

export function CategoryModal({
  isOpen,
  categories,
  onClose,
  onCategoryCreated,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      onCategoryCreated(data.category);
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err?.message || "Failed to create category");
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
        className="relative w-full max-w-md rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <Layers className="size-4" />
            </span>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Manage Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Existing Categories list */}
        <div className="mt-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
            Existing Categories ({categories.length})
          </span>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] divide-y divide-[var(--border)]">
            {categories.length === 0 ? (
              <p className="p-3 text-xs text-[var(--text-muted)] text-center">No categories yet</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2.5 text-xs">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{cat.name}</p>
                    {cat.description && (
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{cat.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
                    {cat.itemCount} items
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} className="mt-4 pt-3 border-t border-[var(--border)] space-y-3">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
            Add New Category
          </span>
          <div>
            <input
              type="text"
              required
              placeholder="e.g. Dairy & Breakfast, Cold Drinks, Produce"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] text-black px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Plus className="size-3.5" />
              <span>{submitting ? "Adding..." : "Add Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
