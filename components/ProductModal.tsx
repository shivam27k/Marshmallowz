"use client";

import { useState, useEffect } from "react";
import { Product, ProductInput } from "@/lib/types";
import { Icons } from "./Icons";

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: ProductInput) => Promise<void>;
  existingCategories?: string[];
}

const emptyProduct: ProductInput = {
  sno: 0,
  category: "",
  description: "",
  quantity_in_hand: 0,
  cost: 0,
  extra_expenses: 8,
  advertisement: 0,
  packaging: 10,
  shipment: 80,
  gst: 0,
  return_rate: 0,
  margin: 0,
  amazon_commission: 0,
  meesho_commission: 0,
  flipkart_commission: 0,
  instagram_commission: 0,
  selling_price: 0,
  sp_at_stall: 0,
  stall_margin: 0,
  actual_selling_price: 0,
};

const defaultCategories = [
  { id: "Bows", icon: "🎀" },
  { id: "Rubber Bands & Hair Ties", icon: "💫" },
  { id: "Hair Clips", icon: "📎" },
  { id: "Clutchers", icon: "🦋" },
  { id: "Other Accessories", icon: "✨" },
];

const categoryIcons: Record<string, string> = {
  "Bows": "🎀",
  "Rubber Bands & Hair Ties": "💫",
  "Hair Clips": "📎",
  "Clutchers": "🦋",
  "Other Accessories": "✨",
};

type TabType = "basic" | "pricing" | "commission";

const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
  { id: "basic", label: "Basic", icon: Icons.box },
  { id: "pricing", label: "Pricing", icon: Icons.dollar },
  { id: "commission", label: "Platforms", icon: Icons.shoppingBag },
];

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  required?: boolean;
  prefix?: string;
  suffix?: string;
}

