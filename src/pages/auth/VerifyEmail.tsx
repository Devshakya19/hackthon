import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { resendVerificationEmail } from "../../supabase/auth";

const RESEND_COOLDOWN_MS = 60_000;

function cooldownKey(email: string) {
  return `verify-email-resend:${email.trim().toLowerCase()}`;
}

export default function VerifyEmail() {
  const location = useLocation();
  const [email, setEmail] = useState(
    (location.state as { email?: string } | null)?.email ?? ""
  );
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  React.useEffect(() => {
    const initialEmail =
      (location.state as { email?: string } | null)?.email ?? "";
    const savedAt = Number(
      window.localStorage.getItem(cooldownKey(initialEmail)) ?? "0"
    );
    if (savedAt) {
      const remaining = Math.max(
        0,
        RESEND_COOLDOWN_MS - (Date.now() - savedAt)
      );
      setCooldownLeft(Math.ceil(remaining / 1000));
    }
  }, [location.state]);

  React.useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const savedAt = Number(
      window.localStorage.getItem(cooldownKey(trimmedEmail)) ?? "0"
    );
    const remaining = Math.max(0, RESEND_COOLDOWN_MS - (Date.now() - savedAt));

    if (remaining > 0) {
      setError(
        `Please wait ${Math.ceil(
          remaining / 1000
        )} seconds before requesting another link.`
      );
      setCooldownLeft(Math.ceil(remaining / 1000));
      return;
    }

    setLoading(true);
    setStatus("");
    setError("");

    if (!trimmedEmail) {
      setLoading(false);
      setError("Enter the email used for registration.");
      return;
    }

    const { error: resendError } = await resendVerificationEmail(trimmedEmail);

    setLoading(false);

    if (resendError) {
      const message = resendError.message.toLowerCase().includes("rate")
        ? "A verification email was sent recently. Please check your inbox or wait before requesting again."
        : resendError.message;
      setError(message);
      return;
    }

    window.localStorage.setItem(cooldownKey(trimmedEmail), String(Date.now()));
    setCooldownLeft(60);
    setStatus("Verification link sent. Check your inbox and spam folder.");
  };

  return (
    <div className="min-h-screen text-text-900 bg-bg font-sans flex items-center justify-center relative overflow-hidden px-6">
      {/* Background SVG / Grains */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(0, 240, 255, 0.07)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to registration
        </Link>

        {/* Card */}
        <div className="glass-card border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Top subtle glow bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-neon-purple" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-extrabold text-xl mx-auto shadow-[0_0_15px_rgba(0,240,255,0.4)] mb-4">
              ✉
            </div>
            <h2 className="text-3xl font-extrabold text-white">Verify Email</h2>
            <p className="text-text-500 text-sm mt-2">
              Supabase sends a confirmation link to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading || cooldownLeft > 0}
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-bg font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
              ) : cooldownLeft > 0 ? (
                `Wait ${cooldownLeft}s`
              ) : (
                "Resend Verification Link"
              )}
            </button>

            {status ? (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                {status}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </form>

          <div className="mt-8 text-center text-sm text-text-500">
            After confirming your email, go back to{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              login
            </Link>
            .
          </div>
        </div>
      </motion.div>
    </div>
  );
}
