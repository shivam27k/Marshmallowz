"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { Icons } from "./Icons";

interface QuickSaleModalProps {
  product: Product;
  onClose: () => void;
  onSale: (productId: number, quantity: number, platform: string) => Promise<void>;
}

const platforms = [
  { id: "stall", label: "Stall", color: "badge-primary" },
  { id: "amazon", label: "Amazon", color: "badge-warning" },
  { id: "meesho", label: "Meesho", color: "badge-success" },
  { id: "flipkart", label: "Flipkart", color: "badge-primary" },
  { id: "instagram", label: "Instagram", color: "badge-danger" },
];

export default function QuickSaleModal({ product, onClose, onSale }: QuickSaleModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [platform, setPlatform] = useState("stall");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (quantity <= 0) {
      setError("Quantity must be at least 1");
      return;
    }
    if (quantity > product.quantity_in_hand) {
      setError(`Only ${product.quantity_in_hand} in stock`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSale(product.id, quantity, platform);
      onClose();
    } catch {
      setError("Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  const increment = () => setQuantity((q) => Math.min(q + 1, product.quantity_in_hand));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Record Sale</h2>
            <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
              {product.description}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon-sm">
            {Icons.close}
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              padding: "12px 16px",
              background: "var(--danger-light)",
              color: "var(--danger)",
              borderRadius: 12,
              marginBottom: 20,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          {/* Stock info */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--muted-light)",
            borderRadius: 12,
            marginBottom: 24
          }}>
            <span style={{ color: "var(--muted)" }}>Available Stock</span>
            <span style={{ fontWeight: 600 }}>{product.quantity_in_hand} units</span>
          </div>

          {/* Quantity selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 500 }}>
              Quantity
            </label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <button
                onClick={decrement}
                disabled={quantity <= 1}
                className="quick-action"
                style={{ opacity: quantity <= 1 ? 0.5 : 1 }}
              >
                {Icons.minus}
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.quantity_in_hand)))}
                style={{
                  width: 100,
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  padding: "12px 16px"
                }}
              />
              <button
                onClick={increment}
                disabled={quantity >= product.quantity_in_hand}
                className="quick-action"
                style={{ opacity: quantity >= product.quantity_in_hand ? 0.5 : 1 }}
              >
                {Icons.plus}
              </button>
            </div>
          </div>

          {/* Platform selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 500 }}>
              Platform
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`chip ${platform === p.id ? "active" : ""}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            background: "var(--primary-light)",
            borderRadius: 12,
          }}>
            <span style={{ fontWeight: 500 }}>Total Amount</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>
              Rs. {(product.selling_price * quantity).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary"
            style={{ minWidth: 140 }}
          >
            {loading ? <span className="spinner" /> : "Confirm Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
