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

const FAQS = [
  { q: "Do you offer Cash on Delivery (COD)?", a: "Yes! COD is available across most pin codes in India. A small handling fee of ₹30 may apply. You can check COD availability on the product page by entering your pin code." },
  { q: "What is your return policy?", a: "We offer a 7-day return window from the date of delivery. Items must be unused, unwashed, with all tags intact. Initiate your return by emailing support@xoneboutique.com with your Order ID." },
  { q: "How long does delivery take?", a: "Metro cities: 2-4 business days\nTier 2 & 3 cities: 4-6 business days\nRemote areas: 6-9 business days\n\nOrders are processed within 24 hours (excluding Sundays & holidays)." },
  { q: "Is shipping free?", a: "Free shipping on all orders above ₹999. A flat ₹60 fee applies for orders below ₹999. No hidden charges." },
  { q: "How do I track my order?", a: "Once shipped, you'll receive an SMS and email with a tracking link. You can also track your order from the 'My Orders' section of your account." },
  { q: "Can I exchange a product for a different size?", a: "Yes! Contact us within 7 days of delivery. We'll arrange a pickup and send the correct size — subject to availability. Email support@xoneboutique.com with your order ID and size preference." },
  { q: "What payment methods do you accept?", a: "We accept:\n• UPI (GPay, PhonePe, Paytm)\n• Credit / Debit Cards (Visa, Mastercard)\n• Net Banking\n• Cash on Delivery (COD)" },
  { q: "How do I cancel my order?", a: "Orders can be cancelled within 6 hours of placement. After that, the order goes into processing. Contact us immediately at support@xoneboutique.com or call +91-9372446209." },
  { q: "Are the products genuine?", a: "Absolutely. All products are 100% original, manufactured in-house with premium fabrics and quality stitching. We do not sell any third-party or grey-market products." },
  { q: "How do I know my correct size?", a: "Each product has a size guide with measurements. We recommend measuring your chest, waist, and length and comparing with the chart. When in doubt, size up!" },
];

export default function FAQPage() {
  const isDark = useIsDark();
  const [open, setOpen] = useState<number | null>(null);

  const bg   = isDark ? "#06080f" : "#f8faff";
  const card = isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)";
  const bord = isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.09)";
  const pri  = isDark ? "#f1f5f9" : "#0f172a";
  const sec  = isDark ? "rgba(255,255,255,.55)" : "rgba(15,23,42,.55)";
  const hov  = isDark ? "rgba(255,255,255,.06)" : "rgba(37,99,235,.04)";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit',sans-serif", paddingBottom: "80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap');
        @keyframes faqOpen { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .faq-body { animation: faqOpen .25s ease both; }
      `}</style>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#4f46e5 100%)", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)" }} />
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,9vw,88px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 12px", position: "relative" }}>
          FREQUENTLY ASKED <span style={{ color: "#93c5fd" }}>QUESTIONS</span>
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,.75)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6, position: "relative" }}>
          Everything you need to know about shopping with us.
        </p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
        {FAQS.map((faq, i) => (
          <div key={i}
            style={{ borderRadius: "18px", background: open === i ? card : "transparent", border: `1px solid ${open === i ? "#2563eb" : bord}`, backdropFilter: open === i ? "blur(12px)" : "none", overflow: "hidden", transition: "all .2s ease" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "18px 22px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: open === i ? "#2563eb" : pri, lineHeight: 1.4 }}>{faq.q}</span>
              <span style={{ flexShrink: 0, width: "24px", height: "24px", borderRadius: "8px", background: open === i ? "rgba(37,99,235,.15)" : "transparent", border: `1px solid ${open === i ? "#2563eb" : bord}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={open === i ? "#2563eb" : sec} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </span>
            </button>
            {open === i && (
              <div className="faq-body" style={{ padding: "0 22px 20px" }}>
                <p style={{ fontSize: "14px", color: sec, lineHeight: 1.85, whiteSpace: "pre-line", margin: 0 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: "24px", padding: "28px", borderRadius: "20px", background: card, border: `1px solid ${bord}`, textAlign: "center", backdropFilter: "blur(12px)" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: pri, marginBottom: "8px" }}>Still have questions?</p>
          <p style={{ fontSize: "13px", color: sec, marginBottom: "16px" }}>Our support team is available Mon–Sun, 12pm – 8pm</p>
          <a href="mailto:support@xoneboutique.com"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "14px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: 700, fontSize: "14px", textDecoration: "none", boxShadow: "0 6px 20px rgba(37,99,235,.4)" }}>
            📧 Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}