// src/pages/AdminDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import {
  Package, ShoppingBag, Users, BarChart3,
  Plus, Edit2, Trash2, Save, X, Search,
  TrendingUp, IndianRupee, Eye, CheckCircle,
  Clock, XCircle, Truck, RefreshCw, ChevronDown,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
}

interface Order {
  id: number;
  created_at: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  total_amount: number;
  status: string;
  items: any[];
  user_id: string;
}

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: { name?: string; role?: string };
}

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const CATEGORIES = ["Shirt", "T-Shirts", "Jeans", "Kurta", "Denim Jackets", "Coats", "Belts"];

const STATUS_OPTIONS = [
  { value: "awaiting_payment", label: "Pending",    color: "#ea580c" },
  { value: "COD",              label: "COD",         color: "#d97706" },
  { value: "paid",             label: "Paid",        color: "#16a34a" },
  { value: "processing",      label: "Processing",  color: "#2563eb" },
  { value: "shipped",         label: "Shipped",     color: "#7c3aed" },
  { value: "delivered",       label: "Delivered",   color: "#059669" },
  { value: "cancelled",       label: "Cancelled",   color: "#dc2626" },
];

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "", price: 0, description: "", category: "Shirt", stock: 0,
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
const getStatusColor = (s: string) =>
  STATUS_OPTIONS.find(o => o.value === s)?.color || "#6b7280";
const getStatusLabel = (s: string) =>
  STATUS_OPTIONS.find(o => o.value === s)?.label || s;
