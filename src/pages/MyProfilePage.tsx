// src/pages/ProfilePage.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  X ONE BOUTIQUE — Advanced Profile Page
//  Features: Edit Profile, Saved Addresses, Order History,
//  Stats Dashboard, Account Settings, Dark/Light theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  image?: string;
  selectedSize?: string;
}

interface Order {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  razorpay_order_id?: string;
}

interface ProfileData {
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  gender: string;
  bio: string;
}

interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  is_default: boolean;
}

type Tab = "overview" | "orders" | "addresses" | "settings";

// ─────────────────────────────────────────────────────────────
//  Status config
// ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; color: string; bg: string; icon: string; dot: string }> = {
  paid:             { label: "Paid",       color: "#16a34a", bg: "rgba(22,163,74,.1)",   icon: "✅", dot: "#16a34a" },
  COD:              { label: "COD",        color: "#d97706", bg: "rgba(217,119,6,.1)",   icon: "📦", dot: "#d97706" },
  processing:       { label: "Processing", color: "#2563eb", bg: "rgba(37,99,235,.1)",   icon: "⚙️", dot: "#2563eb" },
  shipped:          { label: "Shipped",    color: "#7c3aed", bg: "rgba(124,58,237,.1)",  icon: "🚚", dot: "#7c3aed" },
  delivered:        { label: "Delivered",  color: "#059669", bg: "rgba(5,150,105,.1)",   icon: "🎉", dot: "#059669" },
  cancelled:        { label: "Cancelled",  color: "#dc2626", bg: "rgba(220,38,38,.1)",   icon: "❌", dot: "#dc2626" },
  awaiting_payment: { label: "Pending",    color: "#ea580c", bg: "rgba(234,88,12,.1)",   icon: "⏳", dot: "#ea580c" },
};

const getStatus = (s: string) =>
  STATUS[s] || { label: s, color: "#6b7280", bg: "rgba(107,114,128,.1)", icon: "📋", dot: "#6b7280" };

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

