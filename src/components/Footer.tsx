import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ACCENT     = "#2563eb";
const ACCENT_RGB = "37,99,235";

const QUICK_LINKS = [
  { label: "Home",       to: "/" },
  { label: "Shop",       to: "/shop" },
  { label: "About Us",   to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "My Orders",  to: "/orders" },
  { label: "My Profile", to: "/profile" },
  { label: "FAQ",        to: "/faq" },
  { label: "Wishlist",   to: "/wishlist" },
];

const INFO_LINKS = [
  { label: "Privacy Policy",   to: "/privacy" },
  { label: "Refund Policy",    to: "/refund" },
  { label: "Shipping Policy",  to: "/shipping" },
  { label: "Terms of Service", to: "/terms" },
];

const CATEGORIES = [
  { label: "Shirts",        to: "/shop?cat=Shirt" },
  { label: "T-Shirts",      to: "/shop?cat=T-Shirts" },
  { label: "Jeans",         to: "/shop?cat=Jeans" },
  { label: "Kurta",         to: "/shop?cat=Kurta" },
  { label: "Denim Jackets", to: "/shop?cat=Denim Jackets" },
  { label: "Coats",         to: "/shop?cat=Coats" },
  { label: "Belts",         to: "/shop?cat=Belts" },
];

const CONTACT_DETAILS = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "Store Address",
    text: "Near Gulshan Islam School, Sakinaka, 90 Feet Road, Kurla, Mumbai – 400072",
    href: "https://maps.google.com/?q=Sakinaka+90+Feet+Road+Kurla+Mumbai+400072",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.93-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
      </svg>
    ),
    label: "WhatsApp / Call",
    text: "+91 72084 28589",
    href: "https://wa.me/917208428589",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: "Email Us",
    text: "xoneboutique.official@gmail.com",
    href: "mailto:xoneboutique.official@gmail.com",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: "Store Timings",
    text: "Mon – Sun: 12:00 PM – 8:00 PM",
    href: null,
  },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/xoneboutique.in",
    color: "#e1306c",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/917208428589",
    color: "#25d366",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.121 1.532 5.857L.057 23.882l6.187-1.453A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.001-1.371l-.36-.213-3.664.861.882-3.573-.233-.373A9.786 9.786 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/xoneboutique",
    color: "#1877f2",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@xoneboutique",
    color: "#ff0000",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

const TRUST = [
  { icon: "🚚", label: "Free Shipping",  sub: "On orders ₹999+" },
  { icon: "↩️", label: "Easy Returns",   sub: "7-day return policy" },
  { icon: "🔒", label: "Secure Pay",     sub: "100% safe checkout" },
  { icon: "🏷️", label: "Best Price",    sub: "Starting ₹399" },
];