const fmt = (n: number) => `₹${n?.toLocaleString("en-IN") || 0}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const bg     = isDark ? "#0b0d16" : "#f4f6ff";
  const card   = isDark ? "#141722" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)";
  const tPri   = isDark ? "#f1f5f9" : "#0f172a";
  const tSec   = isDark ? "rgba(255,255,255,.45)" : "rgba(15,23,42,.5)";

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products",  label: "Products",  icon: Package },
    { id: "orders",    label: "Orders",    icon: ShoppingBag },
    { id: "users",     label: "Users",     icon: Users },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column" }}>

      {/* ── TOP NAV ── */}
      <div style={{
        background: isDark ? "#141722" : "#1e3a8a",
        padding: "0 clamp(16px,3vw,32px)",
        display: "flex", alignItems: "center", gap: "8px",
        borderBottom: `1px solid ${border}`,
        overflowX: "auto",
      }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: "15px", letterSpacing: "0.04em", marginRight: "16px", whiteSpace: "nowrap" }}>
          ⚡ X ONE ADMIN
        </span>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "14px 16px",
                borderBottom: active ? "2px solid #60a5fa" : "2px solid transparent",
                color: active ? "#60a5fa" : "rgba(255,255,255,.55)",
                fontWeight: active ? 700 : 500, fontSize: "13px",
                background: "none", border: "none", cursor: "pointer",
                whiteSpace: "nowrap", transition: "color .2s",
              }}>
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, padding: "clamp(16px,3vw,28px) clamp(16px,3vw,32px)" }}>
        {tab === "dashboard" && <DashboardTab card={card} border={border} tPri={tPri} tSec={tSec} isDark={isDark} />}
        {tab === "products"  && <ProductsTab  card={card} border={border} tPri={tPri} tSec={tSec} isDark={isDark} />}
        {tab === "orders"    && <OrdersTab    card={card} border={border} tPri={tPri} tSec={tSec} isDark={isDark} />}
        {tab === "users"     && <UsersTab     card={card} border={border} tPri={tPri} tSec={tSec} isDark={isDark} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD TAB
// ══════════════════════════════════════════════════════════════
function DashboardTab({ card, border, tPri, tSec, isDark }: any) {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        supabase.from("orders").select("total_amount, status, created_at, full_name, id").order("created_at", { ascending: false }),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((s: number, o: any) => s + (o.total_amount || 0), 0);

      setStats({
        orders: orders.length,
        revenue,
        products: productsRes.count || 0,
        users: usersRes.count || 0,
      });
      setRecentOrders(orders.slice(0, 6) as Order[]);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: "Total Revenue",  value: fmt(stats.revenue),   icon: "💰", color: "#16a34a" },
    { label: "Total Orders",   value: stats.orders,          icon: "📦", color: "#2563eb" },
    { label: "Products",       value: stats.products,        icon: "🛍️", color: "#7c3aed" },
    { label: "Users",          value: stats.users,           icon: "👥", color: "#ea580c" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 900, color: tPri, marginBottom: "20px" }}>Dashboard Overview</h1>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: card, border: `1px solid ${border}`,
            borderRadius: "16px", padding: "18px 20px",
            boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,.05)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "11px", color: tSec, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{s.label}</p>
                <p style={{ fontSize: "26px", fontWeight: 900, color: tPri, lineHeight: 1 }}>{loading ? "—" : s.value}</p>
              </div>
              <span style={{ fontSize: "28px" }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: "14px", fontWeight: 800, color: tPri }}>Recent Orders</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: isDark ? "rgba(255,255,255,.03)" : "#f8faff" }}>
                {["Order ID", "Customer", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} style={{ borderTop: `1px solid ${border}` }}>
                  <td style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>#{o.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: tPri, fontWeight: 600 }}>{(o as any).full_name || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 800, color: tPri }}>{fmt((o as any).total_amount)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "100px",
                      fontSize: "11px", fontWeight: 700,
                      background: `${getStatusColor((o as any).status)}22`,
                      color: getStatusColor((o as any).status),
                    }}>
                      {getStatusLabel((o as any).status)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: tSec }}>{fmtDate((o as any).created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && recentOrders.length === 0 && (
            <p style={{ textAlign: "center", padding: "32px", color: tSec, fontSize: "14px" }}>No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PRODUCTS TAB
// ══════════════════════════════════════════════════════════════
function ProductsTab({ card, border, tPri, tSec, isDark }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Product | null>(null);
  const [form,     setForm]     = useState<Omit<Product, "id">>(EMPTY_PRODUCT);
  const [saving,   setSaving]   = useState(false);

  const inp = {
    width: "100%", padding: "10px 14px",
    borderRadius: "10px", fontSize: "13px",
    background: isDark ? "rgba(255,255,255,.06)" : "#f1f5f9",
    border: `1px solid ${border}`, color: tPri,
    fontFamily: "inherit", outline: "none",
    boxSizing: "border-box" as const,
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    setProducts((data || []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, description: p.description, category: p.category, stock: p.stock });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.price)       return toast.error("Price required");
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from("products").update(form).eq("id", editing.id);
        if (error) throw error;
        toast.success("Product updated! ✅");
      } else {
        const { error } = await supabase.from("products").insert([form]);
        if (error) throw error;
        toast.success("Product added! ✅");
      }
      setShowForm(false);
      fetchProducts();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted!");
    fetchProducts();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 900, color: tPri }}>Products</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: tSec }} />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, paddingLeft: "30px", width: "200px" }} />
          </div>
          <button onClick={openAdd}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 16px", borderRadius: "10px",
              background: "#2563eb", color: "#fff",
              fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer",
            }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowForm(false)} />
          <div style={{
            position: "relative", width: "100%", maxWidth: "500px",
            background: isDark ? "#141722" : "#fff",
            borderRadius: "20px", padding: "24px", zIndex: 1,
            boxShadow: "0 24px 64px rgba(0,0,0,.4)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: tPri }}>{editing ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: tSec }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: tSec, display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Product Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="e.g. Premium Blue Shirt" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: tSec, display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} style={inp} placeholder="499" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: tSec, display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))} style={inp} placeholder="50" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: tSec, display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ ...inp, cursor: "pointer" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: tSec, display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ ...inp, height: "80px", resize: "vertical" }} placeholder="Product description..." />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleSave} disabled={saving}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px",
                  background: "#2563eb", color: "#fff",
                  fontWeight: 700, fontSize: "14px", border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}>
                {saving ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                {editing ? "Update Product" : "Add Product"}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding: "12px 20px", borderRadius: "12px", background: "none", border: `1px solid ${border}`, color: tSec, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: isDark ? "rgba(255,255,255,.03)" : "#f8faff" }}>
                {["ID", "Name", "Category", "Price", "Stock", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: tSec }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: tSec }}>No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${border}` }}>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: tSec }}>#{p.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: tPri, maxWidth: "200px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, background: "rgba(37,99,235,.1)", color: "#2563eb" }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 800, color: tPri }}>{fmt(p.price)}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: p.stock < 10 ? "#ef4444" : "#16a34a", fontWeight: 700 }}>{p.stock}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => openEdit(p)}
                        style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(37,99,235,.1)", color: "#2563eb", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Edit2 size={11} /> Edit
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(239,68,68,.1)", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${border}`, fontSize: "12px", color: tSec }}>
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ORDERS TAB
// ══════════════════════════════════════════════════════════════
function OrdersTab({ card, border, tPri, tSec, isDark }: any) {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data || []) as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated! ✅");
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 900, color: tPri }}>Orders</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: tSec }} />
            <input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
              style={{
                padding: "10px 14px 10px 30px", borderRadius: "10px", fontSize: "13px",
                background: isDark ? "rgba(255,255,255,.06)" : "#f1f5f9",
                border: `1px solid ${border}`, color: tPri, outline: "none", width: "180px",
              }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: "10px", fontSize: "13px",
              background: isDark ? "rgba(255,255,255,.06)" : "#f1f5f9",
              border: `1px solid ${border}`, color: tPri, outline: "none", cursor: "pointer",
            }}>
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: tSec }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: tSec }}>No orders found</div>
        ) : filtered.map(order => (
          <div key={order.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>

            {/* Order Row */}
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", minWidth: "60px" }}>#{order.id}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: tPri, flex: 1, minWidth: "120px" }}>{order.full_name}</span>
              <span style={{ fontSize: "14px", fontWeight: 900, color: tPri }}>{fmt(order.total_amount)}</span>

              {/* Status dropdown */}
              <select
                value={order.status}
                onChange={e => updateStatus(order.id, e.target.value)}
                style={{
                  padding: "5px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                  background: `${getStatusColor(order.status)}22`,
                  border: `1px solid ${getStatusColor(order.status)}44`,
                  color: getStatusColor(order.status), cursor: "pointer", outline: "none",
                }}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              <span style={{ fontSize: "11px", color: tSec, whiteSpace: "nowrap" }}>{fmtDate(order.created_at)}</span>

              <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: tSec, display: "flex", alignItems: "center" }}>
                <ChevronDown size={16} style={{ transform: expanded === order.id ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
            </div>

            {/* Expanded details */}
            {expanded === order.id && (
              <div style={{ borderTop: `1px solid ${border}`, padding: "14px 18px", background: isDark ? "rgba(255,255,255,.02)" : "#fafbff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: tSec, textTransform: "uppercase", marginBottom: "4px" }}>Address</p>
                    <p style={{ fontSize: "13px", color: tPri }}>{order.address}, {order.city} - {order.pincode}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: tSec, textTransform: "uppercase", marginBottom: "4px" }}>Phone</p>
                    <p style={{ fontSize: "13px", color: tPri }}>{order.phone}</p>
                  </div>
                </div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: tSec, textTransform: "uppercase", marginBottom: "8px" }}>Items</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: tPri }}>
                      <span>{item.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 700 }}>{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  USERS TAB
// ══════════════════════════════════════════════════════════════
function UsersTab({ card, border, tPri, tSec, isDark }: any) {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 900, color: tPri }}>Users ({users.length})</h1>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: tSec }} />
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            style={{
              padding: "10px 14px 10px 30px", borderRadius: "10px", fontSize: "13px",
              background: isDark ? "rgba(255,255,255,.06)" : "#f1f5f9",
              border: `1px solid ${border}`, color: tPri, outline: "none", width: "200px",
            }} />
        </div>
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: isDark ? "rgba(255,255,255,.03)" : "#f8faff" }}>
                {["Avatar", "Name", "Email", "Role", "Joined"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: tSec }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: tSec }}>No users found</td></tr>
              ) : filtered.map((u: any) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${border}` }}>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%",
                      background: "linear-gradient(135deg,#60a5fa,#818cf8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: 900, color: "#fff",
                    }}>
                      {(u.name || u.email || "U").charAt(0).toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, color: tPri }}>{u.name || "—"}</td>
                  <td style={{ padding: "10px 16px", fontSize: "13px", color: tSec }}>{u.email || "—"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
                      background: u.role === "admin" ? "rgba(239,68,68,.1)" : "rgba(37,99,235,.1)",
                      color: u.role === "admin" ? "#ef4444" : "#2563eb",
                    }}>
                      {u.role || "user"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: "12px", color: tSec }}>{u.created_at ? fmtDate(u.created_at) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}