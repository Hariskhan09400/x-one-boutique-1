import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function useIsDark() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const check = () => setD(document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme:dark)").matches);
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return d;
}

export default function AboutPage() {
  const isDark = useIsDark();
  const bg   = isDark ? "#06080f" : "#f8faff";
  const card = isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)";
  const bord = isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.09)";
  const sec  = isDark ? "rgba(255,255,255,.55)" : "rgba(15,23,42,.55)";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit',sans-serif", paddingBottom: "80px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap');`}</style>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#4f46e5 100%)", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)" }} />
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,9vw,88px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 12px", position: "relative" }}>
          ABOUT <span style={{ color: "#93c5fd" }}>US</span>
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,.75)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6, position: "relative" }}>
          Premium men's fashion — crafted with purpose, worn with pride.
        </p>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "48px" }}>
          {[
            { title: "Our Story", icon: "✦", text: "X One Boutique was born from a simple belief — every man deserves to look and feel his best without breaking the bank. Founded in Mumbai, we started as a small curated menswear store and grew into a brand trusted by over 4 lakh+ customers across India." },
            { title: "Our Mission", icon: "◈", text: "We craft premium menswear using high-grade breathable fabrics and precision stitching. Every piece is designed for the modern Indian man — versatile enough for office, casual enough for weekends, sharp enough for every occasion." },
            { title: "Why Choose Us", icon: "◆", text: "From ₹399 shirts to premium denim jackets, our range covers every style and budget. We offer COD, easy 7-day returns, and free shipping above ₹999 — because we believe in zero-risk fashion." },
          ].map((s, i) => (
            <div key={i} style={{ padding: "28px", borderRadius: "20px", background: card, border: `1px solid ${bord}`, backdropFilter: "blur(12px)" }}>
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>{s.icon}</div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "22px", color: "#2563eb", letterSpacing: "0.06em", marginBottom: "10px" }}>{s.title}</h2>
              <p style={{ fontSize: "14px", color: sec, lineHeight: 1.8 }}>{s.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "14px", marginBottom: "48px" }}>
          {[["4Lakh+","Happy Customers"],["500+","Premium Styles"],["₹399","Starting Price"],["7-Day","Easy Returns"]].map(([v,l],i) => (
            <div key={i} style={{ padding: "24px", borderRadius: "20px", background: card, border: `1px solid ${bord}`, textAlign: "center", backdropFilter: "blur(12px)" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "36px", color: "#2563eb" }}>{v}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: sec, marginTop: "4px" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link to="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "16px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: 700, fontSize: "15px", textDecoration: "none", boxShadow: "0 8px 24px rgba(37,99,235,.4)" }}>
            Shop Now →
          </Link>
        </div>
      </div>
    </div>
  );
}