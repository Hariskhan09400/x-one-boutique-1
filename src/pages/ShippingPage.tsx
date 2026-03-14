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

const SECTIONS = [
  {
    title: "Delivery Timelines",
    body: "Metro cities (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad): 2-4 business days.\n\nTier 2 and Tier 3 cities: 4-6 business days.\n\nRemote or rural areas: 6-9 business days.\n\nOrders are processed within 24 hours of placement, excluding Sundays and public holidays.",
  },
  {
    title: "Shipping Charges",
    body: "Free shipping on all orders above Rs. 999.\n\nFlat Rs. 60 shipping fee for orders below Rs. 999.\n\nNo hidden charges — what you see at checkout is what you pay.",
  },
  {
    title: "Cash on Delivery (COD)",
    body: "COD is available across most pin codes in India. A small COD handling fee of Rs. 30 may apply.\n\nTo check COD availability for your area, enter your pin code on the product page.",
  },
  {
    title: "Order Tracking",
    body: "Once your order is shipped, you will receive an SMS with a tracking link and an email with tracking details.\n\nYou can also track your order from the My Orders section of your account.",
  },
  {
    title: "Failed Delivery",
    body: "If delivery fails due to incorrect address or customer unavailability, the courier will attempt delivery 2 more times.\n\nAfter 3 failed attempts, the package will be returned to us. Re-shipping charges may apply for failed delivery returns.",
  },
  {
    title: "Damaged in Transit",
    body: "If your order arrives damaged, please refuse delivery and contact us immediately at support@xoneboutique.com with photos.\n\nWe will arrange a replacement at no cost to you.",
  },
];

export default function ShippingPage() {
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
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,8vw,80px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 12px", position: "relative" }}>
          SHIPPING <span style={{ color: "#93c5fd" }}>POLICY</span>
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,.7)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6, position: "relative" }}>
          Fast, reliable delivery across India.
        </p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ padding: "28px", borderRadius: "20px", background: card, border: `1px solid ${bord}`, backdropFilter: "blur(12px)" }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", color: "#2563eb", letterSpacing: "0.06em", marginBottom: "12px" }}>
              {s.title}
            </h2>
            <p style={{ fontSize: "14px", color: sec, lineHeight: 1.85, whiteSpace: "pre-line", margin: 0 }}>
              {s.body}
            </p>
          </div>
        ))}

        <p style={{ fontSize: "12px", color: sec, textAlign: "center", paddingTop: "8px" }}>
          Last updated: March 2025 · X One Boutique, Mumbai
        </p>
      </div>
    </div>
  );
}