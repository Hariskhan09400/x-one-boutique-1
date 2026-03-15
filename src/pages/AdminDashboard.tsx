// src/pages/AdminDashboard.tsx
// ══════════════════════════════════════════════════════════════
//  X ONE BOUTIQUE — Admin Dashboard
//  Products Tab: Add / Edit / Delete from Supabase DB
//  Local products.ts also shown (read-only, can't delete from DB)
//  Image: URL paste + multiple images support
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

// ── DB Product type
interface DBProduct {
  id:              number | string;
  name:            string;
  price:           number;
  original_price?: number;
  description:     string;
  category:        string;
  stock:           number;
  images:          string[];
  in_stock:        boolean;
  created_at?:     string;
}

// ── Fetch DB products hook (inline — no separate file needed)
function useProducts() {
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [loading,    setLoading]    = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    setDbProducts((data as DBProduct[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { dbProducts, loading, refetch };
}

// ── CRUD helpers
const productApi = {
  async add(data: Omit<DBProduct, "id" | "created_at">) {
    const { error } = await supabase.from("products").insert([{
      name:           data.name,
      price:          data.price,
      original_price: data.original_price || null,
      description:    data.description,
      category:       data.category,
      stock:          data.stock ?? 0,
      images:         data.images || [],
      in_stock:       data.in_stock ?? true,
    }]);
    return { error: error?.message ?? null };
  },
  async update(id: number, data: Partial<DBProduct>) {
    const { error } = await supabase.from("products").update({
      name:           data.name,
      price:          data.price,
      original_price: data.original_price || null,
      description:    data.description,
      category:       data.category,
      stock:          data.stock,
      images:         data.images || [],
      in_stock:       data.in_stock,
    }).eq("id", id);
    return { error: error?.message ?? null };
  },
  async delete(id: number) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    return { error: error?.message ?? null };
  },
};

// ── Categories
const CATEGORIES = [
  "T-Shirts", "Shirts", "Jeans", "Denim Jackets",
  "Belts", "Kurta", "jubba", "Coats",
];

// ── Empty form
const EMPTY_FORM = {
  name: "", price: "", original_price: "",
  description: "", category: "T-Shirts",
  stock: "0", images: ["", "", ""],
  in_stock: true,
};

type Tab = "orders" | "products" | "users";

// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [isDark, setIsDark] = useState(false);

  // Dark mode observer
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const bg     = isDark ? "#06080f"  : "#f0f2fa";
  const card   = isDark ? "#0d1120"  : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const tPri   = isDark ? "#f0f4ff"  : "#0b1120";
  const tSec   = isDark ? "rgba(240,244,255,.45)" : "rgba(11,17,32,.45)";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans','Montserrat',sans-serif" }}>
      <style>{`
        .xad * { box-sizing: border-box; }
        .xad-btn { transition: all .18s ease; cursor: pointer; }
        .xad-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .xad-btn:active { transform: scale(.97); }
        .xad-inp:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.12) !important; }
        .xad-inp { transition: border-color .18s, box-shadow .18s; }
        .xad-row { transition: background .15s ease; }
        .xad-row:hover { background: rgba(37,99,235,.04) !important; }
        @keyframes xad-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .xad-anim { animation: xad-in .3s ease both; }
        @media(max-width:640px) {
          .xad-grid { grid-template-columns: 1fr !important; }
          .xad-stat-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div className="xad" style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(16px,3vw,32px)" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: tPri, letterSpacing: "-0.02em" }}>
              🛍️ Admin Dashboard
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: tSec }}>X One Boutique — Management Panel</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
          {(["products", "orders", "users"] as Tab[]).map(t => (
            <button key={t} className="xad-btn"
              onClick={() => setActiveTab(t)}
              style={{
                padding: "9px 20px", borderRadius: "12px", border: "none",
                fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                background: activeTab === t ? "#2563eb" : (isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"),
                color: activeTab === t ? "#fff" : tSec,
                boxShadow: activeTab === t ? "0 4px 14px rgba(37,99,235,.35)" : "none",
              }}>
              {t === "products" ? "📦 Products" : t === "orders" ? "📋 Orders" : "👥 Users"}
            </button>
          ))}
        </div>

        {/* ── Products Tab ── */}
        {activeTab === "products" && (
          <ProductsTab isDark={isDark} card={card} border={border} tPri={tPri} tSec={tSec} />
        )}

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <OrdersTab isDark={isDark} card={card} border={border} tPri={tPri} tSec={tSec} />
        )}

        {/* ── Users Tab ── */}
        {activeTab === "users" && (
          <UsersTab isDark={isDark} card={card} border={border} tPri={tPri} tSec={tSec} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════
function ProductsTab({ isDark, card, border, tPri, tSec }: any) {
  const { dbProducts, loading, refetch } = useProducts();
  const [showForm,    setShowForm]    = useState(false);
  const [editItem,    setEditItem]    = useState<DBProduct | null>(null);
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [saving,      setSaving]      = useState(false);
  const [deleteId,    setDeleteId]    = useState<number | null>(null);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("All");

  const acc    = "#2563eb";
  const accBg  = isDark ? "rgba(37,99,235,.14)" : "rgba(37,99,235,.08)";
  const inp    = isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)";
  const inpBdr = isDark ? "rgba(255,255,255,.1)"  : "rgba(0,0,0,.12)";

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (p: DBProduct) => {
    setEditItem(p);
    setForm({
      name:           p.name,
      price:          String(p.price),
      original_price: String(p.original_price ?? ""),
      description:    p.description,
      category:       p.category,
      stock:          String(p.stock ?? 0),
      images:         [...(p.images || []), "", "", ""].slice(0, 5),
      in_stock:       p.in_stock ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price required");
      return;
    }
    setSaving(true);
    const payload = {
      name:           form.name.trim(),
      price:          Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : undefined,
      description:    form.description.trim(),
      category:       form.category,
      stock:          Number(form.stock) || 0,
      images:         form.images.filter(u => u.trim() !== ""),
      in_stock:       form.in_stock,
    };

    if (editItem) {
      const { error } = await productApi.update(Number(editItem.id), payload);
      if (error) toast.error("Update failed: " + error);
      else { toast.success("✓ Product updated!"); setShowForm(false); refetch(); }
    } else {
      const { error } = await productApi.add(payload);
      if (error) toast.error("Add failed: " + error);
      else { toast.success("✓ Product added!"); setShowForm(false); refetch(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await productApi.delete(deleteId);
    if (error) toast.error("Delete failed: " + error);
    else { toast.success("Product deleted"); refetch(); }
    setDeleteId(null);
  };

  const setImg = (i: number, val: string) => {
    const imgs = [...form.images];
    while (imgs.length <= i) imgs.push("");
    imgs[i] = val;
    setForm(f => ({ ...f, images: imgs }));
  };

  const addImgSlot = () => {
    if (form.images.length < 7) setForm(f => ({ ...f, images: [...f.images, ""] }));
  };

  // Filtered
  const filtered = dbProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="xad-anim">

      {/* Stats row */}
      <div className="xad-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>
        {[
          { label: "Total DB Products", value: dbProducts.length,                                    color: "#2563eb", icon: "📦" },
          { label: "In Stock",          value: dbProducts.filter(p => p.in_stock).length,             color: "#16a34a", icon: "✅" },
          { label: "Out of Stock",      value: dbProducts.filter(p => !p.in_stock).length,            color: "#dc2626", icon: "❌" },
          { label: "Categories",        value: new Set(dbProducts.map(p => p.category)).size,         color: "#7c3aed", icon: "🏷️" },
        ].map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px" }}>{s.icon}</span>
              <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: tSec, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            </div>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: s.color, fontFamily: "'Barlow Condensed',sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="xad-inp"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "160px", padding: "10px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, color: tPri, background: inp, border: `1.5px solid ${inpBdr}` }}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="xad-inp"
          style={{ padding: "10px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, color: tPri, background: inp, border: `1.5px solid ${inpBdr}`, cursor: "pointer" }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="xad-btn" onClick={openAdd}
          style={{ padding: "10px 20px", borderRadius: "12px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: 800, fontSize: "13px", border: "none", boxShadow: "0 4px 14px rgba(37,99,235,.35)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>
          + Add Product
        </button>
      </div>

      {/* ── ADD / EDIT FORM ── */}
      {showForm && (
        <div style={{ background: card, border: `1.5px solid ${acc}33`, borderRadius: "20px", padding: "clamp(16px,3vw,24px)", marginBottom: "20px", boxShadow: `0 8px 32px rgba(37,99,235,.1)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: tPri }}>
              {editItem ? "✏️ Edit Product" : "➕ Add New Product"}
            </h3>
            <button className="xad-btn" onClick={() => setShowForm(false)}
              style={{ background: "none", border: `1px solid ${border}`, borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 700, color: tSec, cursor: "pointer" }}>
              Cancel
            </button>
          </div>

          <div className="xad-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            {/* Name */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Product Name *</label>
              <input className="xad-inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Classic White Shirt"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: tPri, background: inp, border: `1.5px solid ${inpBdr}` }} />
            </div>

            {/* Price */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Price (₹) *</label>
              <input className="xad-inp" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="799"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: tPri, background: inp, border: `1.5px solid ${inpBdr}` }} />
            </div>

            {/* Original Price */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Original Price (₹) — optional</label>
              <input className="xad-inp" type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                placeholder="1299 (for discount badge)"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: tPri, background: inp, border: `1.5px solid ${inpBdr}` }} />
            </div>

            {/* Category */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Category *</label>
              <select className="xad-inp" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: tPri, background: inp, border: `1.5px solid ${inpBdr}`, cursor: "pointer" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Stock */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Stock</label>
              <input className="xad-inp" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="50"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: tPri, background: inp, border: `1.5px solid ${inpBdr}` }} />
            </div>

            {/* Description */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Description</label>
              <textarea className="xad-inp" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Premium cotton fabric with tailored fit..."
                rows={3}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: tPri, background: inp, border: `1.5px solid ${inpBdr}`, resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {/* Images */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Product Images (URL) — {form.images.filter(u=>u.trim()).length} added
                </label>
                {form.images.length < 7 && (
                  <button className="xad-btn" onClick={addImgSlot}
                    style={{ background: "none", border: `1px solid ${border}`, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: tSec, cursor: "pointer" }}>
                    + Add slot
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {/* Preview */}
                    <div style={{ width: "44px", height: "44px", borderRadius: "9px", overflow: "hidden", flexShrink: 0, background: isDark ? "#111826" : "#eef1f8", border: `1px solid ${border}` }}>
                      {url.trim() ? (
                        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: tSec }}>🖼️</div>
                      )}
                    </div>
                    <input className="xad-inp"
                      value={url}
                      onChange={e => setImg(i, e.target.value)}
                      placeholder={i === 0
                        ? "https://images.unsplash.com/photo-... (main image)"
                        : `Image ${i + 1} URL (optional)`}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 500, color: tPri, background: inp, border: `1.5px solid ${inpBdr}` }}
                    />
                    {i > 0 && (
                      <button className="xad-btn" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                        style={{ background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", color: "#dc2626", cursor: "pointer" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: "11px", color: tSec, marginTop: "8px" }}>
                💡 Tip: Use Unsplash URLs like <code style={{ background: isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.06)", padding: "1px 6px", borderRadius: "4px", fontSize: "10px" }}>https://images.unsplash.com/photo-xxxxx?auto=format&fit=crop&w=800&q=80</code>
              </p>
            </div>

            {/* In Stock toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: tSec }}>In Stock</span>
              <button onClick={() => setForm(f => ({ ...f, in_stock: !f.in_stock }))}
                style={{
                  width: "46px", height: "26px", borderRadius: "13px",
                  background: form.in_stock ? "#16a34a" : "rgba(148,163,184,.25)",
                  border: "none", cursor: "pointer", position: "relative",
                  transition: "background .22s",
                }}>
                <div style={{
                  position: "absolute", width: "20px", height: "20px", borderRadius: "50%",
                  background: "#fff", top: "3px",
                  left: form.in_stock ? "23px" : "3px",
                  transition: "left .22s cubic-bezier(.34,1.56,.64,1)",
                  boxShadow: "0 2px 6px rgba(0,0,0,.2)",
                }} />
              </button>
              <span style={{ fontSize: "11px", color: form.in_stock ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                {form.in_stock ? "Available" : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Save btn */}
          <button className="xad-btn" onClick={handleSave} disabled={saving}
            style={{
              marginTop: "20px", width: "100%", padding: "14px", borderRadius: "14px",
              background: saving ? "rgba(37,99,235,.5)" : "linear-gradient(135deg,#2563eb,#4f46e5)",
              color: "#fff", fontWeight: 800, fontSize: "14px", border: "none",
              boxShadow: saving ? "none" : "0 6px 20px rgba(37,99,235,.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              cursor: saving ? "wait" : "pointer",
            }}>
            {saving ? (
              <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" }} /> Saving...</>
            ) : (
              editItem ? "✓ Save Changes" : "✓ Add Product"
            )}
          </button>
        </div>
      )}

      {/* ── Products Table ── */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: tPri }}>
            Database Products ({filtered.length})
          </h3>
          <span style={{ fontSize: "11px", color: tSec }}>Local products.ts is shown separately below</span>
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: tSec }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(37,99,235,.15)", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 12px", animation: "spin .8s linear infinite" }} />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: "40px", margin: "0 0 10px" }}>📦</p>
            <p style={{ fontWeight: 700, color: tSec, margin: 0 }}>No products found</p>
            <p style={{ fontSize: "12px", color: tSec, marginTop: "6px" }}>Add your first product using the button above</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} className="xad-row"
                    style={{ borderBottom: `1px solid ${border}`, background: "transparent", animation: `xad-in .3s ${idx * 0.04}s both` }}>
                    {/* Image */}
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ width: "48px", height: "56px", borderRadius: "9px", overflow: "hidden", background: isDark ? "#111826" : "#eef1f8" }}>
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x56?text=No+img"; }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👕</div>
                        )}
                      </div>
                    </td>
                    {/* Name */}
                    <td style={{ padding: "10px 16px" }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: tPri, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "10px", color: tSec }}>ID: {p.id}</p>
                    </td>
                    {/* Category */}
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(37,99,235,.08)", color: "#2563eb", padding: "3px 9px", borderRadius: "100px" }}>
                        {p.category}
                      </span>
                    </td>
                    {/* Price */}
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 900, color: "#2563eb" }}>₹{p.price?.toLocaleString("en-IN")}</p>
                      {p.original_price && (
                        <p style={{ margin: 0, fontSize: "10px", color: tSec, textDecoration: "line-through" }}>₹{p.original_price?.toLocaleString("en-IN")}</p>
                      )}
                    </td>
                    {/* Stock */}
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: tPri }}>{p.stock ?? 0}</span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 800, padding: "3px 9px", borderRadius: "100px",
                        background: p.in_stock ? "rgba(22,163,74,.1)" : "rgba(220,38,38,.1)",
                        color: p.in_stock ? "#16a34a" : "#dc2626",
                      }}>
                        {p.in_stock ? "In Stock" : "Out"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="xad-btn" onClick={() => openEdit(p)}
                          style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, background: "rgba(37,99,235,.08)", border: "1px solid rgba(37,99,235,.2)", color: "#2563eb", cursor: "pointer" }}>
                          ✏️ Edit
                        </button>
                        <button className="xad-btn" onClick={() => setDeleteId(Number(p.id))}
                          style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", color: "#dc2626", cursor: "pointer" }}>
                          🗑️ Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Local products info */}
      <div style={{ marginTop: "16px", padding: "14px 18px", borderRadius: "14px", background: isDark ? "rgba(37,99,235,.08)" : "rgba(37,99,235,.05)", border: "1px solid rgba(37,99,235,.15)" }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>
          📁 Local products.ts — {" "}
          <span style={{ fontWeight: 600, color: tSec }}>
            These products come from your code file. To edit them, update <code>src/data/products.ts</code> directly. They cannot be deleted from admin panel.
          </span>
        </p>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={() => setDeleteId(null)}>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "24px", maxWidth: "320px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,.3)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p style={{ fontSize: "40px", margin: "0 0 12px" }}>🗑️</p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: tPri }}>Delete Product?</p>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: tSec }}>This action cannot be undone.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="xad-btn" onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", border: `1px solid ${border}`, background: "transparent", color: tSec, cursor: "pointer" }}>
                Cancel
              </button>
              <button className="xad-btn" onClick={handleDelete}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", fontWeight: 800, fontSize: "13px", border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ORDERS TAB