export default function Footer() {
  const [isDark,     setIsDark]     = useState(false);
  const [email,      setEmail]      = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [visible,    setVisible]    = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () =>
      setIsDark(
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme:dark)").matches
      );
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    mq.addEventListener("change", check);
    return () => { obs.disconnect(); mq.removeEventListener("change", check); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.04 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg       = isDark ? "#06080f"               : "#f0f4ff";
  const cardBg   = isDark ? "rgba(255,255,255,.04)"  : "rgba(255,255,255,.85)";
  const bord     = isDark ? "rgba(255,255,255,.07)"  : "rgba(15,23,42,.08)";
  const textPri  = isDark ? "#f1f5f9"               : "#0f172a";
  const textMid  = isDark ? "rgba(255,255,255,.50)"  : "rgba(15,23,42,.55)";
  const textDim  = isDark ? "rgba(255,255,255,.22)"  : "rgba(15,23,42,.28)";
  const inputBg  = isDark ? "rgba(255,255,255,.06)"  : "#fff";
  const inputBord= isDark ? "rgba(255,255,255,.1)"   : "rgba(15,23,42,.12)";
  const divider  = isDark ? "rgba(255,255,255,.06)"  : "rgba(15,23,42,.07)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;900&display=swap');

        .xft *, .xft *::before, .xft *::after { box-sizing:border-box; margin:0; padding:0; }
        .xft { font-family:'Outfit',sans-serif; }
        .xft .xbb { font-family:'Bebas Neue',sans-serif; }

        @keyframes ftUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        .fvis .fa1{animation:ftUp .6s .05s both}
        .fvis .fa2{animation:ftUp .6s .12s both}
        .fvis .fa3{animation:ftUp .6s .19s both}
        .fvis .fa4{animation:ftUp .6s .26s both}
        .fvis .fa5{animation:ftUp .6s .33s both}
        .fvis .fa6{animation:ftUp .6s .40s both}

        .flink {
          transition: color .18s ease, transform .18s ease, padding-left .18s ease;
          display: inline-flex; align-items: center; gap: 6px;
          text-decoration: none;
        }
        .flink:hover { color:${ACCENT} !important; padding-left: 4px; }

        .fsoc {
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease, color .2s ease;
          text-decoration: none;
        }
        .fsoc:hover {
          transform: translateY(-3px);
        }

        .ftrust {
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .ftrust:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(${ACCENT_RGB},.12) !important;
        }

        .fnlinput { transition: border-color .2s ease, box-shadow .2s ease; }
        .fnlinput:focus {
          outline: none;
          border-color: ${ACCENT} !important;
          box-shadow: 0 0 0 3px rgba(${ACCENT_RGB},.12);
        }

        /* Grid responsive */
        .ft-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media(min-width: 640px) {
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
        }
        @media(min-width: 1024px) {
          .ft-grid { grid-template-columns: 1.8fr 1fr 1fr 1fr 1.5fr; gap: 40px; }
        }

        .trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media(min-width: 768px) { .trust-grid { grid-template-columns: repeat(4,1fr); } }

        @keyframes xGlow { 0%,100%{opacity:.4} 50%{opacity:.75} }
        .xglow { animation: xGlow 5s ease-in-out infinite; }

        /* contact hover */
        .fcontact-link { transition: color .18s ease; }
        .fcontact-link:hover { color: ${ACCENT} !important; }

        /* insta special */
        .fsoc-insta:hover { box-shadow: 0 8px 24px rgba(225,48,108,.3) !important; border-color: #e1306c !important; color: #e1306c !important; background: rgba(225,48,108,.1) !important; }
        .fsoc-wa:hover    { box-shadow: 0 8px 24px rgba(37,211,102,.3) !important; border-color: #25d366 !important; color: #25d366 !important; background: rgba(37,211,102,.1) !important; }
        .fsoc-fb:hover    { box-shadow: 0 8px 24px rgba(24,119,242,.3) !important; border-color: #1877f2 !important; color: #1877f2 !important; background: rgba(24,119,242,.1) !important; }
        .fsoc-yt:hover    { box-shadow: 0 8px 24px rgba(255,0,0,.3)    !important; border-color: #ff0000 !important; color: #ff0000 !important; background: rgba(255,0,0,.1) !important; }
      `}</style>

      <footer
        ref={ref}
        className={`xft relative overflow-hidden ${visible ? "fvis" : ""}`}
        style={{
          background: bg,
          borderTop: `1px solid ${divider}`,
          borderRadius: "28px 28px 0 0",
          marginTop: "-2px",
        }}
      >
        {/* BG glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="xglow absolute" style={{ width:"65vw", height:"55vh", top:"-25%", left:"-10%", background:`radial-gradient(ellipse,rgba(${ACCENT_RGB},.09) 0%,transparent 70%)`, filter:"blur(70px)" }} />
          <div className="xglow absolute" style={{ width:"40vw", height:"40vh", bottom:"0", right:"-5%", background:`radial-gradient(ellipse,rgba(${ACCENT_RGB},.07) 0%,transparent 70%)`, filter:"blur(55px)" }} />
        </div>

        <div className="relative" style={{ zIndex: 1 }}>

          {/* ══ NEWSLETTER + TRUST ══ */}
          <div style={{ padding: "44px 24px 36px", borderBottom: `1px solid ${divider}` }}>

            {/* Newsletter */}
            <div className="fa1" style={{ maxWidth: "520px", margin: "0 auto 36px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em", color: ACCENT, textTransform: "uppercase", marginBottom: "8px" }}>
                Newsletter
              </p>
              <div className="xbb" style={{ fontSize: "clamp(26px,5vw,42px)", color: textPri, letterSpacing: "0.02em", lineHeight: 1, marginBottom: "10px" }}>
                JOIN THE <span style={{ color: ACCENT }}>CLUB</span>
              </div>
              <p style={{ fontSize: "14px", color: textMid, marginBottom: "20px", lineHeight: 1.65 }}>
                Get exclusive deals, new arrivals & style tips straight to your inbox.
              </p>
              {subscribed ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 22px", borderRadius: "16px", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", color: "#22c55e", fontWeight: 700, fontSize: "14px" }}>
                  ✓ You're subscribed! Welcome to the club 🎉
                </div>
              ) : (
                <form
                  onSubmit={e => { e.preventDefault(); if (email.trim()) { setSubscribed(true); setEmail(""); } }}
                  style={{ display: "flex", gap: "10px", maxWidth: "420px", margin: "0 auto", flexWrap: "wrap" }}
                >
                  <input
                    type="email" value={email} required
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="fnlinput"
                    style={{ flex: 1, minWidth: "180px", padding: "13px 16px", borderRadius: "14px", background: inputBg, border: `1.5px solid ${inputBord}`, color: textPri, fontSize: "14px", fontFamily: "inherit" }}
                  />
                  <button type="submit" style={{ padding: "13px 22px", borderRadius: "14px", background: `linear-gradient(135deg,${ACCENT},#4f46e5)`, color: "#fff", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 6px 20px rgba(${ACCENT_RGB},.4)`, whiteSpace: "nowrap" }}>
                    Subscribe →
                  </button>
                </form>
              )}
            </div>

            {/* Trust badges */}
            <div className="trust-grid fa2" style={{ maxWidth: "960px", margin: "0 auto" }}>
              {TRUST.map((t, i) => (
                <div key={i} className="ftrust" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", background: cardBg, border: `1px solid ${bord}`, backdropFilter: "blur(12px)" }}>
                  <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "13px", color: textPri }}>{t.label}</p>
                    <p style={{ fontSize: "11px", color: textMid, marginTop: "2px" }}>{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ MAIN GRID ══ */}
          <div className="ft-grid" style={{ padding: "40px 24px" }}>

            {/* ── Brand col ── */}
            <div className="fa3">
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg,${ACCENT},#4f46e5)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "13px", color: "#fff", letterSpacing: "0.05em", boxShadow: `0 8px 24px rgba(${ACCENT_RGB},.4)`, flexShrink: 0 }}>
                  XOB
                </div>
                <div>
                  <div className="xbb" style={{ fontSize: "18px", color: textPri, letterSpacing: "0.04em", lineHeight: 1 }}>
                    X ONE <span style={{ color: ACCENT }}>BOUTIQUE</span>
                  </div>
                  <div style={{ fontSize: "10px", color: textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "3px" }}>
                    Premium Men's Fashion
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "13px", color: textMid, lineHeight: 1.75, maxWidth: "270px", marginBottom: "20px" }}>
                Premium men's fashion crafted with precision stitching and high-grade breathable fabrics — designed for the modern Indian man.
              </p>

              {/* Social icons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {SOCIALS.map((s, i) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`fsoc fsoc-${["insta","wa","fb","yt"][i]}`}
                    style={{ width: "38px", height: "38px", borderRadius: "11px", background: cardBg, border: `1px solid ${bord}`, backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", color: textMid }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* Instagram handle badge */}
              <a
                href="https://instagram.com/xoneboutique.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 12px", borderRadius: "20px", background: "linear-gradient(135deg,rgba(225,48,108,.12),rgba(253,92,99,.08))", border: "1px solid rgba(225,48,108,.2)", textDecoration: "none", fontSize: "11px", fontWeight: 700, color: "#e1306c", marginBottom: "14px" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                @xoneboutique.in
              </a>

              {/* Timing */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: textMid }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span><strong style={{ color: textPri }}>Store Hours:</strong> Mon–Sun, 12:00 PM – 8:00 PM</span>
              </div>
            </div>

            {/* ── Quick Links ── */}
            <div className="fa3">
              <p className="xbb" style={{ fontSize: "14px", color: textPri, letterSpacing: "0.1em", marginBottom: "16px", paddingBottom: "10px", borderBottom: `1px solid ${divider}` }}>
                QUICK LINKS
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {QUICK_LINKS.map(l => (
                  <Link key={l.label} to={l.to} className="flink" style={{ fontSize: "13px", color: textMid }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Information ── */}
            <div className="fa4">
              <p className="xbb" style={{ fontSize: "14px", color: textPri, letterSpacing: "0.1em", marginBottom: "16px", paddingBottom: "10px", borderBottom: `1px solid ${divider}` }}>
                INFORMATION
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {INFO_LINKS.map(l => (
                  <Link key={l.label} to={l.to} className="flink" style={{ fontSize: "13px", color: textMid }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Categories ── */}
            <div className="fa4">
              <p className="xbb" style={{ fontSize: "14px", color: textPri, letterSpacing: "0.1em", marginBottom: "16px", paddingBottom: "10px", borderBottom: `1px solid ${divider}` }}>
                SHOP BY CATEGORY
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {CATEGORIES.map(c => (
                  <Link key={c.label} to={c.to} className="flink" style={{ fontSize: "13px", color: textMid }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Contact ── */}
            <div className="fa5">
              <p className="xbb" style={{ fontSize: "14px", color: textPri, letterSpacing: "0.1em", marginBottom: "16px", paddingBottom: "10px", borderBottom: `1px solid ${divider}` }}>
                GET IN TOUCH
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                {CONTACT_DETAILS.map((c, i) => (
                  <div key={i}>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="fcontact-link"
                        style={{ display: "flex", alignItems: "flex-start", gap: "10px", textDecoration: "none", color: textMid }}
                      >
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `rgba(${ACCENT_RGB},.1)`, border: `1px solid rgba(${ACCENT_RGB},.18)`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, flexShrink: 0, marginTop: "1px" }}>
                          {c.icon}
                        </div>
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "2px" }}>{c.label}</p>
                          <p style={{ fontSize: "12px", lineHeight: 1.55 }}>{c.text}</p>
                        </div>
                      </a>
                    ) : (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: textMid }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `rgba(${ACCENT_RGB},.1)`, border: `1px solid rgba(${ACCENT_RGB},.18)`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, flexShrink: 0, marginTop: "1px" }}>
                          {c.icon}
                        </div>
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "2px" }}>{c.label}</p>
                          <p style={{ fontSize: "12px", lineHeight: 1.55 }}>{c.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Trust pills */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["COD Available", "Easy Returns", "Secure Checkout"].map(b => (
                  <span key={b} style={{ padding: "5px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, background: `rgba(${ACCENT_RGB},.08)`, border: `1px solid rgba(${ACCENT_RGB},.18)`, color: ACCENT }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ══ BOTTOM BAR ══ */}
          <div
            className="fa6"
            style={{ borderTop: `1px solid ${divider}`, padding: "16px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}
          >
            <p style={{ fontSize: "12px", color: textDim }}>
              © {new Date().getFullYear()} X One Boutique. All rights reserved. Made with ❤️ in Mumbai.
            </p>

            {/* Payment methods */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: textDim, marginRight: "2px" }}>We accept:</span>
              {["UPI", "Visa", "Mastercard", "COD", "Paytm"].map(p => (
                <span key={p} style={{ padding: "3px 9px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, background: cardBg, border: `1px solid ${bord}`, color: textMid, backdropFilter: "blur(8px)" }}>
                  {p}
                </span>
              ))}
            </div>

            {/* Policy links */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              {INFO_LINKS.map(l => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{ fontSize: "11px", color: textDim, textDecoration: "none", transition: "color .18s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
                  onMouseLeave={e => (e.currentTarget.style.color = textDim)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}