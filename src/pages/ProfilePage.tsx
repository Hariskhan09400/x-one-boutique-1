// src/pages/ProfilePage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import {
  User, Mail, Lock, Save, Loader2, Package,
  ChevronRight, Home, ShoppingBag,
  Phone, Heart, HelpCircle, LogOut, Eye, EyeOff,
  CheckCircle, Clock, XCircle, Truck, Settings,
  Globe, ShoppingCart, HeadphonesIcon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: any[];
  city: string;
  pincode: string;
}

// ─────────────────────────────────────────────────────────────
//  Order status icons (emoji-based for colorful look)
// ─────────────────────────────────────────────────────────────
const ORDER_SHORTCUTS = [
  { label: "Pending Payment", emoji: "⏳", color: "#f97316", bg: "#fff7ed", to: "/orders?tab=awaiting_payment" },
  { label: "Delivered",       emoji: "🎉", color: "#16a34a", bg: "#f0fdf4", to: "/orders?tab=delivered" },
  { label: "Processing",      emoji: "⚙️", color: "#2563eb", bg: "#eff6ff", to: "/orders?tab=processing" },
  { label: "Cancelled",       emoji: "❌", color: "#dc2626", bg: "#fef2f2", to: "/orders?tab=cancelled" },
  { label: "Wishlist",        emoji: "❤️", color: "#e11d48", bg: "#fff1f2", to: "/wishlist" },
  { label: "Customer Care",   emoji: "🎧", color: "#7c3aed", bg: "#f5f3ff", to: "/contact" },
];

