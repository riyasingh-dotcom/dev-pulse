"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { verifyPin, saveAuth } from "@/lib/auth";

type Props = { onSuccess: () => void };

const PIN_LENGTH = 4;

export function PinAuth({ onSuccess }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submit = useCallback(async (pin: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await verifyPin(pin);
      setSuccess(true);
      saveAuth();
      setTimeout(onSuccess, 600);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid PIN";
      setError(msg);
      setDigits(Array(PIN_LENGTH).fill(""));
      triggerShake();
      setTimeout(() => inputRefs.current[0]?.focus(), 10);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === PIN_LENGTH - 1) {
      const pin = [...next.slice(0, PIN_LENGTH - 1), digit].join("");
      if (pin.length === PIN_LENGTH) submit(pin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, PIN_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === PIN_LENGTH) submit(pasted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = digits.join("");
    if (pin.length < PIN_LENGTH) {
      setError("Please enter all 4 digits.");
      triggerShake();
      return;
    }
    submit(pin);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blob */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">

          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 10L5 6L8 8L12 3"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">DevPulse</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Developer Analytics & AI Coaching</p>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-3">
              {success ? (
                <ShieldCheck className="w-5 h-5 text-primary" />
              ) : (
                <Lock className="w-5 h-5 text-primary" />
              )}
            </div>
            <h2 className="text-base font-semibold text-foreground">Enter your PIN</h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              Enter your 4-digit dashboard PIN to continue
            </p>
          </div>

          {/* PIN boxes */}
          <form onSubmit={handleSubmit}>
            <div
              className={`flex justify-center gap-3 mb-5 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={isLoading || success}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={`
                    w-13 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background
                    text-foreground transition-all duration-150 outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    disabled:opacity-60
                    ${error ? "border-destructive/60" : digit ? "border-primary/50" : "border-border"}
                    ${success ? "border-green-500 bg-green-500/5" : ""}
                  `}
                />
              ))}
            </div>

            {/* Error */}
            <div className="h-5 flex items-center justify-center mb-4">
              {error && (
                <p className="text-[12px] text-destructive font-medium">{error}</p>
              )}
              {success && (
                <p className="text-[12px] text-green-600 dark:text-green-400 font-medium">
                  Access granted ✓
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || success || digits.join("").length < PIN_LENGTH}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold
                hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : success ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Unlocked
                </>
              ) : (
                "Unlock Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-muted-foreground mt-5">
          Protected by DevPulse PIN authentication
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-4px); }
          60%       { transform: translateX(4px); }
          75%       { transform: translateX(-2px); }
          90%       { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
