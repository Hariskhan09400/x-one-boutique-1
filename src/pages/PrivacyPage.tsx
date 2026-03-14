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

export default function PrivacyPage() {
  const isDark = useIsDark();
  const bg   = isDark ? "#06080f" : "#f8faff";
  const card = isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)";
  const bord = isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.09)";
  const pri  = isDark ? "#f1f5f9" : "#0f172a";
  const sec  = isDark ? "rgba(255,255,255,.55)" : "rgba(15,23,42,.55)";

  const sections = [
  { title: "1. Information We Collect", body: "We collect information you provide directly: name, email, phone, and shipping address when placing an order.\n\nWe also collect browsing data, device type, and IP address through cookies to improve your experience." },
  { title: "2. How We Use Your Information", body: "• To process and deliver your orders\n• To send order confirmations and shipping updates\n• To respond to customer service requests\n• To improve our website and products\n• To send promotional emails (only with your consent)" },
  { title: "3. Sharing Your Information", body: "We do not sell your personal data. We share information only with:\n• Delivery partners to fulfill your orders\n• Payment gateways to process transactions securely\n• Analytics services to improve our platform\n\nAll partners are bound by confidentiality agreements." },
  { title: "4. Data Security", body: "We use industry-standard SSL encryption for all transactions. Your payment details are never stored on our servers — they are processed directly by secure payment gateways." },
  { title: "5. Cookies", body: "We use cookies to remember your cart, preferences, and to analyze traffic. You can disable cookies in your browser settings, though some features may not work as expected." },
  { title: "6. Your Rights", body: "You have the right to:\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your account and data\n• Opt out of marketing communications at any time\n\nContact us at support@xoneboutique.com to exercise these rights." },
  { title: "7. Contact Us", body: "For privacy concerns, write to us at:\n📧 support@xoneboutique.com\n📞 +91-9372446209\n📍 Murdha Village, Bhaindar West, Thane 401101" }
];

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit',sans-serif", paddingBottom: "80px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap');`}</style>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#4f46e5 100%)", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)" }} />
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,8vw,80px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 12px", position: "relative" }}>
          PRIVACY POLICY
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,.7)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6, position: "relative" }}>
          How we collect, use, and protect your information.
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