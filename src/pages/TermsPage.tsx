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

export default function TermsPage() {
  const isDark = useIsDark();
  const bg   = isDark ? "#06080f" : "#f8faff";
  const card = isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)";
  const bord = isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.09)";
  const pri  = isDark ? "#f1f5f9" : "#0f172a";
  const sec  = isDark ? "rgba(255,255,255,.55)" : "rgba(15,23,42,.55)";

  const sections = [
  { title: "1. Acceptance of Terms", body: "By accessing or using X One Boutique website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services." },
  { title: "2. Use of the Website", body: "• You must be 18 years or older to make purchases\n• You are responsible for maintaining the confidentiality of your account credentials\n• You agree not to use the platform for any unlawful purpose\n• We reserve the right to terminate accounts that violate these terms" },
  { title: "3. Product Information", body: "We make every effort to display accurate product descriptions, colors, and sizes. However, slight variations may occur due to screen settings and photography.\n\nWe reserve the right to modify prices, products, and availability without prior notice." },
  { title: "4. Orders and Payment", body: "• All prices are in Indian Rupees (₹) inclusive of applicable taxes\n• Orders are confirmed only after successful payment\n• We reserve the right to cancel orders in case of pricing errors or stock unavailability\n• You will receive a full refund if we cancel your order" },
  { title: "5. Intellectual Property", body: "All content on this website — including logos, images, product descriptions, and designs — is the property of X One Boutique and protected by copyright law. Unauthorized use is strictly prohibited." },
  { title: "6. Limitation of Liability", body: "X One Boutique is not liable for:\n• Indirect or consequential damages\n• Loss of data or profits\n• Delays beyond our control (natural disasters, strikes, etc.)\n\nOur maximum liability is limited to the value of the order placed." },
  { title: "7. Governing Law", body: "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Mumbai, Maharashtra." }
];

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit',sans-serif", paddingBottom: "80px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap');`}</style>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#4f46e5 100%)", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)" }} />
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,8vw,80px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 12px", position: "relative" }}>
          TERMS OF SERVICE
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,.7)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6, position: "relative" }}>
          Please read these terms carefully before using our platform.
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