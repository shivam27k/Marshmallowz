"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductInput } from "@/lib/types";
import { Icons } from "@/components/Icons";
import ProductModal from "@/components/ProductModal";
import QuickSaleModal from "@/components/QuickSaleModal";
import StockUpdateModal from "@/components/StockUpdateModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface Stats {
  products: {
    total_products: number;
    total_items: number;
    inventory_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  today: { items_sold: number; revenue: number };
  week: { items_sold: number; revenue: number };
  lowStock: Product[];
  recentSales: Array<{
    id: number;
    product_name: string;
    category: string;
    quantity: number;
    total_price: number;
    platform: string;
    created_at: string;
  }>;
  topSelling: Array<{ id: number; description: string; category: string; total_sold: number }>;
}

type View = "home" | "products" | "sales";

export default function DashboardPage() {
  const [view, setView] = useState<View>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [username, setUsername] = useState("");

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/products?${params}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUsername(data.username);
    } catch {
      router.push("/login");
    }
  };

  useEffect(() => {
    checkAuth();
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleSaveProduct = async (productData: ProductInput) => {
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (!res.ok) throw new Error("Failed to save");

    fetchProducts();
    fetchStats();
    fetchCategories();
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleSale = async (productId: number, quantity: number, platform: string) => {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity, platform }),
    });

    if (!res.ok) throw new Error("Failed to record sale");

    fetchProducts();
    fetchStats();
  };

  const handleStockUpdate = async (productId: number, adjustment: number, type: "add" | "remove" | "set") => {
    const res = await fetch(`/api/products/${productId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adjustment, type }),
    });

    if (!res.ok) throw new Error("Failed to update stock");

    fetchProducts();
    fetchStats();
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      fetchProducts();
      fetchStats();
      fetchCategories();
      setDeletingProduct(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: "Out of Stock", class: "badge-danger" };
    if (qty < 10) return { label: "Low Stock", class: "badge-warning" };
    return { label: "In Stock", class: "badge-success" };
  };

  // Home View
  const renderHome = () => (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 16,
        marginBottom: 32
      }}>
        <div className="stat-card">
          <div className="icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            {Icons.box}
          </div>
          <div className="value">{stats?.products?.total_products || 0}</div>
          <div className="label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            {Icons.package}
          </div>
          <div className="value">{stats?.products?.total_items?.toLocaleString() || 0}</div>
          <div className="label">Items in Stock</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
            {Icons.dollar}
          </div>
          <div className="value">Rs. {Math.round(stats?.products?.inventory_value || 0).toLocaleString()}</div>
          <div className="label">Inventory Value</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>
            {Icons.alertCircle}
          </div>
          <div className="value">{stats?.products?.low_stock_count || 0}</div>
          <div className="label">Low Stock Items</div>
        </div>
      </div>

      {/* Today's Performance */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Today&apos;s Performance</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div className="card" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)", color: "white", border: "none" }}>
            <p style={{ opacity: 0.9, marginBottom: 8 }}>Items Sold Today</p>
            <p style={{ fontSize: 32, fontWeight: 700 }}>{stats?.today?.items_sold || 0}</p>
          </div>
          <div className="card" style={{ background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)", color: "white", border: "none" }}>
            <p style={{ opacity: 0.9, marginBottom: 8 }}>Revenue Today</p>
            <p style={{ fontSize: 32, fontWeight: 700 }}>Rs. {Math.round(stats?.today?.revenue || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStock && stats.lowStock.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--warning)" }}>{Icons.warning}</span>
            Low Stock Alert
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {stats.lowStock.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="card card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  cursor: "pointer"
                }}
                onClick={() => setStockProduct(product as Product)}
              >
                <div>
                  <p style={{ fontWeight: 500 }}>{product.description}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>{product.category}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className={`badge ${product.quantity_in_hand === 0 ? "badge-danger" : "badge-warning"}`}>
                    {product.quantity_in_hand} left
                  </span>
                  <button className="btn btn-secondary btn-sm">Restock</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      {stats?.recentSales && stats.recentSales.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Icons.clock}
            Recent Sales
          </h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {stats.recentSales.map((sale, i) => (
              <div
                key={sale.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: i < stats.recentSales.length - 1 ? "1px solid var(--border)" : "none"
                }}
              >
                <div>
                  <p style={{ fontWeight: 500 }}>{sale.product_name}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>
                    {sale.quantity}x via {sale.platform}
                  </p>
                </div>
                <span style={{ fontWeight: 600, color: "var(--success)" }}>
                  +Rs. {Math.round(sale.total_price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Products View
  const renderProducts = () => (
    <div style={{ padding: "20px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Search & Filters */}
      <div style={{ marginBottom: 24 }}>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          {Icons.search}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          <button
            className={`chip ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          {Icons.box}
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16
        }}>
          {products.map((product) => {
            const status = getStockStatus(product.quantity_in_hand);
            return (
              <div
                key={product.id}
                className={`product-card ${product.quantity_in_hand === 0 ? "out-of-stock" : product.quantity_in_hand < 10 ? "low-stock" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <span className="badge badge-muted" style={{ marginBottom: 8 }}>
                      {product.category}
                    </span>
                    <h3 style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>
                      {product.description}
                    </h3>
                  </div>
                  <span className={`badge ${status.class}`}>{status.label}</span>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Stock</p>
                    <p style={{ fontSize: 18, fontWeight: 700 }}>{product.quantity_in_hand}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Price</p>
                    <p style={{ fontSize: 18, fontWeight: 700 }}>Rs. {product.selling_price}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setSaleProduct(product)}
                    disabled={product.quantity_in_hand === 0}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    {Icons.cart}
                    Sell
                  </button>
                  <button
                    onClick={() => setStockProduct(product)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    {Icons.package}
                    Stock
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowProductModal(true);
                    }}
                    className="btn btn-ghost btn-icon-sm"
                    title="Edit"
                  >
                    {Icons.edit}
                  </button>
                  <button
                    onClick={() => setDeletingProduct(product)}
                    className="btn btn-ghost btn-icon-sm"
                    style={{ color: "var(--danger)" }}
                    title="Delete"
                  >
                    {Icons.trash}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Sales View
  const renderSales = () => (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Weekly Stats */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>This Week</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div className="stat-card">
            <div className="icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              {Icons.shoppingBag}
            </div>
            <div className="value">{stats?.week?.items_sold || 0}</div>
            <div className="label">Items Sold</div>
          </div>
          <div className="stat-card">
            <div className="icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
              {Icons.trending}
            </div>
            <div className="value">Rs. {Math.round(stats?.week?.revenue || 0).toLocaleString()}</div>
            <div className="label">Revenue</div>
          </div>
        </div>
      </div>

      {/* Top Selling */}
      {stats?.topSelling && stats.topSelling.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Top Selling Products</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {stats.topSelling.map((product, i) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: i < stats.topSelling.length - 1 ? "1px solid var(--border)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: i === 0 ? "var(--warning)" : "var(--muted-light)",
                    color: i === 0 ? "white" : "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <p style={{ fontWeight: 500 }}>{product.description}</p>
                    <p style={{ fontSize: 13, color: "var(--muted)" }}>{product.category}</p>
                  </div>
                </div>
                <span className="badge badge-success">{product.total_sold} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Sales</h2>
        {stats?.recentSales && stats.recentSales.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {stats.recentSales.map((sale, i) => (
              <div
                key={sale.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: i < stats.recentSales.length - 1 ? "1px solid var(--border)" : "none"
                }}
              >
                <div>
                  <p style={{ fontWeight: 500 }}>{sale.product_name}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>
                    {sale.quantity}x via {sale.platform} • {new Date(sale.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ fontWeight: 600, color: "var(--success)" }}>
                  Rs. {Math.round(sale.total_price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {Icons.shoppingBag}
            <h3>No sales yet</h3>
            <p>Start recording sales from the Products tab</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Header */}
      <header style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 30
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Marshmallowz</h1>

          {/* Desktop Nav */}
          <nav className="hide-mobile" style={{ display: "flex", gap: 8 }}>
            {[
              { id: "home", label: "Home", icon: Icons.home },
              { id: "products", label: "Products", icon: Icons.box },
              { id: "sales", label: "Sales", icon: Icons.chart },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={`btn ${view === item.id ? "btn-primary" : "btn-ghost"} btn-sm`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
              className="btn btn-primary btn-sm"
            >
              {Icons.plus}
              <span className="hide-mobile">Add Product</span>
            </button>
            <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>Hi, {username}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-icon-sm">
                {Icons.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {view === "home" && renderHome()}
        {view === "products" && renderProducts()}
        {view === "sales" && renderSales()}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {[
          { id: "home", label: "Home", icon: Icons.home },
          { id: "products", label: "Products", icon: Icons.box },
          { id: "sales", label: "Sales", icon: Icons.chart },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`nav-item ${view === item.id ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={handleLogout} className="nav-item">
          {Icons.logout}
          <span>Logout</span>
        </button>
      </nav>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          existingCategories={categories}
        />
      )}

      {saleProduct && (
        <QuickSaleModal
          product={saleProduct}
          onClose={() => setSaleProduct(null)}
          onSale={handleSale}
        />
      )}

      {stockProduct && (
        <StockUpdateModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
          onUpdate={handleStockUpdate}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmModal
          productName={deletingProduct.description}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