// ─────────────────────────────────────────────────────────────
//  Sidebar nav items (reference image style)
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Home",         to: "/",        icon: "🏠" },
  { label: "How to Order", to: "/faq",     icon: "🛒" },
  { label: "Favourites",   to: "/wishlist",icon: "❤️" },
  { label: "My Account",   to: "/profile", icon: "👤" },
  { label: "FAQ's",        to: "/faq",     icon: "❓" },
  { label: "Contact Us",   to: "/contact", icon: "📞" },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  paid:             { label: "Paid",       color: "#16a34a", icon: CheckCircle },
  COD:              { label: "COD",        color: "#d97706", icon: Clock },
  processing:       { label: "Processing", color: "#2563eb", icon: Loader2 },
  shipped:          { label: "Shipped",    color: "#7c3aed", icon: Truck },
  delivered:        { label: "Delivered",  color: "#059669", icon: CheckCircle },
  cancelled:        { label: "Cancelled",  color: "#dc2626", icon: XCircle },
  awaiting_payment: { label: "Pending",    color: "#ea580c", icon: Clock },
};

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // View state: "profile" | "edit" | "password"
  const [view, setView] = useState<"profile" | "edit" | "password">("profile");

  // Personal info
  const [name,    setName]    = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  // Password
  const [currentPass,  setCurrentPass]  = useState("");
  const [newPass,      setNewPass]      = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [showCurr,     setShowCurr]     = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConf,     setShowConf]     = useState(false);

  // Orders
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Country modal
  const [showCountry, setShowCountry] = useState(false);
  const [country,     setCountry]     = useState("🇮🇳 India");

  // Dark mode
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Fetch recent orders
  useEffect(() => {
    if (!user?.id) return;
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error && data) setOrders(data as Order[]);
      setOrdersLoading(false);
    };
    fetchOrders();
  }, [user?.id]);

  // ── Save name ──────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) throw error;
      const saved = localStorage.getItem("xob_user");
      if (saved) localStorage.setItem("xob_user", JSON.stringify({ ...JSON.parse(saved), name }));
      toast.success("Name updated! ✅");
      setView("profile");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPass) return toast.error("Enter current password");
    if (!newPass)     return toast.error("Enter new password");
    if (newPass.length < 6) return toast.error("Min 6 characters required");
    if (newPass !== confirmPass) return toast.error("Passwords do not match ❌");
    if (newPass === currentPass) return toast.error("New password same as current ❌");

    setIsChangingPw(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "", password: currentPass,
      });
      if (signInError) { toast.error("Current password is incorrect ❌"); setIsChangingPw(false); return; }
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      toast.success("Password changed! 🔐");
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setView("profile");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsChangingPw(false);
    }
  };

  // ── Theme ──────────────────────────────────────────────────
  const bg      = isDark ? "#0f111a" : "#f4f6ff";
  const card    = isDark ? "#1a1d2e" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)";
  const textPri = isDark ? "#f1f5f9" : "#0f172a";
  const textSec = isDark ? "rgba(255,255,255,.45)" : "rgba(15,23,42,.5)";
  const inputBg = isDark ? "rgba(255,255,255,.06)" : "#f1f5f9";

  const inp = {
    width: "100%", padding: "13px 16px",
    borderRadius: "12px",
    background: inputBg,
    border: `1.5px solid ${border}`,
    color: textPri, fontSize: "14px",
    fontFamily: "inherit", outline: "none",
  } as React.CSSProperties;

  const COUNTRIES = ["🇮🇳 India", "🇵🇰 Pakistan", "🇧🇩 Bangladesh", "🇺🇸 USA", "🇬🇧 UK", "🇦🇪 UAE"];

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: bg }}>

      {/* ════════════════════════════════════════════════════
          PROFILE HEADER
      ════════════════════════════════════════════════════ */}
      <div style={{
        background: isDark
          ? "linear-gradient(135deg,#1a1d2e,#0f111a)"
          : "linear-gradient(135deg,#1e3a8a,#2563eb)",
        padding: "clamp(24px,4vw,44px) clamp(16px,4vw,32px) 32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Deco circles */}
        <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,.04)", top:"-80px", right:"-60px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.03)", bottom:"-40px", left:"20%", pointerEvents:"none" }} />

        <div style={{ maxWidth: "520px", margin: "0 auto", position: "relative" }}>
          {/* Back button — only show in sub-views */}
          {view !== "profile" && (
            <button onClick={() => setView("profile")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
              borderRadius: "10px", padding: "7px 14px",
              color: "#fff", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", marginBottom: "16px",
            }}>
              ← Back
            </button>
          )}

          {/* Avatar + name + email */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "linear-gradient(135deg,#60a5fa,#818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", fontWeight: 900, color: "#fff",
              border: "3px solid rgba(255,255,255,.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,.25)",
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(18px,4vw,24px)", margin: 0 }}>
                {user?.name || "User"}
              </h1>
              <p style={{ color: "rgba(255,255,255,.6)", fontSize: "13px", margin: "4px 0 0" }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Stats */}
          {view === "profile" && (
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Orders",    value: orders.length || "0" },
                { label: "Delivered", value: orders.filter(o => o.status === "delivered").length || "0" },
                { label: "Since",     value: user?.joinedAt ? new Date(user.joinedAt).getFullYear() : "2025" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,.12)", borderRadius: "14px",
                  padding: "10px 18px", backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,.12)", textAlign: "center",
                }}>
                  <p style={{ color: "#fff", fontSize: "20px", fontWeight: 900, margin: 0, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ color: "rgba(255,255,255,.55)", fontSize: "10px", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          CONTENT AREA
      ════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "20px clamp(12px,4vw,20px) 40px" }}>

        {/* ── MAIN PROFILE VIEW ── */}
        {view === "profile" && (
          <>
            {/* MY ORDERS — Icon grid */}
            <Card isDark={isDark} card={card} border={border}>
              <SectionTitle isDark={isDark} textSec={textSec}>My Orders</SectionTitle>
              {ordersLoading ? (
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Loader2 size={20} style={{ color: "#2563eb", animation: "spin 1s linear infinite" }} />
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {ORDER_SHORTCUTS.map(item => (
                    <Link key={item.label} to={item.to} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "52px", height: "52px", borderRadius: "16px",
                        background: isDark ? "rgba(255,255,255,.06)" : item.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "24px",
                        border: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"}`,
                        transition: "transform .15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        {item.emoji}
                      </div>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, color: textSec, textAlign: "center", lineHeight: 1.3 }}>
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* NAV LIST — Home, How to Order, Favourites, My Account, FAQ, Contact */}
            <Card isDark={isDark} card={card} border={border} style={{ marginTop: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {NAV_ITEMS.map((item, idx) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 4px",
                      borderBottom: idx < NAV_ITEMS.length - 1 ? `1px solid ${border}` : "none",
                      textDecoration: "none",
                      transition: "opacity .15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>{item.icon}</span>
                    <span style={{ flex: 1, fontSize: "15px", fontWeight: 600, color: textPri }}>{item.label}</span>
                    <ChevronRight size={16} style={{ color: textSec }} />
                  </Link>
                ))}

                {/* Edit Profile */}
                <button
                  onClick={() => setView("edit")}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 4px",
                    borderTop: `1px solid ${border}`,
                    background: "none", border: "none", cursor: "pointer",
                    width: "100%", textAlign: "left",
                    transition: "opacity .15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>✏️</span>
                  <span style={{ flex: 1, fontSize: "15px", fontWeight: 600, color: textPri }}>Edit Profile</span>
                  <ChevronRight size={16} style={{ color: textSec }} />
                </button>

                {/* Change Password */}
                <button
                  onClick={() => setView("password")}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 4px",
                    borderTop: `1px solid ${border}`,
                    background: "none", border: "none", cursor: "pointer",
                    width: "100%", textAlign: "left",
                    transition: "opacity .15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>🔐</span>
                  <span style={{ flex: 1, fontSize: "15px", fontWeight: 600, color: textPri }}>Change Password</span>
                  <ChevronRight size={16} style={{ color: textSec }} />
                </button>
              </div>
            </Card>

            {/* SETTINGS + COUNTRY */}
            <Card isDark={isDark} card={card} border={border} style={{ marginTop: "14px" }}>
              {/* Settings */}
              <Link to="/settings" style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 4px",
                borderBottom: `1px solid ${border}`,
                textDecoration: "none",
              }}>
                <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>⚙️</span>
                <span style={{ flex: 1, fontSize: "15px", fontWeight: 600, color: textPri }}>Settings</span>
                <ChevronRight size={16} style={{ color: textSec }} />
              </Link>

              {/* Country */}
              <button
                onClick={() => setShowCountry(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 4px",
                  background: "none", border: "none", cursor: "pointer",
                  width: "100%", textAlign: "left",
                }}
              >
                <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>🌍</span>
                <span style={{ flex: 1, fontSize: "15px", fontWeight: 600, color: textPri }}>Country</span>
                <span style={{ fontSize: "13px", color: textSec, marginRight: "6px" }}>{country}</span>
                <ChevronRight size={16} style={{ color: textSec }} />
              </button>
            </Card>

            {/* LOGOUT */}
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              style={{
                width: "100%", marginTop: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: "15px", borderRadius: "16px",
                background: isDark ? "rgba(239,68,68,.12)" : "#fef2f2",
                border: "1.5px solid rgba(239,68,68,.22)",
                color: "#ef4444", fontWeight: 700, fontSize: "15px",
                cursor: "pointer", transition: "all .2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = isDark ? "rgba(239,68,68,.12)" : "#fef2f2")}
            >
              <LogOut size={17} />
              Logout
            </button>
          </>
        )}

        {/* ── EDIT PROFILE VIEW ── */}
        {view === "edit" && (
          <Card isDark={isDark} card={card} border={border}>
            <SectionTitle isDark={isDark} textSec={textSec}>Edit Profile</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: textSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="Your full name" />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: textSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: textSec }} />
                  <input type="email" value={user?.email || ""} disabled style={{ ...inp, paddingLeft: "36px", opacity: 0.6, cursor: "not-allowed" }} />
                </div>
              </div>
              <button onClick={handleSaveName} disabled={isSaving} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "13px", borderRadius: "12px",
                background: "#2563eb", color: "#fff",
                fontWeight: 700, fontSize: "14px", border: "none",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.7 : 1,
              }}>
                {isSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </Card>
        )}

        {/* ── CHANGE PASSWORD VIEW ── */}
        {view === "password" && (
          <Card isDark={isDark} card={card} border={border}>
            <SectionTitle isDark={isDark} textSec={textSec}>Change Password</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Current */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: textSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showCurr ? "text" : "password"} value={currentPass} onChange={e => setCurrentPass(e.target.value)} style={{ ...inp, paddingRight: "44px" }} placeholder="Enter current password" />
                  <button onClick={() => setShowCurr(p => !p)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: textSec, padding: 0 }}>
                    {showCurr ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: textSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} style={{ ...inp, paddingRight: "44px" }} placeholder="Min 6 characters" />
                  <button onClick={() => setShowNew(p => !p)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: textSec, padding: 0 }}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPass.length > 0 && (
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ height: "3px", borderRadius: "2px", background: border, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "2px", transition: "all .3s",
                        width: newPass.length < 6 ? "30%" : newPass.length < 10 ? "65%" : "100%",
                        background: newPass.length < 6 ? "#ef4444" : newPass.length < 10 ? "#f59e0b" : "#22c55e",
                      }} />
                    </div>
                    <p style={{ fontSize: "10px", color: textSec, marginTop: "3px" }}>
                      {newPass.length < 6 ? "Weak" : newPass.length < 10 ? "Medium" : "Strong"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: textSec, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showConf ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    style={{ ...inp, paddingRight: "44px", borderColor: confirmPass && confirmPass !== newPass ? "#ef4444" : border }}
                    placeholder="Re-enter new password"
                  />
                  <button onClick={() => setShowConf(p => !p)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: textSec, padding: 0 }}>
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPass && confirmPass !== newPass && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", fontWeight: 600 }}>❌ Passwords do not match</p>}
                {confirmPass && confirmPass === newPass && <p style={{ fontSize: "11px", color: "#22c55e", marginTop: "4px", fontWeight: 600 }}>✅ Passwords match</p>}
              </div>

              <button onClick={handleChangePassword} disabled={isChangingPw} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "13px", borderRadius: "12px",
                background: isDark ? "#fff" : "#0f172a",
                color: isDark ? "#0f172a" : "#fff",
                fontWeight: 700, fontSize: "14px", border: "none",
                cursor: isChangingPw ? "not-allowed" : "pointer",
                opacity: isChangingPw ? 0.7 : 1,
              }}>
                {isChangingPw ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Lock size={16} />}
                Update Password
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* ── COUNTRY MODAL ── */}
      {showCountry && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowCountry(false)} />
          <div style={{
            position: "relative", width: "100%", maxWidth: "520px",
            background: card, borderRadius: "24px 24px 0 0",
            padding: "24px", zIndex: 1,
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: textPri, margin: "0 0 16px", textAlign: "center" }}>Select Country</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => { setCountry(c); setShowCountry(false); toast.success(`Country set to ${c}`); }}
                  style={{
                    padding: "13px 16px", borderRadius: "12px", textAlign: "left",
                    background: country === c ? "rgba(37,99,235,.1)" : (isDark ? "rgba(255,255,255,.04)" : "#f8faff"),
                    border: `1.5px solid ${country === c ? "#2563eb" : border}`,
                    color: country === c ? "#2563eb" : textPri,
                    fontWeight: 600, fontSize: "14px", cursor: "pointer",
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Helper components
// ─────────────────────────────────────────────────────────────
const Card = ({ children, isDark, card, border, style = {} }: any) => (
  <div style={{
    background: card,
    border: `1px solid ${border}`,
    borderRadius: "20px",
    padding: "18px",
    boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,.05)",
    ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children, isDark, textSec }: any) => (
  <h2 style={{
    fontSize: "13px", fontWeight: 800,
    color: textSec, textTransform: "uppercase",
    letterSpacing: "0.1em", margin: "0 0 16px",
  }}>
    {children}
  </h2>
);

export default ProfilePage;