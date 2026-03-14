import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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

export default function ContactPage() {
  const isDark = useIsDark();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const bg   = isDark ? "#06080f" : "#f8faff";
  const card = isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)";
  const bord = isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.09)";
  const pri  = isDark ? "#f1f5f9" : "#0f172a";
  const sec  = isDark ? "rgba(255,255,255,.55)" : "rgba(15,23,42,.55)";
  const inp  = isDark ? "rgba(255,255,255,.06)" : "#fff";
  const inpB = isDark ? "rgba(255,255,255,.1)"  : "rgba(15,23,42,.12)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Message sent! We'll reply within 24 hours. 📧");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const iStyle: React.CSSProperties = { padding: "13px 16px", borderRadius: "14px", background: inp, border: `1.5px solid ${inpB}`, color: pri, fontSize: "14px", fontFamily: "inherit", width: "100%", outline: "none", transition: "border-color .2s" };

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit',sans-serif", paddingBottom: "80px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#4f46e5 100%)", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)" }} />
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,9vw,88px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 12px", position: "relative" }}>
          CONTACT <span style={{ color: "#93c5fd" }}>US</span>
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,.75)", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6, position: "relative" }}>
          We're here to help. Reach out anytime!
        </p>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px 0", display: "flex", flexDirection: "column", gap: "28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" }}>
          {[
            { icon: "📍", title: "Location", text: "S NO 9/A H NO 14, Murdha Village, Uttan Road, Bhaindar West, Thane 401101" },
            { icon: "📞", title: "Phone",    text: "+91-9372446209" },
            { icon: "📧", title: "Email",    text: "support@xoneboutique.com" },
            { icon: "🕐", title: "Timings",  text: "Mon–Sun: 12:00 pm – 8:00 pm" },
          ].map((c, i) => (
            <div key={i} style={{ padding: "20px", borderRadius: "18px", background: card, border: `1px solid ${bord}`, backdropFilter: "blur(12px)" }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>{c.icon}</div>
              <p style={{ fontWeight: 700, fontSize: "13px", color: "#2563eb", marginBottom: "6px" }}>{c.title}</p>
              <p style={{ fontSize: "13px", color: sec, lineHeight: 1.6 }}>{c.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "32px", borderRadius: "24px", background: card, border: `1px solid ${bord}`, backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", color: pri, letterSpacing: "0.06em" }}>SEND A MESSAGE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <input style={iStyle} placeholder="Your Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = inpB} />
            <input style={iStyle} type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = inpB} />
          </div>
          <input style={iStyle} placeholder="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = inpB} />
          <textarea style={{ ...iStyle, resize: "vertical", minHeight: "130px" }} placeholder="Your message..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "#2563eb"} onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = inpB} />
          <button type="submit" disabled={loading} style={{ padding: "14px", borderRadius: "14px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(37,99,235,.4)", opacity: loading ? .6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <><span style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "inline-block" }} />Sending...</> : "Send Message →"}
          </button>
        </form>
      </div>
    </div>
  );
}