// ═══════════════════════════════════════════════════════════════
function OrdersTab({ isDark, card, border, tPri, tSec }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    paid:             { bg: "rgba(22,163,74,.1)",  color: "#16a34a", label: "Paid" },
    COD:              { bg: "rgba(217,119,6,.1)",  color: "#d97706", label: "COD" },
    processing:       { bg: "rgba(37,99,235,.1)",  color: "#2563eb", label: "Processing" },
    shipped:          { bg: "rgba(124,58,237,.1)", color: "#7c3aed", label: "Shipped" },
    delivered:        { bg: "rgba(5,150,105,.1)",  color: "#059669", label: "Delivered" },
    cancelled:        { bg: "rgba(220,38,38,.1)",  color: "#dc2626", label: "Cancelled" },
    awaiting_payment: { bg: "rgba(234,88,12,.1)",  color: "#ea580c", label: "Pending" },
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Status updated to ${status}`);
  };

  const inp    = isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)";
  const inpBdr = isDark ? "rgba(255,255,255,.1)"  : "rgba(0,0,0,.12)";

  return (
    <div className="xad-anim">
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: tSec }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid rgba(37,99,235,.15)", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 12px", animation: "spin .8s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {orders.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px", background: card, borderRadius: "20px", border: `1px solid ${border}` }}>
              <p style={{ fontSize: "40px", margin: "0 0 10px" }}>📭</p>
              <p style={{ fontWeight: 700, color: tSec, margin: 0 }}>No orders yet</p>
            </div>
          )}
          {orders.map(o => {
            const st = STATUS_COLORS[o.status] || { bg: "rgba(107,114,128,.1)", color: "#6b7280", label: o.status };
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", background: "rgba(37,99,235,.08)", padding: "3px 9px", borderRadius: "7px" }}>#{o.id}</span>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: tPri }}>{o.full_name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: tSec }}>{o.phone}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: 900, color: "#2563eb" }}>₹{o.total_amount?.toLocaleString("en-IN")}</span>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, background: st.bg, border: "none", color: st.color, cursor: "pointer" }}>
                      {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={() => setExpanded(isOpen ? null : o.id)}
                      style={{ background: inp, border: `1px solid ${inpBdr}`, borderRadius: "8px", padding: "5px 10px", fontSize: "11px", fontWeight: 700, color: tSec, cursor: "pointer" }}>
                      {isOpen ? "▲ Hide" : "▼ Items"}
                    </button>
                  </div>
                </div>
                {isOpen && o.items && (
                  <div style={{ borderTop: `1px solid ${border}`, padding: "14px 18px", background: isDark ? "rgba(255,255,255,.02)" : "#fafbff" }}>
                    <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      📍 {o.address}, {o.city} — {o.pincode}
                    </p>
                    {o.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ width: "40px", height: "46px", borderRadius: "8px", overflow: "hidden", background: isDark ? "#111826" : "#eef1f8" }}>
                          {(item.images?.[0] || item.image) && <img src={item.images?.[0] || item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: tPri }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: "10px", color: tSec }}>Qty: {item.quantity} · ₹{item.price}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 900, color: "#2563eb" }}>₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  USERS TAB
// ═══════════════════════════════════════════════════════════════
function UsersTab({ isDark, card, border, tPri, tSec }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").order("updated_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="xad-anim">
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: tSec }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid rgba(37,99,235,.15)", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 12px", animation: "spin .8s linear infinite" }} />
        </div>
      ) : (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${border}` }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: tPri }}>👥 All Users ({users.length})</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["#", "Name", "Email", "Role", "Joined"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 800, color: tSec, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="xad-row" style={{ borderBottom: `1px solid ${border}`, background: "transparent" }}>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: tSec }}>{i + 1}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                          {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: tPri }}>{u.full_name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: tSec }}>{u.email || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 9px", borderRadius: "100px",
                        background: u.role === "admin" ? "rgba(251,191,36,.15)" : "rgba(37,99,235,.08)",
                        color: u.role === "admin" ? "#d97706" : "#2563eb" }}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "11px", color: tSec }}>
                      {u.updated_at ? new Date(u.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}