// ─────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Theme
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    full_name: user?.name || "",
    phone: "",
    email: user?.email || "",
    date_of_birth: "",
    gender: "",
    bio: "",
  });
  const [editProfile, setEditProfile] = useState<ProfileData>({ ...profile });

  // Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<SavedAddress, "id" | "is_default">>({
    label: "Home", full_name: user?.name || "", phone: "", address: "", city: "", pincode: "",
  });

  // ── Load orders
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setOrders(data as Order[]);
      setOrdersLoading(false);
    };
    load();
  }, [user?.id]);

  // ── Load profile from localStorage (extended)
  useEffect(() => {
    const saved = localStorage.getItem(`xob_profile_${user?.id}`);
    if (saved) {
      const p = JSON.parse(saved);
      setProfile(p);
      setEditProfile(p);
    } else {
      const base: ProfileData = {
        full_name: user?.name || "",
        phone: "",
        email: user?.email || "",
        date_of_birth: "",
        gender: "",
        bio: "",
      };
      setProfile(base);
      setEditProfile(base);
    }
  }, [user?.id]);

  // ── Load addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`xob_addresses_${user?.id}`);
    if (saved) setAddresses(JSON.parse(saved));
  }, [user?.id]);

  // ── Save profile
  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    localStorage.setItem(`xob_profile_${user?.id}`, JSON.stringify(editProfile));
    setProfile(editProfile);
    if (updateUser) updateUser({ name: editProfile.full_name, email: editProfile.email });
    setSaving(false);
    setIsEditing(false);
    setSaveMsg("Profile saved! ✓");
    setTimeout(() => setSaveMsg(""), 2500);
  }, [editProfile, user?.id, updateUser]);

  // ── Address helpers
  const saveAddresses = useCallback((list: SavedAddress[]) => {
    setAddresses(list);
    localStorage.setItem(`xob_addresses_${user?.id}`, JSON.stringify(list));
  }, [user?.id]);

  const handleAddAddress = useCallback(() => {
    const addr: SavedAddress = {
      ...newAddress,
      id: `addr_${Date.now()}`,
      is_default: addresses.length === 0,
    };
    saveAddresses([...addresses, addr]);
    setShowAddressForm(false);
    setNewAddress({ label: "Home", full_name: user?.name || "", phone: "", address: "", city: "", pincode: "" });
  }, [newAddress, addresses, saveAddresses, user?.name]);

  const handleDeleteAddress = useCallback((id: string) => {
    saveAddresses(addresses.filter(a => a.id !== id));
  }, [addresses, saveAddresses]);

  const handleSetDefault = useCallback((id: string) => {
    saveAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
  }, [addresses, saveAddresses]);

  // ── Stats
  const totalSpent   = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const delivered    = orders.filter(o => o.status === "delivered").length;
  const pending      = orders.filter(o => ["processing", "awaiting_payment", "shipped", "COD"].includes(o.status)).length;
  const avgOrder     = orders.length ? Math.round(totalSpent / orders.length) : 0;

  // ── Filtered orders
  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter(o => o.status === orderFilter);

  // ── Theme tokens
  const bg       = isDark ? "#080b14"      : "#f0f2fa";
  const card     = isDark ? "#10141f"      : "#ffffff";
  const card2    = isDark ? "#141829"      : "#f8faff";
  const border   = isDark ? "rgba(255,255,255,.07)" : "rgba(15,23,42,.07)";
  const tPri     = isDark ? "#f1f5f9"      : "#0d1526";
  const tSec     = isDark ? "rgba(241,245,249,.42)" : "rgba(13,21,38,.45)";
  const tTer     = isDark ? "rgba(241,245,249,.22)" : "rgba(13,21,38,.28)";
  const accent   = "#2563eb";
  const accentBg = isDark ? "rgba(37,99,235,.15)" : "rgba(37,99,235,.08)";
  const inp      = isDark ? "rgba(255,255,255,.06)" : "rgba(13,21,38,.04)";
  const inpBorder= isDark ? "rgba(255,255,255,.1)"  : "rgba(13,21,38,.12)";

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

        .xp-tab { transition: all .2s cubic-bezier(.34,1.56,.64,1); }
        .xp-tab:hover { transform: translateY(-1px); }
        .xp-tab:active { transform: scale(.96); }

        .xp-btn { transition: all .18s ease; cursor: pointer; }
        .xp-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .xp-btn:active { transform: scale(.97); }

        .xp-card { transition: box-shadow .22s ease, transform .22s ease; }
        .xp-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.12) !important; }

        .xp-inp:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.15) !important; }
        .xp-inp { transition: border-color .18s, box-shadow .18s; }

        .xp-addr-card:hover .xp-addr-actions { opacity: 1 !important; }

        @media(max-width:640px) {
          .xp-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .xp-profile-grid { grid-template-columns: 1fr !important; }
          .xp-tabs { overflow-x: auto; }
          .xp-header-inner { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════
          HEADER BANNER
      ══════════════════════════════════════════════════ */}
      <div style={{
        background: isDark
          ? "linear-gradient(135deg,#0d1526 0%,#111827 50%,#0a1628 100%)"
          : "linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#1d4ed8 100%)",
        position: "relative", overflow: "hidden",
        padding: "clamp(20px,3vw,36px) clamp(16px,4vw,40px) 0",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute",width:"340px",height:"340px",borderRadius:"50%",background:"rgba(255,255,255,.04)",top:"-120px",right:"-80px",pointerEvents:"none" }} />
        <div style={{ position:"absolute",width:"200px",height:"200px",borderRadius:"50%",background:"rgba(255,255,255,.03)",bottom:"-80px",left:"10%",pointerEvents:"none" }} />
        <div style={{ position:"absolute",width:"120px",height:"120px",borderRadius:"50%",background:"rgba(96,165,250,.06)",top:"30%",left:"40%",pointerEvents:"none" }} />

        <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative" }}>
          {/* Back btn */}
          <button className="xp-btn" onClick={() => navigate(-1)} style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
            borderRadius: "10px", padding: "7px 14px",
            color: "#fff", fontSize: "12px", fontWeight: 700,
            marginBottom: "20px",
          }}>
            ← Back
          </button>

          {/* Profile header row */}
          <div className="xp-header-inner" style={{ display:"flex", alignItems:"center", gap:"20px", marginBottom:"24px", flexWrap:"wrap" }}>
            {/* Avatar */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{
                width:"80px", height:"80px", borderRadius:"50%",
                background: "linear-gradient(135deg,#60a5fa,#818cf8,#a78bfa)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"32px", fontWeight:900, color:"#fff",
                border:"3px solid rgba(255,255,255,.3)",
                boxShadow:"0 12px 32px rgba(0,0,0,.3)",
              }}>
                {profile.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {/* Online dot */}
              <div style={{ position:"absolute", bottom:"3px", right:"3px", width:"14px", height:"14px", borderRadius:"50%", background:"#22c55e", border:"2px solid #fff" }} />
            </div>

            {/* Name / email / bio */}
            <div style={{ flex:1, minWidth:"200px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                <h1 style={{ color:"#fff", fontWeight:900, fontSize:"clamp(18px,3vw,26px)", margin:0, fontFamily:"'Space Grotesk',sans-serif" }}>
                  {profile.full_name || user?.name || "User"}
                </h1>
                {user?.role === "admin" && (
                  <span style={{ background:"rgba(251,191,36,.15)", border:"1px solid rgba(251,191,36,.4)", color:"#fbbf24", fontSize:"10px", fontWeight:800, padding:"3px 9px", borderRadius:"100px", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                    Admin
                  </span>
                )}
              </div>
              <p style={{ color:"rgba(255,255,255,.55)", fontSize:"13px", margin:"4px 0 0" }}>{profile.email || user?.email}</p>
              {profile.bio && (
                <p style={{ color:"rgba(255,255,255,.38)", fontSize:"12px", margin:"6px 0 0", fontStyle:"italic", maxWidth:"360px" }}>"{profile.bio}"</p>
              )}
            </div>

            {/* Edit btn */}
            <button className="xp-btn" onClick={() => { setIsEditing(true); setActiveTab("overview"); }} style={{
              display:"flex", alignItems:"center", gap:"6px",
              background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.22)",
              borderRadius:"12px", padding:"10px 18px",
              color:"#fff", fontSize:"12px", fontWeight:700,
              flexShrink:0,
            }}>
              ✏️ Edit Profile
            </button>
          </div>

          {/* Stats row */}
          <div className="xp-stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"24px" }}>
            {[
              { v: orders.length,                                        l:"Orders",      icon:"🛍️" },
              { v: delivered,                                            l:"Delivered",   icon:"✅" },
              { v: pending,                                              l:"Active",      icon:"🔄" },
              { v: `₹${totalSpent > 999 ? (totalSpent/1000).toFixed(1)+"k" : totalSpent}`, l:"Spent", icon:"💰" },
            ].map(s => (
              <div key={s.l} style={{
                background:"rgba(255,255,255,.1)", backdropFilter:"blur(12px)",
                borderRadius:"16px", padding:"12px 14px",
                border:"1px solid rgba(255,255,255,.12)", textAlign:"center",
                animation:"fadeUp .4s both",
              }}>
                <div style={{ fontSize:"18px", marginBottom:"4px" }}>{s.icon}</div>
                <p style={{ color:"#fff", fontSize:"18px", fontWeight:900, margin:0, lineHeight:1, fontFamily:"'Space Grotesk',sans-serif" }}>{s.v}</p>
                <p style={{ color:"rgba(255,255,255,.5)", fontSize:"9px", margin:"3px 0 0", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="xp-tabs" style={{ display:"flex", gap:"4px" }}>
            {([
              { key:"overview",   label:"Overview",  icon:"👤" },
              { key:"orders",     label:"Orders",    icon:"📦" },
              { key:"addresses",  label:"Addresses", icon:"📍" },
              { key:"settings",   label:"Settings",  icon:"⚙️" },
            ] as { key:Tab; label:string; icon:string }[]).map(tab => (
              <button
                key={tab.key}
                className="xp-tab"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding:"10px 18px", borderRadius:"12px 12px 0 0",
                  border:"none", cursor:"pointer",
                  fontSize:"12px", fontWeight:700,
                  display:"flex", alignItems:"center", gap:"6px",
                  whiteSpace:"nowrap",
                  background: activeTab === tab.key
                    ? (isDark ? "#10141f" : "#ffffff")
                    : "transparent",
                  color: activeTab === tab.key ? accent : "rgba(255,255,255,.55)",
                  boxShadow: activeTab === tab.key ? "0 -2px 8px rgba(0,0,0,.1)" : "none",
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════ */}
      <div style={{ maxWidth:"780px", margin:"0 auto", padding:"24px clamp(12px,4vw,20px) 48px" }}>

        {/* ── Save success toast ── */}
        {saveMsg && (
          <div style={{
            position:"fixed", top:"20px", right:"20px", zIndex:9999,
            background:"#16a34a", color:"#fff", padding:"12px 20px",
            borderRadius:"12px", fontSize:"13px", fontWeight:700,
            boxShadow:"0 8px 24px rgba(22,163,74,.4)",
            animation:"fadeIn .3s both",
          }}>
            {saveMsg}
          </div>
        )}

        {/* ════════════════════════
            TAB: OVERVIEW / EDIT
        ════════════════════════ */}
        {activeTab === "overview" && (
          <div style={{ animation:"fadeUp .3s both" }}>
            {!isEditing ? (
              /* ── View Mode ── */
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

                {/* Personal Info Card */}
                <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>👤 Personal Information</h3>
                    <button className="xp-btn" onClick={() => setIsEditing(true)} style={{
                      padding:"6px 14px", borderRadius:"8px", fontSize:"11px", fontWeight:700,
                      background:accentBg, border:`1px solid rgba(37,99,235,.2)`,
                      color:accent, cursor:"pointer",
                    }}>Edit</button>
                  </div>
                  <div className="xp-profile-grid" style={{ padding:"20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                    {[
                      { label:"Full Name",      value: profile.full_name || user?.name,  icon:"👤" },
                      { label:"Email Address",  value: profile.email || user?.email,     icon:"📧" },
                      { label:"Phone Number",   value: profile.phone,                   icon:"📞" },
                      { label:"Date of Birth",  value: profile.date_of_birth,           icon:"🎂" },
                      { label:"Gender",         value: profile.gender,                  icon:"⚧" },
                    ].map(f => (
                      <div key={f.label} style={{ padding:"14px", background:card2, borderRadius:"12px", border:`1px solid ${border}` }}>
                        <p style={{ margin:0, fontSize:"10px", fontWeight:700, color:tTer, textTransform:"uppercase", letterSpacing:"0.06em" }}>{f.icon} {f.label}</p>
                        <p style={{ margin:"6px 0 0", fontSize:"14px", fontWeight:600, color: f.value ? tPri : tTer }}>
                          {f.value || <span style={{ fontStyle:"italic", fontWeight:400 }}>Not set</span>}
                        </p>
                      </div>
                    ))}
                    {profile.bio && (
                      <div style={{ gridColumn:"1 / -1", padding:"14px", background:card2, borderRadius:"12px", border:`1px solid ${border}` }}>
                        <p style={{ margin:0, fontSize:"10px", fontWeight:700, color:tTer, textTransform:"uppercase", letterSpacing:"0.06em" }}>💬 Bio</p>
                        <p style={{ margin:"6px 0 0", fontSize:"14px", fontWeight:500, color:tPri, lineHeight:1.6 }}>{profile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats Card */}
                <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}` }}>
                    <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>📊 Shopping Summary</h3>
                  </div>
                  <div style={{ padding:"20px", display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px" }}>
                    {[
                      { label:"Total Orders",    value: orders.length,                                             color:"#2563eb" },
                      { label:"Total Spent",     value: `₹${totalSpent.toLocaleString("en-IN")}`,                color:"#7c3aed" },
                      { label:"Delivered",       value: delivered,                                                 color:"#16a34a" },
                      { label:"Avg Order Value", value: `₹${avgOrder.toLocaleString("en-IN")}`,                  color:"#d97706" },
                    ].map(s => (
                      <div key={s.label} style={{
                        padding:"16px", borderRadius:"14px",
                        background: isDark ? "rgba(255,255,255,.03)" : "#fafbff",
                        border:`1px solid ${border}`,
                        display:"flex", flexDirection:"column", gap:"6px",
                      }}>
                        <p style={{ margin:0, fontSize:"10px", fontWeight:700, color:tTer, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</p>
                        <p style={{ margin:0, fontSize:"22px", fontWeight:900, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini order activity bar */}
                  {orders.length > 0 && (
                    <div style={{ padding:"0 20px 20px" }}>
                      <p style={{ fontSize:"10px", fontWeight:700, color:tTer, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"10px" }}>Recent Activity</p>
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {orders.slice(0,3).map(o => {
                          const st = getStatus(o.status);
                          return (
                            <div key={o.id} style={{
                              display:"flex", alignItems:"center", gap:"12px",
                              padding:"10px 12px", borderRadius:"10px",
                              background: isDark ? "rgba(255,255,255,.03)" : "#f8faff",
                              border:`1px solid ${border}`,
                            }}>
                              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:st.dot, flexShrink:0, boxShadow:`0 0 6px ${st.dot}` }} />
                              <div style={{ flex:1 }}>
                                <p style={{ margin:0, fontSize:"12px", fontWeight:700, color:tPri }}>Order #{o.id}</p>
                                <p style={{ margin:0, fontSize:"10px", color:tSec }}>{fmtDate(o.created_at)}</p>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                <p style={{ margin:0, fontSize:"13px", fontWeight:900, color:accent }}>₹{o.total_amount?.toLocaleString("en-IN")}</p>
                                <p style={{ margin:0, fontSize:"10px", fontWeight:700, color:st.color }}>{st.icon} {st.label}</p>
                              </div>
                            </div>
                          );
                        })}
                        {orders.length > 3 && (
                          <button className="xp-btn" onClick={() => setActiveTab("orders")} style={{
                            padding:"8px", borderRadius:"10px", fontSize:"12px", fontWeight:700,
                            color:accent, background:accentBg, border:`1px solid rgba(37,99,235,.15)`,
                            cursor:"pointer",
                          }}>
                            View all {orders.length} orders →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Saved Addresses preview */}
                {addresses.length > 0 && (
                  <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                    <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>📍 Saved Addresses</h3>
                      <button className="xp-btn" onClick={() => setActiveTab("addresses")} style={{
                        padding:"6px 14px", borderRadius:"8px", fontSize:"11px", fontWeight:700,
                        background:accentBg, border:`1px solid rgba(37,99,235,.2)`, color:accent, cursor:"pointer",
                      }}>Manage</button>
                    </div>
                    <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:"8px" }}>
                      {addresses.slice(0,2).map(a => (
                        <div key={a.id} style={{ padding:"12px 14px", background:card2, borderRadius:"12px", border:`1px solid ${border}`, display:"flex", gap:"10px", alignItems:"flex-start" }}>
                          <span style={{ fontSize:"20px", marginTop:"2px" }}>{a.label === "Home" ? "🏠" : a.label === "Work" ? "🏢" : "📍"}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"2px" }}>
                              <p style={{ margin:0, fontSize:"13px", fontWeight:800, color:tPri }}>{a.label}</p>
                              {a.is_default && <span style={{ fontSize:"9px", fontWeight:800, color:accent, background:accentBg, padding:"2px 7px", borderRadius:"100px", textTransform:"uppercase", letterSpacing:"0.05em" }}>Default</span>}
                            </div>
                            <p style={{ margin:0, fontSize:"12px", color:tSec }}>{a.address}, {a.city} - {a.pincode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            ) : (
              /* ── Edit Mode ── */
              <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)", animation:"fadeUp .3s both" }}>
                <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>✏️ Edit Profile</h3>
                  <button className="xp-btn" onClick={() => setIsEditing(false)} style={{
                    padding:"6px 12px", borderRadius:"8px", fontSize:"11px", fontWeight:700,
                    background:"transparent", border:`1px solid ${border}`, color:tSec, cursor:"pointer",
                  }}>Cancel</button>
                </div>

                <div style={{ padding:"24px 20px", display:"flex", flexDirection:"column", gap:"16px" }}>
                  <div className="xp-profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>

                    {/* Full Name */}
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Full Name *</label>
                      <input className="xp-inp" value={editProfile.full_name} onChange={e => setEditProfile(p => ({...p, full_name:e.target.value}))}
                        placeholder="Your full name"
                        style={{ width:"100%", padding:"12px 14px", borderRadius:"12px", fontSize:"14px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Email Address *</label>
                      <input className="xp-inp" value={editProfile.email} onChange={e => setEditProfile(p => ({...p, email:e.target.value}))}
                        type="email" placeholder="your@email.com"
                        style={{ width:"100%", padding:"12px 14px", borderRadius:"12px", fontSize:"14px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Phone Number</label>
                      <input className="xp-inp" value={editProfile.phone} onChange={e => setEditProfile(p => ({...p, phone:e.target.value.replace(/\D/g,"").slice(0,10)}))}
                        type="tel" placeholder="10-digit mobile number" maxLength={10}
                        style={{ width:"100%", padding:"12px 14px", borderRadius:"12px", fontSize:"14px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Date of Birth</label>
                      <input className="xp-inp" value={editProfile.date_of_birth} onChange={e => setEditProfile(p => ({...p, date_of_birth:e.target.value}))}
                        type="date"
                        style={{ width:"100%", padding:"12px 14px", borderRadius:"12px", fontSize:"14px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>

                    {/* Gender */}
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Gender</label>
                      <select className="xp-inp" value={editProfile.gender} onChange={e => setEditProfile(p => ({...p, gender:e.target.value}))}
                        style={{ width:"100%", padding:"12px 14px", borderRadius:"12px", fontSize:"14px", fontWeight:600, color: editProfile.gender ? tPri : tTer, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }}>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Bio (optional)</label>
                    <textarea className="xp-inp" value={editProfile.bio} onChange={e => setEditProfile(p => ({...p, bio:e.target.value}))}
                      placeholder="A short intro about yourself..." maxLength={160}
                      style={{ width:"100%", padding:"12px 14px", borderRadius:"12px", fontSize:"14px", fontWeight:500, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, resize:"vertical", minHeight:"80px", boxSizing:"border-box", lineHeight:"1.6" }} />
                    <p style={{ fontSize:"10px", color:tTer, margin:"4px 0 0", textAlign:"right" }}>{editProfile.bio.length}/160</p>
                  </div>

                  {/* Save btn */}
                  <button className="xp-btn" onClick={handleSaveProfile} disabled={saving}
                    style={{
                      padding:"14px", borderRadius:"14px", fontSize:"14px", fontWeight:800,
                      background: saving ? "rgba(37,99,235,.5)" : "linear-gradient(135deg,#2563eb,#4f46e5)",
                      color:"#fff", border:"none", cursor: saving ? "wait" : "pointer",
                      boxShadow: saving ? "none" : "0 8px 24px rgba(37,99,235,.35)",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    }}>
                    {saving ? (
                      <>
                        <div style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
                        Saving...
                      </>
                    ) : "Save Changes ✓"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════
            TAB: ORDERS
        ════════════════════════ */}
        {activeTab === "orders" && (
          <div style={{ animation:"fadeUp .3s both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
              <h2 style={{ margin:0, fontSize:"16px", fontWeight:800, color:tPri }}>📦 My Orders ({filteredOrders.length})</h2>
              {/* Filter */}
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {(["all","paid","COD","processing","shipped","delivered","cancelled"] as const).map(f => (
                  <button key={f} className="xp-tab" onClick={() => setOrderFilter(f)}
                    style={{
                      padding:"5px 12px", borderRadius:"100px", fontSize:"10px", fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"0.05em",
                      background: orderFilter === f ? accent : (isDark ? "rgba(255,255,255,.06)" : "#f0f2fa"),
                      color: orderFilter === f ? "#fff" : tSec,
                      border: orderFilter === f ? "none" : `1px solid ${border}`,
                      cursor:"pointer",
                    }}>
                    {f === "all" ? "All" : getStatus(f).label}
                  </button>
                ))}
              </div>
            </div>

            {ordersLoading && (
              <div style={{ textAlign:"center", padding:"48px", color:tSec }}>
                <div style={{ width:"32px", height:"32px", border:`3px solid ${accentBg}`, borderTopColor:accent, borderRadius:"50%", margin:"0 auto 12px", animation:"spin 1s linear infinite" }} />
                <p>Loading orders...</p>
              </div>
            )}

            {!ordersLoading && filteredOrders.length === 0 && (
              <div style={{ textAlign:"center", padding:"48px 24px", background:card, borderRadius:"20px", border:`1px solid ${border}` }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>📭</div>
                <p style={{ fontWeight:800, fontSize:"16px", color:tPri, margin:0 }}>No orders found</p>
                <p style={{ color:tSec, fontSize:"13px", marginTop:"6px" }}>
                  {orderFilter === "all" ? "Start shopping to see orders here!" : `No ${getStatus(orderFilter).label} orders`}
                </p>
                {orderFilter === "all" && (
                  <button className="xp-btn" onClick={() => navigate("/")} style={{ marginTop:"16px", padding:"12px 24px", borderRadius:"12px", background:accent, color:"#fff", fontWeight:700, fontSize:"13px", border:"none", cursor:"pointer" }}>
                    Shop Now →
                  </button>
                )}
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {filteredOrders.map((order, idx) => {
                const st     = getStatus(order.status);
                const isOpen = expandedOrder === order.id;
                const itemCnt = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

                return (
                  <div key={order.id} className="xp-card" style={{
                    background:card, border:`1px solid ${border}`,
                    borderRadius:"20px", overflow:"hidden",
                    boxShadow:"0 2px 12px rgba(0,0,0,.06)",
                    animation:`fadeUp .35s ${idx * 0.05}s both`,
                  }}>
                    {/* Status top stripe */}
                    <div style={{ height:"3px", background:`linear-gradient(90deg,${st.dot},transparent)` }} />

                    <div style={{ padding:"16px 18px" }}>
                      {/* Top row */}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                            <span style={{ fontSize:"11px", color:tTer, fontWeight:700, textTransform:"uppercase" }}>Order</span>
                            <span style={{ fontSize:"12px", fontWeight:800, color:accent, background:accentBg, padding:"2px 9px", borderRadius:"6px" }}>#{order.id}</span>
                          </div>
                          <p style={{ fontSize:"11px", color:tSec, margin:"4px 0 0" }}>
                            {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
                          </p>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:"5px", padding:"5px 12px", borderRadius:"100px", background: isDark ? "rgba(255,255,255,.05)" : st.bg }}>
                          <span>{st.icon}</span>
                          <span style={{ fontSize:"11px", fontWeight:800, color: isDark ? "#fff" : st.color, letterSpacing:"0.04em" }}>{st.label}</span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"14px" }}>
                        <MiniInfo label="👤 Name"  value={order.full_name} tPri={tPri} tSec={tSec} card2={card2} border={border} />
                        <MiniInfo label="📞 Phone" value={order.phone}     tPri={tPri} tSec={tSec} card2={card2} border={border} />
                        <div style={{ gridColumn:"1 / -1" }}>
                          <MiniInfo label="📍 Address" value={`${order.address}, ${order.city} - ${order.pincode}`} tPri={tPri} tSec={tSec} card2={card2} border={border} />
                        </div>
                      </div>

                      {/* Amount + toggle */}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <p style={{ margin:0, fontSize:"11px", color:tSec, fontWeight:600 }}>{itemCnt} item{itemCnt !== 1 ? "s" : ""}</p>
                          <p style={{ margin:"2px 0 0", fontSize:"24px", fontWeight:900, color:tPri, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1.1 }}>
                            ₹{order.total_amount?.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <button className="xp-btn" onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                          style={{ display:"flex", alignItems:"center", gap:"6px", padding:"9px 16px", borderRadius:"12px", background:accentBg, border:`1px solid rgba(37,99,235,.15)`, color:accent, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                          {isOpen ? "Hide" : "Items"}
                          <span style={{ display:"inline-block", transform:isOpen?"rotate(180deg)":"none", transition:"transform .22s" }}>▾</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded items */}
                    {isOpen && (
                      <div style={{ borderTop:`1px solid ${border}`, padding:"16px 18px", background: isDark ? "rgba(255,255,255,.02)" : "#fafbff", animation:"fadeIn .25s both" }}>
                        <p style={{ fontSize:"10px", fontWeight:800, color:tTer, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Items in this order</p>

                        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                          {order.items?.map((item, i) => (
                            <div key={i} style={{ display:"flex", gap:"12px", alignItems:"center", padding:"10px", background:card, borderRadius:"12px", border:`1px solid ${border}` }}>
                              <div style={{ width:"56px", height:"56px", borderRadius:"10px", overflow:"hidden", flexShrink:0, background: isDark ? "rgba(255,255,255,.05)" : "#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                {(item.images?.[0] || item.image) ? (
                                  <img src={item.images?.[0] || item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                ) : (
                                  <span style={{ fontSize:"24px" }}>👕</span>
                                )}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ margin:0, fontSize:"13px", fontWeight:700, color:tPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                                <p style={{ margin:"3px 0 0", fontSize:"11px", color:tSec }}>
                                  Qty: {item.quantity}
                                  {item.selectedSize ? ` · Size: ${item.selectedSize}` : ""}
                                  {` · ₹${item.price?.toLocaleString("en-IN")} each`}
                                </p>
                              </div>
                              <p style={{ margin:0, fontSize:"15px", fontWeight:900, color:accent, flexShrink:0 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                            </div>
                          ))}
                        </div>

                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${border}`, marginTop:"14px", paddingTop:"12px" }}>
                          <span style={{ fontSize:"13px", fontWeight:600, color:tSec }}>Total Paid</span>
                          <span style={{ fontSize:"22px", fontWeight:900, color:tPri, fontFamily:"'Space Grotesk',sans-serif" }}>₹{order.total_amount?.toLocaleString("en-IN")}</span>
                        </div>

                        {order.razorpay_order_id && (
                          <div style={{ marginTop:"10px", padding:"10px 14px", borderRadius:"10px", background:accentBg, border:"1px solid rgba(37,99,235,.12)" }}>
                            <p style={{ margin:0, fontSize:"9px", fontWeight:800, color:accent, textTransform:"uppercase", letterSpacing:"0.08em" }}>Payment Reference</p>
                            <p style={{ margin:"3px 0 0", fontSize:"11px", color:tSec, fontFamily:"monospace" }}>{order.razorpay_order_id}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════
            TAB: ADDRESSES
        ════════════════════════ */}
        {activeTab === "addresses" && (
          <div style={{ animation:"fadeUp .3s both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <h2 style={{ margin:0, fontSize:"16px", fontWeight:800, color:tPri }}>📍 Saved Addresses ({addresses.length})</h2>
              <button className="xp-btn" onClick={() => { setShowAddressForm(true); setEditingAddress(null); }}
                style={{ padding:"9px 18px", borderRadius:"12px", fontSize:"12px", fontWeight:700, background:"linear-gradient(135deg,#2563eb,#4f46e5)", color:"#fff", border:"none", cursor:"pointer", boxShadow:"0 4px 16px rgba(37,99,235,.3)", display:"flex", alignItems:"center", gap:"6px" }}>
                + Add Address
              </button>
            </div>

            {/* Add/Edit form */}
            {showAddressForm && (
              <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:"16px", animation:"slideIn .3s both" }}>
                <div style={{ padding:"14px 18px", borderBottom:`1px solid ${border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>
                    {editingAddress ? "✏️ Edit Address" : "➕ New Address"}
                  </h3>
                  <button className="xp-btn" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}
                    style={{ padding:"5px 12px", borderRadius:"8px", fontSize:"11px", fontWeight:700, background:"transparent", border:`1px solid ${border}`, color:tSec, cursor:"pointer" }}>✕</button>
                </div>
                <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"14px" }}>
                  {/* Label */}
                  <div>
                    <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Address Label</label>
                    <div style={{ display:"flex", gap:"8px" }}>
                      {["Home","Work","Other"].map(l => (
                        <button key={l} className="xp-btn" onClick={() => setNewAddress(p => ({...p, label:l}))}
                          style={{ padding:"8px 16px", borderRadius:"10px", fontSize:"12px", fontWeight:700, cursor:"pointer",
                            background: newAddress.label === l ? accent : (isDark ? "rgba(255,255,255,.06)" : "#f0f2fa"),
                            color: newAddress.label === l ? "#fff" : tSec,
                            border: newAddress.label === l ? "none" : `1px solid ${border}`,
                          }}>
                          {l === "Home" ? "🏠" : l === "Work" ? "🏢" : "📍"} {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Full Name *</label>
                      <input className="xp-inp" value={newAddress.full_name} onChange={e => setNewAddress(p => ({...p, full_name:e.target.value}))}
                        placeholder="Recipient name"
                        style={{ width:"100%", padding:"11px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Phone *</label>
                      <input className="xp-inp" value={newAddress.phone} onChange={e => setNewAddress(p => ({...p, phone:e.target.value.replace(/\D/g,"").slice(0,10)}))}
                        placeholder="10-digit number" maxLength={10} type="tel"
                        style={{ width:"100%", padding:"11px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>
                    <div style={{ gridColumn:"1 / -1" }}>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Street Address *</label>
                      <textarea className="xp-inp" value={newAddress.address} onChange={e => setNewAddress(p => ({...p, address:e.target.value}))}
                        placeholder="House no, street, area..."
                        style={{ width:"100%", padding:"11px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, resize:"vertical", minHeight:"72px", boxSizing:"border-box", lineHeight:"1.6" }} />
                    </div>
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>City *</label>
                      <input className="xp-inp" value={newAddress.city} onChange={e => setNewAddress(p => ({...p, city:e.target.value}))}
                        placeholder="City"
                        style={{ width:"100%", padding:"11px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>PIN Code *</label>
                      <input className="xp-inp" value={newAddress.pincode} onChange={e => setNewAddress(p => ({...p, pincode:e.target.value.replace(/\D/g,"").slice(0,6)}))}
                        placeholder="6-digit PIN" maxLength={6}
                        style={{ width:"100%", padding:"11px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:600, color:tPri, background:inp, border:`1.5px solid ${inpBorder}`, boxSizing:"border-box" }} />
                    </div>
                  </div>

                  <button className="xp-btn" onClick={handleAddAddress}
                    disabled={!newAddress.full_name || !newAddress.phone || !newAddress.address || !newAddress.city || newAddress.pincode.length !== 6}
                    style={{ padding:"13px", borderRadius:"13px", fontSize:"13px", fontWeight:800, background:"linear-gradient(135deg,#2563eb,#4f46e5)", color:"#fff", border:"none", cursor:"pointer", boxShadow:"0 6px 20px rgba(37,99,235,.3)", opacity: (!newAddress.full_name || !newAddress.phone || !newAddress.address || !newAddress.city || newAddress.pincode.length !== 6) ? 0.5 : 1 }}>
                    Save Address ✓
                  </button>
                </div>
              </div>
            )}

            {/* Address list */}
            {addresses.length === 0 && !showAddressForm && (
              <div style={{ textAlign:"center", padding:"48px 24px", background:card, borderRadius:"20px", border:`1px solid ${border}` }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>📭</div>
                <p style={{ fontWeight:800, fontSize:"15px", color:tPri, margin:0 }}>No saved addresses</p>
                <p style={{ color:tSec, fontSize:"13px", marginTop:"6px" }}>Add an address for faster checkout!</p>
                <button className="xp-btn" onClick={() => setShowAddressForm(true)} style={{ marginTop:"16px", padding:"12px 24px", borderRadius:"12px", background:accent, color:"#fff", fontWeight:700, fontSize:"13px", border:"none", cursor:"pointer" }}>
                  + Add Address
                </button>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {addresses.map((addr, i) => (
                <div key={addr.id} className="xp-addr-card xp-card" style={{
                  background:card, border:`1px solid ${border}`, borderRadius:"18px",
                  overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,.05)",
                  animation:`fadeUp .35s ${i*0.06}s both`, position:"relative",
                }}>
                  {addr.is_default && (
                    <div style={{ position:"absolute", top:"12px", right:"12px", fontSize:"9px", fontWeight:800, color:accent, background:accentBg, padding:"3px 9px", borderRadius:"100px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Default</div>
                  )}
                  <div style={{ padding:"16px 18px" }}>
                    <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
                      <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
                        {addr.label === "Home" ? "🏠" : addr.label === "Work" ? "🏢" : "📍"}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri, marginBottom:"4px" }}>{addr.label}</p>
                        <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:tSec }}>{addr.full_name} · {addr.phone}</p>
                        <p style={{ margin:"4px 0 0", fontSize:"12px", color:tSec, lineHeight:1.5 }}>{addr.address}, {addr.city} - {addr.pincode}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:"8px", marginTop:"14px", paddingTop:"12px", borderTop:`1px solid ${border}` }}>
                      {!addr.is_default && (
                        <button className="xp-btn" onClick={() => handleSetDefault(addr.id)}
                          style={{ flex:1, padding:"8px", borderRadius:"10px", fontSize:"11px", fontWeight:700, background:accentBg, border:`1px solid rgba(37,99,235,.15)`, color:accent, cursor:"pointer" }}>
                          Set Default
                        </button>
                      )}
                      <button className="xp-btn" onClick={() => handleDeleteAddress(addr.id)}
                        style={{ flex:1, padding:"8px", borderRadius:"10px", fontSize:"11px", fontWeight:700, background:"rgba(220,38,38,.08)", border:"1px solid rgba(220,38,38,.15)", color:"#dc2626", cursor:"pointer" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════
            TAB: SETTINGS
        ════════════════════════ */}
        {activeTab === "settings" && (
          <div style={{ animation:"fadeUp .3s both", display:"flex", flexDirection:"column", gap:"16px" }}>

            {/* Account Info */}
            <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}` }}>
                <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>🔐 Account Information</h3>
              </div>
              <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"12px" }}>
                {[
                  { label:"Account Email",   value: user?.email || profile.email,                             icon:"📧" },
                  { label:"Account ID",      value: user?.id ? user.id.substring(0,16) + "..." : "—",         icon:"🔑" },
                  { label:"Member Since",    value: user?.joinedAt ? fmtDate(user.joinedAt) : "—",            icon:"📅" },
                  { label:"Account Role",    value: user?.role === "admin" ? "Admin" : "Customer",             icon:"👑" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:card2, borderRadius:"12px", border:`1px solid ${border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <span style={{ fontSize:"16px" }}>{item.icon}</span>
                      <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:tSec }}>{item.label}</p>
                    </div>
                    <p style={{ margin:0, fontSize:"13px", fontWeight:700, color:tPri, textAlign:"right", maxWidth:"180px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}` }}>
                <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>🔒 Security</h3>
              </div>
              <div style={{ padding:"20px" }}>
                <button className="xp-btn" onClick={() => navigate("/forgot-password")} style={{
                  width:"100%", padding:"13px", borderRadius:"13px", fontSize:"13px", fontWeight:700,
                  background: isDark ? "rgba(255,255,255,.06)" : "#f0f2fa",
                  color:tPri, border:`1px solid ${border}`, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <span>🔑</span> Change Password
                  </div>
                  <span style={{ color:tTer }}>→</span>
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="xp-card" style={{ background:card, border:`1px solid ${border}`, borderRadius:"20px", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}` }}>
                <h3 style={{ margin:0, fontSize:"14px", fontWeight:800, color:tPri }}>🎨 Preferences</h3>
              </div>
              <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"10px" }}>
                {[
                  { label:"Dark Mode",           icon:"🌙", value: isDark ? "On" : "Off" },
                  { label:"Order Notifications", icon:"🔔", value: "Enabled" },
                  { label:"Currency",            icon:"💱", value: "INR (₹)" },
                  { label:"Language",            icon:"🌐", value: "English" },
                ].map(p => (
                  <div key={p.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:card2, borderRadius:"12px", border:`1px solid ${border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <span style={{ fontSize:"16px" }}>{p.icon}</span>
                      <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:tSec }}>{p.label}</p>
                    </div>
                    <span style={{ fontSize:"12px", fontWeight:700, color:accent, background:accentBg, padding:"3px 10px", borderRadius:"100px" }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ background: isDark ? "rgba(220,38,38,.05)" : "#fff5f5", border:"1px solid rgba(220,38,38,.12)", borderRadius:"20px", padding:"20px" }}>
              <h3 style={{ margin:"0 0 14px", fontSize:"14px", fontWeight:800, color:"#dc2626" }}>⚠️ Danger Zone</h3>
              <button className="xp-btn" onClick={() => { if (window.confirm("Are you sure you want to clear all local data? This cannot be undone.")) { localStorage.removeItem(`xob_profile_${user?.id}`); localStorage.removeItem(`xob_addresses_${user?.id}`); setProfile({ full_name:user?.name||"", phone:"", email:user?.email||"", date_of_birth:"", gender:"", bio:"" }); setAddresses([]); setSaveMsg("Data cleared!"); setTimeout(()=>setSaveMsg(""),2000); } }}
                style={{ width:"100%", padding:"12px", borderRadius:"12px", fontSize:"13px", fontWeight:700, background:"rgba(220,38,38,.08)", border:"1px solid rgba(220,38,38,.2)", color:"#dc2626", cursor:"pointer" }}>
                Clear All Local Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MiniInfo — compact info box for order cards
// ─────────────────────────────────────────────────────────────
function MiniInfo({ label, value, tPri, tSec, card2, border }: any) {
  return (
    <div style={{ padding:"9px 12px", borderRadius:"10px", background:card2, border:`1px solid ${border}` }}>
      <p style={{ margin:0, fontSize:"9px", fontWeight:700, color:tSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
      <p style={{ margin:"3px 0 0", fontSize:"12px", fontWeight:600, color:tPri, lineHeight:1.4 }}>{value || "—"}</p>
    </div>
  );
}