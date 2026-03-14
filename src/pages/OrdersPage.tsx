// src/pages/OrdersPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  image?: string;
  selectedSize?: string;
}

interface Order {
  id: string;
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

// ─────────────────────────────────────────────────────────────
//  Status config
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  paid:              { label: "Paid",            color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
  COD:               { label: "COD",             color: "#d97706", bg: "#fffbeb", icon: "📦" },
  processing:        { label: "Processing",      color: "#2563eb", bg: "#eff6ff", icon: "⚙️" },
  shipped:           { label: "Shipped",         color: "#7c3aed", bg: "#f5f3ff", icon: "🚚" },
  delivered:         { label: "Delivered",       color: "#059669", bg: "#ecfdf5", icon: "🎉" },
  cancelled:         { label: "Cancelled",       color: "#dc2626", bg: "#fef2f2", icon: "❌" },
  awaiting_payment:  { label: "Pending Payment", color: "#ea580c", bg: "#fff7ed", icon: "⏳" },
};

const getStatus = (s: string) =>
  STATUS_CONFIG[s] || { label: s, color: "#6b7280", bg: "#f9fafb", icon: "📋" };

const TABS = ["All", "Paid", "COD", "Delivered", "Processing", "Cancelled"];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders,      setOrders]      = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("All");
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [isDark,      setIsDark]      = useState(false);

  // Dark mode detect
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!user?.id) return;
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data as Order[]);
      setLoading(false);
    };
    fetchOrders();
  }, [user?.id]);

  // Filter by tab
  const filtered = orders.filter((o) => {
    if (activeTab === "All") return true;
    return o.status.toLowerCase() === activeTab.toLowerCase();
  });

  // Theme tokens
  const bg      = isDark ? "#0f111a" : "#f8faff";
  const card    = isDark ? "#1a1d2e" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)";
  const textPri = isDark ? "#f1f5f9" : "#0f172a";
  const textSec = isDark ? "rgba(255,255,255,.45)" : "rgba(15,23,42,.45)";
  const pillBg  = isDark ? "rgba(255,255,255,.06)" : "rgba(15,23,42,.06)";

  return (
    <>
      <style>{`
        .orders-tab-scroll::-webkit-scrollbar { display: none; }
        .orders-tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes oSpin {
          to { transform: rotate(360deg); }
        }
        .o-spin { animation: oSpin .8s linear infinite; }

        @keyframes oFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .o-fade { animation: oFade .4s ease both; }

        .order-card {
          transition: box-shadow .2s, transform .2s;
        }
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,.12);
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, paddingBottom: "48px" }}>

        {/* ── HEADER ── */}
        <div style={{
          background: isDark
            ? "linear-gradient(135deg,#1a1d2e 0%,#0f111a 100%)"
            : "linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)",
          padding: "clamp(28px,5vw,48px) clamp(16px,5vw,40px) 32px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{
            position: "absolute", width: "300px", height: "300px",
            borderRadius: "50%", background: "rgba(255,255,255,.04)",
            top: "-80px", right: "-60px", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: "200px", height: "200px",
            borderRadius: "50%", background: "rgba(255,255,255,.03)",
            bottom: "-60px", left: "20%", pointerEvents: "none",
          }} />

          <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.18)",
                borderRadius: "10px",
                padding: "8px 14px",
                color: "#fff",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", marginBottom: "20px",
              }}
            >
              ← Back
            </button>

            <h1 style={{
              fontSize: "clamp(24px,5vw,36px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              My Orders
            </h1>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: "14px", marginTop: "6px" }}>
              {orders.length > 0
                ? `${orders.length} order${orders.length > 1 ? "s" : ""} placed`
                : "No orders yet"}
            </p>

            {/* Stats row */}
            {orders.length > 0 && (
              <div style={{
                display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap",
              }}>
                {[
                  { label: "Total Orders", value: orders.length },
                  { label: "Delivered",    value: orders.filter(o => o.status === "delivered").length },
                  { label: "In Progress",  value: orders.filter(o => ["processing","shipped","paid","COD"].includes(o.status)).length },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "rgba(255,255,255,.1)",
                    borderRadius: "14px",
                    padding: "10px 16px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,.12)",
                  }}>
                    <p style={{ color: "#fff", fontSize: "20px", fontWeight: 900, margin: 0, lineHeight: 1 }}>
                      {s.value}
                    </p>
                    <p style={{ color: "rgba(255,255,255,.55)", fontSize: "10px", margin: "3px 0 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 clamp(12px,4vw,24px)" }}>

          {/* ── TABS ── */}
          <div className="orders-tab-scroll" style={{
            display: "flex", gap: "8px", overflowX: "auto",
            padding: "20px 0 4px",
          }}>
            {TABS.map((tab) => {
              const on = activeTab === tab;
              const count = tab === "All"
                ? orders.length
                : orders.filter(o => o.status.toLowerCase() === tab.toLowerCase()).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flexShrink: 0,
                    padding: "8px 16px",
                    borderRadius: "100px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    border: on ? "1.5px solid #2563eb" : `1.5px solid ${border}`,
                    background: on ? "#2563eb" : pillBg,
                    color: on ? "#fff" : textSec,
                    cursor: "pointer",
                    transition: "all .2s",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {tab}
                  {count > 0 && (
                    <span style={{
                      background: on ? "rgba(255,255,255,.25)" : "rgba(37,99,235,.15)",
                      color: on ? "#fff" : "#2563eb",
                      fontSize: "10px", fontWeight: 800,
                      padding: "1px 7px", borderRadius: "20px",
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── LOADING ── */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <div style={{
                width: "40px", height: "40px",
                border: "3px solid rgba(37,99,235,.15)",
                borderTopColor: "#2563eb",
                borderRadius: "50%",
              }} className="o-spin" />
            </div>
          )}

          {/* ── EMPTY ── */}
          {!loading && filtered.length === 0 && (
            <div style={{
              textAlign: "center", padding: "64px 24px",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{
                width: "80px", height: "80px",
                background: isDark ? "rgba(255,255,255,.06)" : "#f1f5f9",
                borderRadius: "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "36px", marginBottom: "16px",
              }}>
                📦
              </div>
              <p style={{ fontWeight: 800, fontSize: "16px", color: textPri, margin: 0 }}>
                {activeTab === "All" ? "No orders yet" : `No ${activeTab} orders`}
              </p>
              <p style={{ color: textSec, fontSize: "13px", marginTop: "6px" }}>
                {activeTab === "All" ? "Start shopping to see your orders here!" : "Try switching tabs"}
              </p>
              {activeTab === "All" && (
                <button
                  onClick={() => navigate("/")}
                  style={{
                    marginTop: "20px",
                    padding: "12px 24px",
                    borderRadius: "14px",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 700, fontSize: "13px",
                    border: "none", cursor: "pointer",
                  }}
                >
                  Shop Now →
                </button>
              )}
            </div>
          )}

          {/* ── ORDER CARDS ── */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "12px" }}>
              {filtered.map((order, idx) => {
                const st       = getStatus(order.status);
                const isOpen   = expandedId === order.id;
                const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

                return (
                  <div
                    key={order.id}
                    className="order-card o-fade"
                    style={{
                      animationDelay: `${idx * 0.06}s`,
                      background: card,
                      border: `1px solid ${border}`,
                      borderRadius: "20px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Card header */}
                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Order ID */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: "11px", fontWeight: 700,
                              color: textSec, letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}>
                              Order
                            </span>
                            <span style={{
                              fontSize: "11px", fontWeight: 800,
                              color: "#2563eb",
                              background: "rgba(37,99,235,.08)",
                              padding: "2px 8px", borderRadius: "6px",
                            }}>
                             #{String(order.id).slice(0, 8).toUpperCase()}
                            </span>
                          </div>

                          {/* Date + items */}
                          <p style={{ color: textSec, fontSize: "12px", margin: "4px 0 0", fontWeight: 500 }}>
                            {formatDate(order.created_at)} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          padding: "5px 12px",
                          borderRadius: "100px",
                          background: isDark ? "rgba(255,255,255,.06)" : st.bg,
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: "12px" }}>{st.icon}</span>
                          <span style={{
                            fontSize: "11px", fontWeight: 800,
                            color: isDark ? "#fff" : st.color,
                            letterSpacing: "0.04em",
                          }}>
                            {st.label}
                          </span>
                        </div>
                      </div>

                      {/* Amount row */}
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginTop: "14px",
                      }}>
                        <span style={{ fontSize: "22px", fontWeight: 900, color: textPri }}>
                          ₹{order.total_amount?.toLocaleString("en-IN")}
                        </span>

                        {/* Details toggle */}
                        <button
                          onClick={() => setExpandedId(isOpen ? null : order.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "7px 14px",
                            borderRadius: "10px",
                            background: "rgba(37,99,235,.08)",
                            border: "1px solid rgba(37,99,235,.15)",
                            color: "#2563eb",
                            fontSize: "12px", fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {isOpen ? "Hide" : "Details"}
                          <span style={{
                            display: "inline-block",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                            transition: "transform .25s",
                          }}>
                            ▾
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* ── EXPANDED DETAILS ── */}
                    {isOpen && (
                      <div style={{
                        borderTop: `1px solid ${border}`,
                        padding: "16px 18px",
                        background: isDark ? "rgba(255,255,255,.02)" : "#fafbff",
                        display: "flex", flexDirection: "column", gap: "16px",
                      }}>

                        {/* Items */}
                        <div>
                          <p style={{
                            fontSize: "11px", fontWeight: 700,
                            color: textSec, textTransform: "uppercase",
                            letterSpacing: "0.08em", marginBottom: "10px",
                          }}>
                            Items Ordered
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {order.items?.map((item, i) => (
                              <div key={i} style={{
                                display: "flex", gap: "10px", alignItems: "center",
                              }}>
                                {/* Product image */}
                                <div style={{
                                  width: "48px", height: "48px",
                                  borderRadius: "10px",
                                  overflow: "hidden", flexShrink: 0,
                                  background: isDark ? "rgba(255,255,255,.06)" : "#f1f5f9",
                                }}>
                                  {(item.images?.[0] || item.image) ? (
                                    <img
                                      src={item.images?.[0] || item.image}
                                      alt={item.name}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <div style={{
                                      width: "100%", height: "100%",
                                      display: "flex", alignItems: "center",
                                      justifyContent: "center", fontSize: "20px",
                                    }}>
                                      👕
                                    </div>
                                  )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{
                                    fontSize: "13px", fontWeight: 700,
                                    color: textPri, margin: 0,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                  }}>
                                    {item.name}
                                  </p>
                                  <p style={{ fontSize: "12px", color: textSec, margin: "2px 0 0" }}>
                                    Qty: {item.quantity}
                                    {item.selectedSize ? ` · Size: ${item.selectedSize}` : ""}
                                  </p>
                                </div>

                                <p style={{ fontSize: "13px", fontWeight: 800, color: "#2563eb", flexShrink: 0 }}>
                                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery address */}
                        <div style={{
                          background: isDark ? "rgba(255,255,255,.04)" : "#fff",
                          border: `1px solid ${border}`,
                          borderRadius: "14px",
                          padding: "12px 14px",
                        }}>
                          <p style={{
                            fontSize: "11px", fontWeight: 700,
                            color: textSec, textTransform: "uppercase",
                            letterSpacing: "0.08em", marginBottom: "6px",
                          }}>
                            📍 Delivery Address
                          </p>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: textPri, margin: 0 }}>
                            {order.full_name}
                          </p>
                          <p style={{ fontSize: "12px", color: textSec, margin: "3px 0 0", lineHeight: 1.5 }}>
                            {order.address}, {order.city} - {order.pincode}
                          </p>
                          {order.phone && (
                            <p style={{ fontSize: "12px", color: textSec, margin: "3px 0 0" }}>
                              📞 {order.phone}
                            </p>
                          )}
                        </div>

                        {/* Payment ID if exists */}
                        {order.razorpay_order_id && (
                          <div style={{
                            background: isDark ? "rgba(37,99,235,.08)" : "rgba(37,99,235,.04)",
                            border: "1px solid rgba(37,99,235,.12)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                          }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                              Payment ID
                            </p>
                            <p style={{ fontSize: "12px", color: textSec, margin: "3px 0 0", fontFamily: "monospace" }}>
                              {order.razorpay_order_id}
                            </p>
                          </div>
                        )}

                        {/* Total summary */}
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: `1px solid ${border}`, paddingTop: "12px",
                        }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: textSec }}>
                            Total Paid
                          </span>
                          <span style={{ fontSize: "20px", fontWeight: 900, color: textPri }}>
                            ₹{order.total_amount?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}