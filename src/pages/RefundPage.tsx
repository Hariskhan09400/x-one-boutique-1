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

export default function RefundPage() {
  const isDark = useIsDark();
  const bg   = isDark ? "#06080f" : "#f8faff";
  const card = isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)";
  const bord = isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.09)";
  const pri  = isDark ? "#f1f5f9" : "#0f172a";
  const sec  = isDark ? "rgba(255,255,255,.55)" : "rgba(15,23,42,.55)";

  const sections = [
  { title: "7-Day Return Policy", body: "We offer a 7-day return window from the date of delivery. If you are not 100% satisfied with your purchase, you can return it within 7 days for a full refund or exchange." },
  { title: "Conditions for Return", body: "• Item must be unused and in original condition\n• All tags must be intact\n• Item must be in original packaging\n• Proof of purchase (order ID) required\n\nItems that are worn, washed, damaged, or altered will not be accepted." },
  { title: "Non-Returnable Items", body: "• Items purchased during clearance / final sale\n• Belts and accessories (for hygiene reasons)\n• Items marked as non-returnable at the time of purchase" },
  { title: "How to Initiate a Return", body: "1. Contact us within 7 days of delivery at support@xoneboutique.com\n2. Share your Order ID and reason for return with photos\n3. Our team will review and approve within 24-48 hours\n4. Ship the item to our address with the return slip\n5. Refund processed within 5-7 business days after we receive the item" },
  { title: "Refund Process", body: "• Online payments: Refunded to original payment method within 5-7 business days\n• COD orders: Refunded via bank transfer / UPI within 5-7 business days\n• Shipping charges are non-refundable unless the return is due to our error" },
  { title: "Damaged / Wrong Item", body: "If you received a damaged or wrong item, contact us immediately with photos. We will arrange a free pickup and send a replacement or full refund at no extra cost." }
];

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit',sans-serif", paddingBottom: "80px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap');`}</style>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#4f46e5 100%)", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)" }} />
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,8vw,80px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 12px", position: "relative" }}>
          REFUND POLICY
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,.7)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6, position: "relative" }}>
          Hassle-free returns and refunds. Your satisfaction guaranteed.
        </p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 0", display: "flex", flexDirection: "column", gap: "20px" }}>
        {sections.map((s: any, i: number) => (
          <div key={i} style={{ padding: "28px", borderRadius: "20px", background: card, border: `1px solid ${bord}`, backdropFilter: "blur(12px)" }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", color: "#2563eb", letterSpacing: "0.06em", marginBottom: "12px" }}>{s.title}</h2>
            <p style={{ fontSize: "14px", color: sec, lineHeight: 1.85, whiteSpace: "pre-line" }}>{s.body}</p>
          </div>
        ))}
        <p style={{ fontSize: "12px", color: sec, textAlign: "center", paddingTop: "8px" }}>
          Last updated: March 2025 · X One Boutique, Mumbai
        </p>
      </div>
    </div>
  );
}