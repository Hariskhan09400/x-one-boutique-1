/**
 * AdminPinLogin.tsx
 * Ek alag PIN-based gate jo /admin se pehle aata hai.
 * PIN: sessionStorage mein store hota hai (tab band = reset)
 * Change karna ho toh sirf ADMIN_PIN badlo neeche.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Eye, EyeOff } from "lucide-react";

// ─── YAHAN APNA PIN BADLO ────────────────────────────────────────────────────
const ADMIN_PIN = "1234"; // ← apna PIN yahan set karo
const SESSION_KEY = "xob_admin_pin_verified";
// ─────────────────────────────────────────────────────────────────────────────

interface AdminPinLoginProps {
  onSuccess: () => void;
}

export default function AdminPinLogin({ onSuccess }: AdminPinLoginProps) {
  const [pin,       setPin]       = useState<string[]>(["", "", "", ""]);
  const [error,     setError]     = useState(false);
  const [shake,     setShake]     = useState(false);
  const [attempts,  setAttempts]  = useState(0);
  const [locked,    setLocked]    = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [showPin,   setShowPin]   = useState(false);
  const inputRefs   = useRef<(HTMLInputElement | null)[]>([]);

  // Already verified hai toh seedha through
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      onSuccess();
    }
  }, [onSuccess]);

  // Lockout timer
  useEffect(() => {
    if (!locked) return;
    setLockTimer(30);
    const interval = setInterval(() => {
      setLockTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setLocked(false);
          setAttempts(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const handleInput = (index: number, value: string) => {
    if (locked) return;
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(false);

    // Auto-advance
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits filled
    if (digit && index === 3) {
      const full = [...newPin.slice(0, 3), digit].join("");
      setTimeout(() => checkPin(full, newPin), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const checkPin = (full: string, currentPin: string[]) => {
    if (full === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(true);
      setShake(true);
      setPin(["", "", "", ""]);
      setTimeout(() => {
        setShake(false);
        inputRefs.current[0]?.focus();
      }, 500);

      if (newAttempts >= 3) {
        setLocked(true);
      }
    }
  };

  const handleSubmit = () => {
    const full = pin.join("");
    if (full.length < 4) return;
    checkPin(full, pin);
  };

  // Numpad entry
  const handleNumpad = (num: string) => {
    if (locked) return;
    const emptyIdx = pin.findIndex((p) => p === "");
    if (emptyIdx === -1) return;
    const newPin = [...pin];
    newPin[emptyIdx] = num;
    setPin(newPin);
    setError(false);

    if (emptyIdx === 3) {
      const full = newPin.join("");
      setTimeout(() => checkPin(full, newPin), 100);
    }
  };

  const handleNumpadDelete = () => {
    const lastIdx = [...pin].reverse().findIndex((p) => p !== "");
    if (lastIdx === -1) return;
    const realIdx = 3 - lastIdx;
    const newPin = [...pin];
    newPin[realIdx] = "";
    setPin(newPin);
    setError(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0c14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute",
        top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "360px",
          margin: "0 16px",
        }}
      >
        {/* Card */}
        <div style={{
          background: "rgba(15,18,30,0.95)",
          border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: "24px",
          padding: "36px 32px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
        }}>

          {/* Icon */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width: "56px", height: "56px",
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              borderRadius: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(37,99,235,0.4)",
              marginBottom: "16px",
            }}>
              <Shield size={24} color="#fff" />
            </div>
            <h1 style={{
              color: "#f1f5f9",
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "0.02em",
              margin: 0,
            }}>
              ADMIN ACCESS
            </h1>
            <p style={{
              color: "rgba(148,163,184,0.7)",
              fontSize: "12px",
              marginTop: "6px",
              fontWeight: 500,
            }}>
              Enter your secret PIN to continue
            </p>
          </div>

          {/* PIN Dots */}
          <motion.div
            animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "28px",
            }}
          >
            {pin.map((digit, i) => (
              <div key={i} style={{ position: "relative" }}>
                <input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={locked}
                  style={{
                    width: "56px",
                    height: "64px",
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: 900,
                    background: digit
                      ? "rgba(37,99,235,0.15)"
                      : "rgba(255,255,255,0.04)",
                    border: error
                      ? "2px solid rgba(239,68,68,0.7)"
                      : digit
                      ? "2px solid rgba(37,99,235,0.6)"
                      : "2px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    color: "#f1f5f9",
                    outline: "none",
                    cursor: locked ? "not-allowed" : "text",
                    transition: "all 0.2s",
                    caretColor: "transparent",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(37,99,235,0.8)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = digit
                      ? "rgba(37,99,235,0.6)"
                      : error
                      ? "rgba(239,68,68,0.7)"
                      : "rgba(255,255,255,0.08)";
                  }}
                />
              </div>
            ))}
          </motion.div>

          {/* Show/Hide PIN toggle */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <button
              onClick={() => setShowPin(!showPin)}
              style={{
                background: "none", border: "none",
                color: "rgba(148,163,184,0.6)",
                fontSize: "11px", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontWeight: 600,
              }}
            >
              {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPin ? "Hide PIN" : "Show PIN"}
            </button>
          </div>

          {/* Error / Lock message */}
          <AnimatePresence>
            {(error || locked) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#f87171",
                }}
              >
                {locked
                  ? `Too many attempts. Try again in ${lockTimer}s 🔒`
                  : `Wrong PIN. ${3 - attempts} attempt${3 - attempts === 1 ? "" : "s"} left.`}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Numpad */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            marginBottom: "12px",
          }}>
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((key, i) => (
              <button
                key={i}
                onClick={() => key === "⌫" ? handleNumpadDelete() : key ? handleNumpad(key) : undefined}
                disabled={locked || key === ""}
                style={{
                  height: "52px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: key === "⌫"
                    ? "rgba(239,68,68,0.1)"
                    : key === ""
                    ? "transparent"
                    : "rgba(255,255,255,0.05)",
                  color: key === "⌫" ? "#f87171" : "#e2e8f0",
                  fontSize: key === "⌫" ? "18px" : "18px",
                  fontWeight: 700,
                  cursor: key === "" || locked ? "default" : "pointer",
                  transition: "all 0.15s",
                  borderColor: key === "" ? "transparent" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (key && key !== "" && !locked) {
                    (e.target as HTMLButtonElement).style.background =
                      key === "⌫" ? "rgba(239,68,68,0.2)" : "rgba(37,99,235,0.2)";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (key && key !== "" && !locked) {
                    (e.target as HTMLButtonElement).style.background =
                      key === "⌫" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                  }
                }}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={pin.join("").length < 4 || locked}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              background: pin.join("").length === 4 && !locked
                ? "linear-gradient(135deg, #1d4ed8, #3b82f6)"
                : "rgba(255,255,255,0.05)",
              border: "none",
              color: pin.join("").length === 4 && !locked ? "#fff" : "rgba(255,255,255,0.2)",
              fontWeight: 800,
              fontSize: "14px",
              letterSpacing: "0.08em",
              cursor: pin.join("").length === 4 && !locked ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: pin.join("").length === 4 && !locked
                ? "0 8px 24px rgba(37,99,235,0.35)"
                : "none",
            }}
          >
            UNLOCK →
          </button>

          {/* Footer */}
          <p style={{
            textAlign: "center",
            color: "rgba(100,116,139,0.5)",
            fontSize: "10px",
            marginTop: "20px",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}>
            X ONE BOUTIQUE · ADMIN PORTAL · RESTRICTED ACCESS
          </p>
        </div>
      </motion.div>
    </div>
  );
}