import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmail, getSignupEmailCooldownLeft, markSignupEmailCooldown, isEmailRateLimitError } from "../../supabase/auth";
import { supabase } from "../../supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await signInWithEmail(
      email.trim(),
      password
    );

    if (authError) {

      // Check if this is an unregistered member logging in with team credentials
      const { data: verifyData, error: verifyError } = await supabase.rpc(
        "verify_member_login",
        {
          p_email: email.trim(),
          p_password: password,
        }
      );

      if (!verifyError && verifyData && (verifyData as any).valid) {
        const trimmedEmail = email.trim();

        const cooldownLeft = getSignupEmailCooldownLeft(trimmedEmail);
        if (cooldownLeft > 0) {
          setLoading(false);
          setError(
            `Please wait ${cooldownLeft} seconds before trying again.`
          );
          return;
        }

        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: trimmedEmail,
            password: password,
            options: {
              data: {
                role: "member",
                team_id: (verifyData as any).team_id,
                name: (verifyData as any).name,
              },
            },
          });

        if (signUpError) {
          if (isEmailRateLimitError(signUpError.message)) {
            markSignupEmailCooldown(trimmedEmail);
            setLoading(false);
            setError(
              "Rate limit exceeded. Please wait before trying again."
            );
            return;
          }

          setLoading(false);
          setError(signUpError.message);
          return;
        }

        if (signUpData.session) {
          setLoading(false);
          navigate("/dashboard");
          return;
        } else {
          setLoading(false);
          setError("Login successful, but session was not returned.");
          return;
        }
      }

      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.session) {
      const role =
        data.session.user.user_metadata?.role === "admin" ||
        data.session.user.app_metadata?.role === "admin"
          ? "admin"
          : data.session.user.user_metadata?.role === "leader" ||
            data.session.user.app_metadata?.role === "leader"
          ? "leader"
          : "member";
      setLoading(false);
      navigate(role === "admin" ? "/dashboard/admin" : "/dashboard");
      return;
    }

    setLoading(false);
    setError("Invalid login credentials.");
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
          to="/"
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
          Back to home
        </Link>

        {/* Card */}
        <div className="glass-card border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Top subtle glow bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-neon-purple" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-extrabold text-xl mx-auto shadow-[0_0_15px_rgba(0,240,255,0.4)] mb-4">
              32
            </div>
            <h2 className="text-3xl font-extrabold text-white">Access Arena</h2>
            <p className="text-text-500 text-sm mt-2">
              Sign in to your security console
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-bg font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                "Initialize Console"
              )}
            </button>

            {error ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </form>

          <div className="mt-8 text-center text-sm text-text-500">
            New to the arena?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Create security account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