function InputField({ label, value, onChange, type = "text", placeholder, required, prefix, suffix }: InputFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--muted)",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            fontSize: 15
          }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          step={type === "number" ? "0.01" : undefined}
          style={{
            paddingLeft: prefix ? 40 : 14,
            paddingRight: suffix ? 40 : 14,
          }}
        />
        {suffix && (
          <span style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            fontSize: 14
          }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProductModal({ product, onClose, onSave, existingCategories = [] }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductInput>(emptyProduct);
  const [loading, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Merge default categories with any new ones from the database
  const allCategories = [
    ...defaultCategories,
    ...existingCategories
      .filter(cat => !defaultCategories.some(dc => dc.id === cat))
      .map(cat => ({ id: cat, icon: categoryIcons[cat] || "📦" }))
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        sno: product.sno,
        category: product.category,
        description: product.description,
        quantity_in_hand: product.quantity_in_hand,
        cost: product.cost,
        extra_expenses: product.extra_expenses,
        advertisement: product.advertisement,
        packaging: product.packaging,
        shipment: product.shipment,
        gst: product.gst,
        return_rate: product.return_rate,
        margin: product.margin,
        amazon_commission: product.amazon_commission,
        meesho_commission: product.meesho_commission,
        flipkart_commission: product.flipkart_commission,
        instagram_commission: product.instagram_commission,
        selling_price: product.selling_price,
        sp_at_stall: product.sp_at_stall,
        stall_margin: product.stall_margin,
        actual_selling_price: product.actual_selling_price,
      });
    }
  }, [product]);

  const handleChange = (field: keyof ProductInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        {/* Header */}
        <div style={{
          padding: "24px 24px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {product ? "Edit Product" : "New Product"}
            </h2>
            {product && (
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                #{product.sno} • {product.category}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ marginRight: -8 }}
          >
            {Icons.close}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: 4,
            padding: "12px 24px",
            background: "var(--muted-light)",
            borderBottom: "1px solid var(--border)"
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  background: activeTab === tab.id ? "var(--card)" : "transparent",
                  color: activeTab === tab.id ? "var(--primary)" : "var(--muted)",
                  boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <span style={{ display: "flex", width: 18, height: 18 }}>{tab.icon}</span>
                <span className="hide-mobile">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: 24, minHeight: 320 }}>
            {activeTab === "basic" && (
              <div>
                <InputField
                  label="Product Name"
                  value={formData.description}
                  onChange={(v) => handleChange("description", v)}
                  placeholder="Enter product name"
                  required
                />

                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--muted)",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Category
                  </label>

                  {showNewCategory ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        autoFocus
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryName.trim()) {
                            handleChange("category", newCategoryName.trim());
                            setShowNewCategory(false);
                            setNewCategoryName("");
                          }
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName("");
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {allCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleChange("category", cat.id)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: formData.category === cat.id
                              ? "2px solid var(--primary)"
                              : "1px solid var(--border)",
                            background: formData.category === cat.id
                              ? "var(--primary-light)"
                              : "var(--card)",
                            color: formData.category === cat.id
                              ? "var(--primary)"
                              : "var(--foreground)",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span>{cat.icon}</span>
                          <span style={{ whiteSpace: "nowrap" }}>{cat.id.split(" ")[0]}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowNewCategory(true)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 10,
                          border: "2px dashed var(--border)",
                          background: "transparent",
                          color: "var(--muted)",
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>+</span>
                        <span>New</span>
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField
                    label="S.No"
                    type="number"
                    value={formData.sno}
                    onChange={(v) => handleChange("sno", v)}
                    prefix="#"
                  />
                  <InputField
                    label="Stock Quantity"
                    type="number"
                    value={formData.quantity_in_hand}
                    onChange={(v) => handleChange("quantity_in_hand", v)}
                    suffix="units"
                  />
                </div>

                <InputField
                  label="Cost per Unit"
                  type="number"
                  value={formData.cost}
                  onChange={(v) => handleChange("cost", v)}
                  prefix="Rs."
                />
              </div>
            )}

            {activeTab === "pricing" && (
              <div>
                <div style={{
                  background: "var(--primary-light)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontWeight: 500 }}>Selling Price</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>
                    Rs. {formData.selling_price}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <InputField
                    label="Extra Expenses"
                    type="number"
                    value={formData.extra_expenses}
                    onChange={(v) => handleChange("extra_expenses", v)}
                    prefix="Rs."
                  />
                  <InputField
                    label="Advertisement"
                    type="number"
                    value={formData.advertisement}
                    onChange={(v) => handleChange("advertisement", v)}
                    prefix="Rs."
                  />
                  <InputField
                    label="Packaging"
                    type="number"
                    value={formData.packaging}
                    onChange={(v) => handleChange("packaging", v)}
                    prefix="Rs."
                  />
                  <InputField
                    label="Shipment"
                    type="number"
                    value={formData.shipment}
                    onChange={(v) => handleChange("shipment", v)}
                    prefix="Rs."
                  />
                  <InputField
                    label="GST"
                    type="number"
                    value={formData.gst}
                    onChange={(v) => handleChange("gst", v)}
                    prefix="Rs."
                  />
                  <InputField
                    label="Return Rate"
                    type="number"
                    value={formData.return_rate}
                    onChange={(v) => handleChange("return_rate", v)}
                    prefix="Rs."
                  />
                  <InputField
                    label="Margin"
                    type="number"
                    value={formData.margin}
                    onChange={(v) => handleChange("margin", v)}
                    suffix="%"
                  />
                  <InputField
                    label="Selling Price"
                    type="number"
                    value={formData.selling_price}
                    onChange={(v) => handleChange("selling_price", v)}
                    prefix="Rs."
                  />
                </div>

                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: "var(--muted-light)",
                  borderRadius: 12,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Stall Pricing
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <InputField
                      label="SP at Stall"
                      type="number"
                      value={formData.sp_at_stall}
                      onChange={(v) => handleChange("sp_at_stall", v)}
                      prefix="Rs."
                    />
                    <InputField
                      label="Stall Margin"
                      type="number"
                      value={formData.stall_margin}
                      onChange={(v) => handleChange("stall_margin", v)}
                      prefix="Rs."
                    />
                    <InputField
                      label="Actual Price"
                      type="number"
                      value={formData.actual_selling_price}
                      onChange={(v) => handleChange("actual_selling_price", v)}
                      prefix="Rs."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "commission" && (
              <div>
                <p style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  marginBottom: 20,
                  lineHeight: 1.5
                }}>
                  Set commission rates for each selling platform.
                </p>

                {[
                  { key: "amazon_commission", name: "Amazon", color: "#FF9900", rate: "14%" },
                  { key: "flipkart_commission", name: "Flipkart", color: "#2874F0", rate: "20%" },
                  { key: "meesho_commission", name: "Meesho", color: "#F43397", rate: "0%" },
                  { key: "instagram_commission", name: "Instagram", color: "#E4405F", rate: "0%" },
                ].map((platform) => (
                  <div
                    key={platform.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: platform.color + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 16,
                        color: platform.color,
                      }}>
                        {platform.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{platform.name}</p>
                        <p style={{ fontSize: 13, color: "var(--muted)" }}>
                          Default: {platform.rate}
                        </p>
                      </div>
                    </div>
                    <div style={{ width: 100 }}>
                      <input
                        type="number"
                        step="0.01"
                        value={formData[platform.key as keyof ProductInput]}
                        onChange={(e) => handleChange(platform.key as keyof ProductInput, e.target.value)}
                        style={{
                          textAlign: "center",
                          padding: "10px",
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 24px 24px",
            display: "flex",
            gap: 12,
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  {Icons.check}
                  {product ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
