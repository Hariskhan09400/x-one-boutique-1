// src/pages/SettingsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import toast from "react-hot-toast";
import {
  Moon, Sun, Type, Eye, Bell, Shield, Palette,
  Globe, Smartphone, ChevronLeft, Check,
  Volume2, VolumeX, Zap, Layout, RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  Settings stored per user in localStorage
// ─────────────────────────────────────────────────────────────
interface UserSettings {
  darkMode:        boolean;
  fontSize:        "small" | "medium" | "large" | "xlarge";
  brightness:      number;   // 60–100
  accentColor:     string;
  animations:      boolean;
  notifications:   boolean;
  soundEffects:    boolean;
  compactMode:     boolean;
  language:        string;
  currency:        string;
  autoPlayVideos:  boolean;
  highContrast:    boolean;
  reducedMotion:   boolean;
}

const DEFAULTS: UserSettings = {
  darkMode:       false,
  fontSize:       "medium",
  brightness:     100,
  accentColor:    "#2563eb",
  animations:     true,
  notifications:  true,
  soundEffects:   false,
  compactMode:    false,
  language:       "English",
  currency:       "INR ₹",
  autoPlayVideos: false,
  highContrast:   false,
  reducedMotion:  false,
};

const ACCENT_COLORS = [
  { label: "Blue",    value: "#2563eb" },
  { label: "Indigo",  value: "#4f46e5" },
  { label: "Purple",  value: "#7c3aed" },
  { label: "Pink",    value: "#db2777" },
  { label: "Red",     value: "#dc2626" },
  { label: "Orange",  value: "#ea580c" },
  { label: "Green",   value: "#16a34a" },
  { label: "Teal",    value: "#0d9488" },
];

const FONT_SIZES = [
  { label: "Small",   value: "small",   px: "13px" },
  { label: "Medium",  value: "medium",  px: "15px" },
  { label: "Large",   value: "large",   px: "17px" },
  { label: "X-Large", value: "xlarge",  px: "20px" },
];

const LANGUAGES = ["English", "Hindi", "Urdu", "Bengali", "Tamil", "Telugu"];
const CURRENCIES = ["INR ₹", "USD $", "GBP £", "AED د.إ", "EUR €"];

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load settings from localStorage (per user)
  const settingsKey = user?.id ? `xob_settings_${user.id}` : "xob_settings_guest";

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(settingsKey);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  const [isDark, setIsDark] = useState(false);

  // Detect dark mode from html class
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Apply settings to DOM whenever they change
  useEffect(() => {
    // Dark mode
    document.documentElement.classList.toggle("dark", settings.darkMode);

    // Font size
    const fontMap = { small: "13px", medium: "15px", large: "17px", xlarge: "20px" };
    document.documentElement.style.fontSize = fontMap[settings.fontSize];

    // Brightness overlay
    let overlay = document.getElementById("xob-brightness-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "xob-brightness-overlay";
      overlay.style.cssText = `
        position: fixed; inset: 0; pointer-events: none;
        z-index: 99998; transition: opacity .3s;
        background: rgba(0,0,0,1);
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.opacity = String((100 - settings.brightness) / 100 * 0.5);

    // Accent color CSS variable
    document.documentElement.style.setProperty("--xob-accent", settings.accentColor);

    // Reduced motion
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty("--motion-duration", "0ms");
    } else {
      document.documentElement.style.removeProperty("--motion-duration");
    }

    // High contrast
    document.documentElement.classList.toggle("xob-high-contrast", settings.highContrast);

    // Save to localStorage
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings, settingsKey]);

  // Update a single setting
  const update = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Setting saved", { duration: 1200 });
  }, []);

  // Reset all settings
  const resetAll = () => {
    setSettings(DEFAULTS);
    localStorage.removeItem(settingsKey);
    toast.success("Settings reset to default ✅");
  };

  // Theme
  const bg      = isDark ? "#0f111a" : "#f4f6ff";
  const card    = isDark ? "#1a1d2e" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)";
  const textPri = isDark ? "#f1f5f9" : "#0f172a";
  const textSec = isDark ? "rgba(255,255,255,.45)" : "rgba(15,23,42,.5)";

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingBottom: "48px" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: isDark
          ? "linear-gradient(135deg,#1a1d2e,#0f111a)"
          : "linear-gradient(135deg,#1e3a8a,#2563eb)",
        padding: "clamp(20px,4vw,40px) clamp(16px,4vw,32px) 28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", background:"rgba(255,255,255,.04)", top:"-70px", right:"-50px", pointerEvents:"none" }} />

        <div style={{ maxWidth: "560px", margin: "0 auto", position: "relative" }}>
          <button onClick={() => navigate("/profile")} style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
            borderRadius: "10px", padding: "7px 14px",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", marginBottom: "16px",
          }}>
            <ChevronLeft size={14} /> Back
          </button>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(22px,4vw,30px)", margin: 0, letterSpacing: "-0.02em" }}>
            ⚙️ Settings
          </h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: "13px", margin: "5px 0 0" }}>
            Customize your experience
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px clamp(12px,4vw,20px) 0" }}>

        {/* ════ APPEARANCE ════ */}
        <SettingSection title="🎨 Appearance" isDark={isDark} card={card} border={border} textSec={textSec}>

          {/* Dark Mode */}
          <SettingRow
            label="Dark Mode"
            desc="Switch between light and dark theme"
            icon={settings.darkMode ? <Moon size={18} style={{ color: "#818cf8" }} /> : <Sun size={18} style={{ color: "#f59e0b" }} />}
            textPri={textPri} textSec={textSec} border={border}
          >
            <Toggle value={settings.darkMode} onChange={v => update("darkMode", v)} accent={settings.accentColor} />
          </SettingRow>

          {/* Accent Color */}
          <SettingRow
            label="Accent Color"
            desc="Primary color used across the app"
            icon={<Palette size={18} style={{ color: settings.accentColor }} />}
            textPri={textPri} textSec={textSec} border={border}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => update("accentColor", c.value)}
                  style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: c.value, border: "none", cursor: "pointer",
                    boxShadow: settings.accentColor === c.value ? `0 0 0 3px ${isDark ? "#0f111a" : "#fff"}, 0 0 0 5px ${c.value}` : "none",
                    transition: "all .2s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {settings.accentColor === c.value && <Check size={12} color="#fff" />}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* High Contrast */}
          <SettingRow
            label="High Contrast"
            desc="Increase text and element contrast"
            icon={<Eye size={18} style={{ color: "#6366f1" }} />}
            textPri={textPri} textSec={textSec} border={border}
          >
            <Toggle value={settings.highContrast} onChange={v => update("highContrast", v)} accent={settings.accentColor} />
          </SettingRow>

          {/* Compact Mode */}
          <SettingRow
            label="Compact Mode"
            desc="Reduce spacing for more content"
            icon={<Layout size={18} style={{ color: "#0891b2" }} />}
            textPri={textPri} textSec={textSec} border={border} last
          >
            <Toggle value={settings.compactMode} onChange={v => update("compactMode", v)} accent={settings.accentColor} />
          </SettingRow>
        </SettingSection>

        {/* ════ TEXT & DISPLAY ════ */}
        <SettingSection title="🔤 Text & Display" isDark={isDark} card={card} border={border} textSec={textSec}>

          {/* Font Size */}
          <SettingRow
            label="Font Size"
            desc="Adjust text size across the app"
            icon={<Type size={18} style={{ color: "#8b5cf6" }} />}
            textPri={textPri} textSec={textSec} border={border}
            vertical
          >
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {FONT_SIZES.map(f => (
                <button
                  key={f.value}
                  onClick={() => update("fontSize", f.value as any)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: "10px",
                    background: settings.fontSize === f.value ? settings.accentColor : (isDark ? "rgba(255,255,255,.06)" : "#f1f5f9"),
                    border: `1.5px solid ${settings.fontSize === f.value ? settings.accentColor : border}`,
                    color: settings.fontSize === f.value ? "#fff" : textSec,
                    fontSize: f.px, fontWeight: 700, cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  A
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              {FONT_SIZES.map(f => (
                <span key={f.value} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: textSec, fontWeight: 500 }}>
                  {f.label}
                </span>
              ))}
            </div>
          </SettingRow>

          {/* Brightness */}
          <SettingRow
            label="Brightness"
            desc={`Screen brightness: ${settings.brightness}%`}
            icon={<Sun size={18} style={{ color: "#f59e0b" }} />}
            textPri={textPri} textSec={textSec} border={border}
            vertical last
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
              <Sun size={14} style={{ color: textSec, flexShrink: 0 }} />
              <input
                type="range" min={60} max={100} step={5}
                value={settings.brightness}
                onChange={e => update("brightness", Number(e.target.value))}
                style={{ flex: 1, accentColor: settings.accentColor, cursor: "pointer" }}
              />
              <Sun size={20} style={{ color: "#f59e0b", flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: textPri, minWidth: "36px", textAlign: "right" }}>
                {settings.brightness}%
              </span>
            </div>
          </SettingRow>
        </SettingSection>

        {/* ════ ANIMATIONS ════ */}
        <SettingSection title="⚡ Motion & Animation" isDark={isDark} card={card} border={border} textSec={textSec}>
          <SettingRow
            label="Animations"
            desc="Enable smooth transitions and effects"
            icon={<Zap size={18} style={{ color: "#f59e0b" }} />}
            textPri={textPri} textSec={textSec} border={border}
          >
            <Toggle value={settings.animations} onChange={v => update("animations", v)} accent={settings.accentColor} />
          </SettingRow>
          <SettingRow
            label="Reduced Motion"
            desc="Minimize animations for accessibility"
            icon={<Smartphone size={18} style={{ color: "#6366f1" }} />}
            textPri={textPri} textSec={textSec} border={border} last
          >
            <Toggle value={settings.reducedMotion} onChange={v => update("reducedMotion", v)} accent={settings.accentColor} />
          </SettingRow>
        </SettingSection>

        {/* ════ NOTIFICATIONS ════ */}
        <SettingSection title="🔔 Notifications & Sound" isDark={isDark} card={card} border={border} textSec={textSec}>
          <SettingRow
            label="Push Notifications"
            desc="Order updates, deals and alerts"
            icon={<Bell size={18} style={{ color: "#f97316" }} />}
            textPri={textPri} textSec={textSec} border={border}
          >
            <Toggle value={settings.notifications} onChange={v => update("notifications", v)} accent={settings.accentColor} />
          </SettingRow>
          <SettingRow
            label="Sound Effects"
            desc="Play sounds on actions"
            icon={settings.soundEffects ? <Volume2 size={18} style={{ color: "#10b981" }} /> : <VolumeX size={18} style={{ color: textSec }} />}
            textPri={textPri} textSec={textSec} border={border} last
          >
            <Toggle value={settings.soundEffects} onChange={v => update("soundEffects", v)} accent={settings.accentColor} />
          </SettingRow>
        </SettingSection>

        {/* ════ LANGUAGE & REGION ════ */}
        <SettingSection title="🌍 Language & Region" isDark={isDark} card={card} border={border} textSec={textSec}>

          {/* Language */}
          <SettingRow
            label="Language"
            desc="App display language"
            icon={<Globe size={18} style={{ color: "#0891b2" }} />}
            textPri={textPri} textSec={textSec} border={border}
          >
            <select
              value={settings.language}
              onChange={e => update("language", e.target.value)}
              style={{
                padding: "6px 10px", borderRadius: "8px",
                background: isDark ? "rgba(255,255,255,.08)" : "#f1f5f9",
                border: `1px solid ${border}`,
                color: textPri, fontSize: "13px", fontWeight: 600,
                cursor: "pointer", outline: "none",
              }}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </SettingRow>

          {/* Currency */}
          <SettingRow
            label="Currency"
            desc="Price display format"
            icon={<span style={{ fontSize: "16px", width: "18px", textAlign: "center" }}>💱</span>}
            textPri={textPri} textSec={textSec} border={border} last
          >
            <select
              value={settings.currency}
              onChange={e => update("currency", e.target.value)}
              style={{
                padding: "6px 10px", borderRadius: "8px",
                background: isDark ? "rgba(255,255,255,.08)" : "#f1f5f9",
                border: `1px solid ${border}`,
                color: textPri, fontSize: "13px", fontWeight: 600,
                cursor: "pointer", outline: "none",
              }}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </SettingRow>
        </SettingSection>

        {/* ════ PRIVACY ════ */}
        <SettingSection title="🔒 Privacy" isDark={isDark} card={card} border={border} textSec={textSec}>
          <SettingRow
            label="Auto-play Videos"
            desc="Play videos automatically while browsing"
            icon={<Shield size={18} style={{ color: "#16a34a" }} />}
            textPri={textPri} textSec={textSec} border={border} last
          >
            <Toggle value={settings.autoPlayVideos} onChange={v => update("autoPlayVideos", v)} accent={settings.accentColor} />
          </SettingRow>
        </SettingSection>

        {/* ════ RESET ════ */}
        <button
          onClick={resetAll}
          style={{
            width: "100%", marginTop: "14px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            padding: "15px", borderRadius: "16px",
            background: isDark ? "rgba(239,68,68,.1)" : "#fef2f2",
            border: "1.5px solid rgba(239,68,68,.2)",
            color: "#ef4444", fontWeight: 700, fontSize: "14px",
            cursor: "pointer", transition: "all .2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,.18)")}
          onMouseLeave={e => (e.currentTarget.style.background = isDark ? "rgba(239,68,68,.1)" : "#fef2f2")}
        >
          <RefreshCw size={16} />
          Reset All Settings to Default
        </button>

      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; height: 4px; border-radius: 4px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; }
        select option { background: #1a1d2e; color: #f1f5f9; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Reusable sub-components
// ─────────────────────────────────────────────────────────────
const SettingSection = ({ title, children, isDark, card, border, textSec }: any) => (
  <div style={{
    background: card,
    border: `1px solid ${border}`,
    borderRadius: "20px",
    padding: "18px",
    marginTop: "14px",
    boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,.05)",
  }}>
    <h2 style={{ fontSize: "12px", fontWeight: 800, color: textSec, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
      {title}
    </h2>
    {children}
  </div>
);

interface SettingRowProps {
  label: string;
  desc: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  textPri: string;
  textSec: string;
  border: string;
  last?: boolean;
  vertical?: boolean;
}

const SettingRow = ({ label, desc, icon, children, textPri, textSec, border, last, vertical }: SettingRowProps) => (
  <div style={{
    borderBottom: last ? "none" : `1px solid ${border}`,
    paddingBottom: last ? 0 : "14px",
    marginBottom: last ? 0 : "14px",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: textPri, margin: 0 }}>{label}</p>
          <p style={{ fontSize: "11px", color: textSec, margin: "2px 0 0", lineHeight: 1.4 }}>{desc}</p>
        </div>
      </div>
      {!vertical && <div style={{ flexShrink: 0 }}>{children}</div>}
    </div>
    {vertical && children}
  </div>
);

const Toggle = ({ value, onChange, accent }: { value: boolean; onChange: (v: boolean) => void; accent: string }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: "44px", height: "24px",
      borderRadius: "12px",
      background: value ? accent : "rgba(148,163,184,.3)",
      border: "none", cursor: "pointer",
      position: "relative",
      transition: "background .25s",
      flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute",
      width: "18px", height: "18px",
      borderRadius: "50%",
      background: "#fff",
      top: "3px",
      left: value ? "23px" : "3px",
      transition: "left .25s cubic-bezier(.34,1.56,.64,1)",
      boxShadow: "0 1px 4px rgba(0,0,0,.2)",
    }} />
  </button>
);