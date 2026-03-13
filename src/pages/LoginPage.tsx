import { useState, useEffect, useCallback, useRef } from "react";
import {
  EyeIcon, EyeSlashIcon, UserIcon,
  EnvelopeIcon, LockClosedIcon,
  CheckCircleIcon, SparklesIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { handleLogin as authLogin, handleSignup, handleForgotPassword } from "../utils/auth";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";
import confetti from "canvas-confetti";

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)             score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Weak",   color: "#ef4444" },
    2: { label: "Fair",   color: "#f97316" },
    3: { label: "Good",   color: "#eab308" },
    4: { label: "Strong", color: "#22c55e" },
  };
  return { score, ...(map[score] ?? { label: "", color: "" }) };
}

// ─────────────────────────────────────────────────────────────────────────────
//  FLOATING LABEL INPUT
// ─────────────────────────────────────────────────────────────────────────────

interface FloatInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
  icon: React.ReactNode;
  disabled?: boolean;
}

function FloatInput({ id, label, type, value, onChange, required, autoComplete, rightSlot, icon, disabled }: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative group">
      {/* left icon */}
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200"
        style={{ color: focused ? "#3b82f6" : "#94a3b8" }}
      >
        {icon}
      </span>

      {/* floating label */}
      <label
        htmlFor={id}
        className="absolute left-12 pointer-events-none font-semibold select-none transition-all duration-200"
        style={{
          fontSize:    lifted ? "10px"   : "14px",
          top:         lifted ? "8px"    : "50%",
          transform:   lifted ? "none"   : "translateY(-50%)",
          color:       lifted ? (focused ? "#3b82f6" : "#64748b") : "#94a3b8",
          letterSpacing: lifted ? "0.08em" : "0",
          textTransform: lifted ? "uppercase" : "none",
        }}
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={label}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full outline-none font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          paddingLeft:   "48px",
          paddingRight:  rightSlot ? "48px" : "16px",
          paddingTop:    "22px",
          paddingBottom: "8px",
          borderRadius:  "14px",
          background:    focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
          border:        `1.5px solid ${focused ? "#3b82f6" : "rgba(203,213,225,0.8)"}`,
          boxShadow:     focused
            ? "0 0 0 3px rgba(59,130,246,0.12), 0 4px 16px rgba(59,130,246,0.08)"
            : "0 1px 4px rgba(0,0,0,0.04)",
          color:         "#0f172a",
        }}
      />

      {/* right slot (eye icon etc) */}
      {rightSlot && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</span>
      )}
    </div>
  );
}

