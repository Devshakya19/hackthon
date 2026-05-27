import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  completePendingOnboarding,
  getSignupEmailCooldownLeft,
  isEmailRateLimitError,
  markSignupEmailCooldown,
  signUpWithEmail,
  storePendingOnboarding,
} from "../../supabase/auth";

export default function JoinTeamPage() {
  const [teamUid, setTeamUid] = useState("");
  const [teamPassword, setTeamPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!teamUid.trim() || !teamPassword.trim()) {
      setError("Team UID and password are required");
      return;
    }

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Name, email and password required");
      return;
    }

    const trimmedEmail = email.trim();
    const signupCooldownLeft = getSignupEmailCooldownLeft(trimmedEmail);
    if (signupCooldownLeft > 0) {
      setError(
        `A verification email was already sent for this address. Please wait ${signupCooldownLeft} seconds or check your inbox.`
      );
      return;
    }

    setLoading(true);
    storePendingOnboarding({
      role: "member",
      teamName: "",
      teamUid: teamUid.trim(),
      teamPassword: teamPassword.trim(),
      fullName: fullName.trim(),
    });

    const { data, error: authError } = await signUpWithEmail(
      trimmedEmail,
      password.trim(),
      { role: "member", teamName: "", fullName: fullName.trim() }
    );

    if (authError) {
      if (isEmailRateLimitError(authError.message)) {
        markSignupEmailCooldown(trimmedEmail);
        setLoading(false);
        setError(
          "A verification email was already sent for this address. Please check your inbox and spam folder before trying again."
        );
        return;
      }

      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.session?.user) {
      try {
        await completePendingOnboarding(data.session.user);
      } catch (onboardingError) {
        setLoading(false);
        setError(
          onboardingError instanceof Error
            ? onboardingError.message
            : "Unable to complete joining"
        );
        return;
      }

      setLoading(false);
      navigate("/dashboard");
      return;
    }

    markSignupEmailCooldown(trimmedEmail);
    setLoading(false);
    navigate("/verify-email", { state: { email: trimmedEmail } });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-md p-8 glass-card">
        <h2 className="text-xl font-bold mb-4">Join a Team</h2>
        <form onSubmit={handleJoin} className="space-y-3">
          <input
            value={teamUid}
            onChange={(e) => setTeamUid(e.target.value)}
            placeholder="Team UID (e.g. T-AB12CD)"
            className="w-full p-3 rounded"
          />
          <input
            value={teamPassword}
            onChange={(e) => setTeamPassword(e.target.value)}
            placeholder="Team Password"
            className="w-full p-3 rounded"
          />
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full p-3 rounded"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 rounded"
          />
          {error && <div className="text-red-400">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-bg py-2 rounded"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create member account"}
          </button>
        </form>
      </div>
    </div>
  );
}
