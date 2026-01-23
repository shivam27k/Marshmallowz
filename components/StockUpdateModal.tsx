"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { Icons } from "./Icons";

interface StockUpdateModalProps {
  product: Product;
  onClose: () => void;
  onUpdate: (productId: number, adjustment: number, type: "add" | "remove" | "set") => Promise<void>;
}

export default function StockUpdateModal({ product, onClose, onUpdate }: StockUpdateModalProps) {
  const [adjustment, setAdjustment] = useState(0);
  const [mode, setMode] = useState<"add" | "remove" | "set">("add");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (adjustment <= 0 && mode !== "set") return;
    if (mode === "set" && adjustment < 0) return;

    setLoading(true);
    try {
      await onUpdate(product.id, adjustment, mode);
      onClose();
    } catch (error) {
      console.error("Failed to update stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const newStock =
    mode === "add"
      ? product.quantity_in_hand + adjustment
      : mode === "remove"
      ? Math.max(0, product.quantity_in_hand - adjustment)
      : adjustment;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Update Stock</h2>
            <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
              {product.description}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon-sm">
            {Icons.close}
          </button>
        </div>

        <div className="modal-body">
          {/* Current stock */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--muted-light)",
            borderRadius: 12,
            marginBottom: 24
          }}>
            <span style={{ color: "var(--muted)" }}>Current Stock</span>
            <span style={{ fontWeight: 600 }}>{product.quantity_in_hand} units</span>
          </div>

          {/* Mode selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 500 }}>
              Action
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "add", label: "Add Stock", icon: Icons.plus },
                { id: "remove", label: "Remove", icon: Icons.minus },
                { id: "set", label: "Set Exact", icon: Icons.edit },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as "add" | "remove" | "set")}
                  className={`chip ${mode === m.id ? "active" : ""}`}
                  style={{ flex: 1, justifyContent: "center", gap: 6 }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity input */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 500 }}>
              {mode === "set" ? "New Quantity" : "Quantity"}
            </label>
            <input
            aria-label="quantity"
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                fontSize: 24,
                fontWeight: 600,
                textAlign: "center",
                padding: "16px"
              }}
              min={0}
            />
          </div>

          {/* Preview */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            background: newStock < 10 ? "var(--warning-light)" : "var(--success-light)",
            borderRadius: 12,
          }}>
            <span style={{ fontWeight: 500 }}>New Stock Level</span>
            <span style={{
              fontSize: 24,
              fontWeight: 700,
              color: newStock < 10 ? "var(--warning)" : "var(--success)"
            }}>
              {newStock} units
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (adjustment <= 0 && mode !== "set")}
            className="btn btn-primary"
            style={{ minWidth: 140 }}
          >
            {loading ? <span className="spinner" /> : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