// dark mode variant
function FloatInputDark({ id, label, type, value, onChange, required, autoComplete, rightSlot, icon, disabled }: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative group">
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200"
        style={{ color: focused ? "#60a5fa" : "#475569" }}
      >
        {icon}
      </span>

      <label
        htmlFor={id + "_dark"}
        className="absolute left-12 pointer-events-none font-semibold select-none transition-all duration-200"
        style={{
          fontSize:    lifted ? "10px"   : "14px",
          top:         lifted ? "8px"    : "50%",
          transform:   lifted ? "none"   : "translateY(-50%)",
          color:       lifted ? (focused ? "#60a5fa" : "#64748b") : "#475569",
          letterSpacing: lifted ? "0.08em" : "0",
          textTransform: lifted ? "uppercase" : "none",
        }}
      >
        {label}
      </label>

      <input
        id={id + "_dark"}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={label}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full outline-none font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          paddingLeft:   "48px",
          paddingRight:  rightSlot ? "48px" : "16px",
          paddingTop:    "22px",
          paddingBottom: "8px",
          borderRadius:  "14px",
          background:    focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
          border:        `1.5px solid ${focused ? "#3b82f6" : "rgba(255,255,255,0.08)"}`,
          boxShadow:     focused
            ? "0 0 0 3px rgba(59,130,246,0.15), 0 4px 16px rgba(59,130,246,0.08)"
            : "none",
          color:         "#f1f5f9",
        }}
      />

      {rightSlot && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PASSWORD STRENGTH BAR
// ─────────────────────────────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="px-1 space-y-1.5">
      <div className="flex gap-1.5">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.2)" }}>
            <div
              className="h-full rounded-full transition-all duration-400"
              style={{
                width: i <= score ? "100%" : "0%",
                background: color,
                boxShadow: i <= score ? `0 0 8px ${color}70` : "none",
                transition: "width 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] font-bold" style={{ color }}>{label} password</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOGGLE SWITCH
// ─────────────────────────────────────────────────────────────────────────────

function ToggleSwitch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={on}
      className="flex items-center gap-2.5 group outline-none">
      <div className="relative w-10 h-5 rounded-full transition-all duration-300 shrink-0"
        style={{ background: on ? "linear-gradient(90deg,#3b82f6,#6366f1)" : "rgba(148,163,184,0.3)" }}>
        <span
          className="absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-all duration-300"
          style={{ left: on ? "22px" : "3px" }}
        />
      </div>
      <span className="text-xs font-bold transition-colors duration-200 select-none"
        style={{ color: on ? "#3b82f6" : "#94a3b8" }}>
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [isLogin,          setIsLogin]          = useState(true);
  const [email,            setEmail]            = useState("");
  const [password,         setPassword]         = useState("");
  const [name,             setName]             = useState("");
  const [showPassword,     setShowPassword]     = useState(false);
  const [isLoading,        setIsLoading]        = useState(false);
  const [isShaking,        setIsShaking]        = useState(false);
  const [rememberMe,       setRememberMe]       = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loginAttempts,    setLoginAttempts]    = useState(0);
  const [isRateLimited,    setIsRateLimited]    = useState(false);
  const [countdown,        setCountdown]        = useState(0);
  const [mounted,          setMounted]          = useState(false);
  const [isDark,           setIsDark]           = useState(false);
  // field-level inline errors
  const [emailError,       setEmailError]       = useState("");
  const [passwordError,    setPasswordError]    = useState("");

  const AUTH_TOAST_ID  = "auth-action-toast";
  const MAX_ATTEMPTS   = 5;
  const LOCKOUT_SEC    = 30;
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // detect dark mode
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches);
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // mount animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // remembered email
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  // rate limit countdown
  useEffect(() => {
    if (!isRateLimited) return;
    setCountdown(LOCKOUT_SEC);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setIsRateLimited(false);
          setLoginAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, [isRateLimited]);

  // ── Helpers ──
  const triggerSuccess = useCallback(() => {
    if (rememberMe) localStorage.setItem("rememberedEmail", email);
    else            localStorage.removeItem("rememberedEmail");
    setShowSuccessPopup(true);
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    const scalar = 2;
    confetti({
      shapes: [confetti.shapeFromText({ text: "\uD83D\uDC8E", scalar }), confetti.shapeFromText({ text: "\u2728", scalar })],
      particleCount: 80, spread: 70, origin: { y: 0.6 },
      colors: ["#2563eb", "#3b82f6", "#ffffff"],
    });
    setTimeout(() => setShowSuccessPopup(false), 3000);
  }, [rememberMe, email]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google", options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google login failed!", { id: AUTH_TOAST_ID });
    }
  }, []);

  const onForgotPasswordClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();

    // Step 1 — email field khali hai?
    if (!email.trim()) {
      toast.error("Please enter your email first!", { id: AUTH_TOAST_ID });
      return;
    }

    // Step 2 — basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.", { id: AUTH_TOAST_ID });
      return;
    }

    toast.loading("Checking account...", { id: AUTH_TOAST_ID });

    try {
      // Step 3 — check karo ki yeh email profiles table mein hai ya nahi
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();                          // single row ya null — no error if not found

      if (error) {
        toast.error("Something went wrong. Try again.", { id: AUTH_TOAST_ID });
        return;
      }

      // Step 4 — email registered nahi hai toh generic message do (security best practice)
      if (!data) {
        toast.error("No account found with this email.", { id: AUTH_TOAST_ID });
        return;
      }

      // Step 5 — registered hai toh reset link bhejo
      const result = await handleForgotPassword(email.trim());
      if (result.success) {
        toast.success("Reset link sent! Check your inbox 📧", { id: AUTH_TOAST_ID });
      } else {
        toast.error(result.message || "Failed to send link. Try again.", { id: AUTH_TOAST_ID });
      }

    } catch {
      toast.error("Connection error. Try again.", { id: AUTH_TOAST_ID });
    }
  }, [email]);

  const checkIfEmailExists = useCallback(async (userEmail: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("email").eq("email", userEmail.trim().toLowerCase());
      return !error && data && data.length > 0;
    } catch { return false; }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isRateLimited) return;
    if (loginAttempts >= MAX_ATTEMPTS) { setIsRateLimited(true); return; }
    setIsLoading(true);
    toast.loading(isLogin ? "Signing you in..." : "Creating your account...", { id: AUTH_TOAST_ID });
    try {
      if (isLogin) {
        const result = await authLogin({ email, password });
        if (result.success) {
          const { data: { session } } = await supabase.auth.getSession();
          const userId   = session?.user?.id    || result.user?.id    || "";
          const userName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name
            || result.user?.username || result.user?.name || email.split("@")[0];
          const userEmail = session?.user?.email || result.user?.email || email;
          const userRole  = session?.user?.user_metadata?.role || "user";
          login({ id: userId, name: userName, email: userEmail, role: userRole, joinedAt: session?.user?.created_at }, session?.access_token);
          setLoginAttempts(0);
          setEmailError("");
          setPasswordError("");
          toast.success("Welcome back! 👋", { id: AUTH_TOAST_ID });
          triggerSuccess();
          setTimeout(() => navigate("/"), 1800);
        } else {
          if ("vibrate" in navigator) navigator.vibrate(50);
          setLoginAttempts(prev => prev + 1);

          // ── Detect EXACTLY what went wrong via Supabase direct check ──
          // Step 1: does this email exist in profiles table?
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("email")
            .eq("email", email.trim().toLowerCase())
            .maybeSingle();

          if (!profileRow) {
            // Email hi nahi mila — unregistered email
            setEmailError("No account found with this email.");
            setPasswordError("");
            toast.error("Email not registered ❌", { id: AUTH_TOAST_ID });
          } else {
            // Email sahi hai but password galat — Supabase signInWithPassword se confirm
            const { error: signErr } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });
            const msg = signErr?.message?.toLowerCase() ?? "";
            if (msg.includes("invalid login") || msg.includes("wrong") || msg.includes("credentials") || msg.includes("password")) {
              setPasswordError("Incorrect password. Please try again.");
              setEmailError("");
              toast.error("Incorrect password ❌", { id: AUTH_TOAST_ID });
            } else {
              // fallback
              setEmailError("");
              setPasswordError("Something went wrong. Try again.");
              toast.error("Login failed. Try again.", { id: AUTH_TOAST_ID });
            }
          }
        }
      } else {
        const alreadyExists = await checkIfEmailExists(email);
        if (alreadyExists) { toast.error("Email already registered", { id: AUTH_TOAST_ID }); setIsLoading(false); return; }
        const pwStrength = getPasswordStrength(password);
        if (pwStrength.score < 2) { toast.error("Please use a stronger password", { id: AUTH_TOAST_ID }); setIsLoading(false); return; }
        const result = await handleSignup({ username: name, email, password });
        if (result.success) {
          triggerSuccess();
          toast.success("Account created! Verify your email \uD83D\uDCE7", { id: AUTH_TOAST_ID });
          setIsLogin(true); setName("");
        } else { toast.error(result.message || "Signup failed", { id: AUTH_TOAST_ID }); }
      }
    } catch (err: any) {
      toast.error(err?.message || "Connection error", { id: AUTH_TOAST_ID });
    } finally { setIsLoading(false); }
  }, [isLoading, isRateLimited, loginAttempts, isLogin, email, password, name, login, navigate, triggerSuccess, checkIfEmailExists]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleSubmit(e as any);
  }, [isLoading, handleSubmit]);

  const switchMode = useCallback(() => {
    setIsLogin(p => !p); setPassword(""); setName("");
    setEmailError(""); setPasswordError("");
  }, []);

  // ── Responsive Input — picks light or dark based on isDark ──
  const Input = isDark ? FloatInputDark : FloatInput;

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: isDark ? "#060810" : "#f0f4ff" }}
      onKeyDown={handleKeyDown}
    >
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* blob 1 */}
        <div className="absolute rounded-full"
          style={{
            width: "700px", height: "700px",
            top: "-200px", left: "-200px",
            background: isDark
              ? "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(99,102,241,0.1) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
            filter: "blur(60px)",
            animation: "blobA 20s ease-in-out infinite alternate",
          }}
        />
        {/* blob 2 */}
        <div className="absolute rounded-full"
          style={{
            width: "500px", height: "500px",
            bottom: "-150px", right: "-120px",
            background: isDark
              ? "radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)",
            filter: "blur(60px)",
            animation: "blobB 24s ease-in-out infinite alternate",
          }}
        />
        {/* grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)"
              : "linear-gradient(rgba(59,130,246,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.06) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── SUCCESS TOAST ── */}
      {showSuccessPopup && (
        <div
          className="fixed top-6 left-1/2 z-[200] w-[92%] max-w-sm"
          style={{
            transform: "translateX(-50%)",
            animation: "popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          <div
            className="flex items-center gap-4 p-4 rounded-3xl"
            style={{
              background: isDark ? "rgba(10,14,26,0.95)" : "rgba(255,255,255,0.97)",
              backdropFilter: "blur(40px)",
              border: isDark ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(59,130,246,0.2)",
              boxShadow: "0 20px 60px rgba(59,130,246,0.25)",
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 8px 24px rgba(59,130,246,0.4)" }}>
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>
                {isLogin ? "Welcome back!" : "Account created!"}
              </p>
              <p className="text-xs font-bold mt-0.5" style={{ color: "#3b82f6" }}>
                {isLogin ? "Redirecting to store..." : "Please verify your email \uD83D\uDCE7"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD ── */}
      <div
        className={`relative z-10 w-full max-w-[420px] mx-4 transition-all duration-700`}
        style={{
          opacity:   mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
          animation: isShaking ? "shake 0.4s ease" : undefined,
        }}
      >
        <div
          style={{
            borderRadius: "28px",
            overflow: "hidden",
            background: isDark
              ? "rgba(10,14,26,0.82)"
              : "rgba(255,255,255,0.88)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.07)"
              : "1px solid rgba(255,255,255,0.9)",
            boxShadow: isDark
              ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 32px 80px rgba(59,130,246,0.1), 0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,1)",
          }}
        >
          <div style={{ padding: "40px 36px 36px" }}>

            {/* ── HEADER ── */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              {/* Logo */}
              <div style={{ display: "inline-flex", marginBottom: "20px", position: "relative" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "20px",
                  background: "linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)",
                  boxShadow: "0 16px 48px rgba(59,130,246,0.5), 0 0 0 1px rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <SparklesIcon style={{ width: "28px", height: "28px", color: "white" }} />
                </div>
                {/* glow behind logo */}
                <div style={{
                  position: "absolute", inset: "-6px", borderRadius: "26px",
                  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                  filter: "blur(16px)", opacity: 0.4, zIndex: -1,
                }} />
              </div>

              <h2 style={{
                fontSize: "26px", fontWeight: 900, letterSpacing: "-0.03em",
                color: isDark ? "#f8fafc" : "#0f172a", margin: "0 0 6px",
              }}>
                X One Boutique
              </h2>
              <p style={{ fontSize: "14px", color: isDark ? "#64748b" : "#94a3b8", margin: 0, fontWeight: 500 }}>
                {isLogin ? "Your journey to style begins here" : "Sign up for exclusive access"}
              </p>

              {/* ── MODE TABS ── */}
              <div style={{
                display: "flex", marginTop: "24px", padding: "4px",
                borderRadius: "14px",
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(241,245,249,0.8)",
                border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(203,213,225,0.5)",
              }}>
                {[["Sign In", true], ["Create Account", false]].map(([label, forLogin]) => {
                  const active = isLogin === forLogin;
                  return (
                    <button
                      key={label as string}
                      type="button"
                      onClick={() => {
                        if (isLogin !== (forLogin as boolean)) switchMode();
                      }}
                      style={{
                        flex: 1, padding: "10px 8px",
                        borderRadius: "10px",
                        fontSize: "13px", fontWeight: 700,
                        border: "none", cursor: "pointer",
                        transition: "all 0.25s ease",
                        background: active
                          ? (isDark ? "rgba(255,255,255,0.08)" : "white")
                          : "transparent",
                        color: active
                          ? (isDark ? "#f1f5f9" : "#0f172a")
                          : (isDark ? "#475569" : "#94a3b8"),
                        boxShadow: active
                          ? (isDark ? "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)")
                          : "none",
                      }}
                    >
                      {label as string}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── RATE LIMIT BANNER ── */}
            {isRateLimited && (
              <div style={{
                marginBottom: "20px", padding: "12px 16px", borderRadius: "12px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#ef4444", textAlign: "center" }}>
                  Too many attempts. Try again in <strong>{countdown}s</strong>
                </p>
              </div>
            )}

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Name — signup only */}
              {!isLogin && (
                <div style={{ animation: "slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <Input id="signup-name" label="Full Name" type="text" value={name} onChange={setName}
                    required autoComplete="name" icon={<UserIcon />} />
                </div>
              )}

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{
                  borderRadius: "14px",
                  outline: emailError ? "1.5px solid rgba(239,68,68,0.5)" : "1.5px solid transparent",
                  transition: "outline-color 0.2s ease",
                }}>
                  <Input id="login-email" label="Email Address" type="email"
                    value={email}
                    onChange={v => { setEmail(v); if (emailError) setEmailError(""); }}
                    required autoComplete="email" icon={<EnvelopeIcon />} />
                </div>
                {emailError && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 12px", borderRadius: "10px",
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    animation: "slideIn 0.25s ease both",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5"/>
                      <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444" }}>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{
                  borderRadius: "14px",
                  outline: passwordError ? "1.5px solid rgba(239,68,68,0.5)" : "1.5px solid transparent",
                  transition: "outline-color 0.2s ease",
                }}>
                  <Input
                    id="login-password" label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={v => { setPassword(v); if (passwordError) setPasswordError(""); }}
                    required autoComplete={isLogin ? "current-password" : "new-password"}
                    icon={<LockClosedIcon />}
                    rightSlot={
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex" }}>
                        {showPassword ? <EyeSlashIcon style={{ width: "18px", height: "18px" }} /> : <EyeIcon style={{ width: "18px", height: "18px" }} />}
                      </button>
                    }
                  />
                </div>
                {passwordError && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 12px", borderRadius: "10px",
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    animation: "slideIn 0.25s ease both",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5"/>
                      <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444" }}>{passwordError}</span>
                  </div>
                )}
                {!isLogin && <PasswordStrengthBar password={password} />}
              </div>

              {/* Remember me + Forgot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
                <ToggleSwitch on={rememberMe} onToggle={() => setRememberMe(p => !p)} label="Remember me" />
                {isLogin && (
                  <button type="button" onClick={onForgotPasswordClick}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "12px", fontWeight: 700, color: "#3b82f6",
                      padding: "4px 0",
                    }}>
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || isRateLimited}
                aria-label={isLogin ? "Sign in" : "Create account"}
                style={{
                  width: "100%", padding: "15px",
                  borderRadius: "14px", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: 900, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "white",
                  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                  boxShadow: "0 8px 32px rgba(59,130,246,0.4), 0 2px 8px rgba(59,130,246,0.2)",
                  opacity: (isLoading || isRateLimited) ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  marginTop: "4px",
                }}
                onMouseEnter={e => {
                  if (!isLoading && !isRateLimited) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(59,130,246,0.55), 0 4px 12px rgba(59,130,246,0.3)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(59,130,246,0.4), 0 2px 8px rgba(59,130,246,0.2)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.98)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              >
                {isLoading ? (
                  <>
                    <span style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }} />
                    Processing...
                  </>
                ) : (isLogin ? "Sign In" : "Get Started")}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "2px 0" }}>
                <div style={{ flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(203,213,225,0.7)" }} />
                <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em",
                  color: isDark ? "#334155" : "#cbd5e1" }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(203,213,225,0.7)" }} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={loginWithGoogle}
                aria-label="Continue with Google"
                style={{
                  width: "100%", padding: "13px",
                  borderRadius: "14px", border: "none", cursor: "pointer",
                  fontSize: "14px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  background: isDark ? "rgba(255,255,255,0.04)" : "white",
                  color: isDark ? "#e2e8f0" : "#374151",
                  boxShadow: isDark
                    ? "0 0 0 1px rgba(255,255,255,0.08)"
                    : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "#f8fafc";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = isDark
                    ? "0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)"
                    : "0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "white";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = isDark
                    ? "0 0 0 1px rgba(255,255,255,0.08)"
                    : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.98)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Footer */}
            <p style={{
              textAlign: "center", marginTop: "24px", marginBottom: 0,
              fontSize: "11px", fontWeight: 500,
              color: isDark ? "#334155" : "#94a3b8",
            }}>
              By continuing, you agree to our{" "}
              <span style={{ color: "#3b82f6", fontWeight: 700, cursor: "pointer" }}>Terms</span>
              {" & "}
              <span style={{ color: "#3b82f6", fontWeight: 700, cursor: "pointer" }}>Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p style={{
          textAlign: "center", marginTop: "20px",
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: isDark ? "rgba(71,85,105,0.7)" : "rgba(148,163,184,0.6)",
        }}>
          Elegance &middot; Style &middot; Grace
        </p>
      </div>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes blobA {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(50px,30px) scale(1.12); }
        }
        @keyframes blobB {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-40px,-50px) scale(1.08); }
        }
        @keyframes popIn {
          from { opacity:0; transform: translate(-50%,-20px) scale(0.95); }
          to   { opacity:1; transform: translate(-50%,0)     scale(1); }
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateY(-14px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%      { transform:translateX(-6px); }
          40%      { transform:translateX(6px); }
          60%      { transform:translateX(-4px); }
          80%      { transform:translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}