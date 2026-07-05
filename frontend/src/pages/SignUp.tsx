import { useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import {
  Activity,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import logoSrc from "@/assets/bleepbots-logo.png";
import AuthPageAside from "@/components/AuthPageAside";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const normalizedUsername = username.trim().replace(/\s+/g, "");

    setIsSubmitting(true);

    const res = await authClient.signUp.email({
      name: username.trim(),
      username: normalizedUsername,
      email,
      password,
    });

    if (res.error)
      setError(
        res.error.message
          ? res.error.message
          : "Registration failed. Please try again.",
      );
    else {
      setSuccess(true);
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex">
        <AuthPageAside />
        <div
          className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-up border-l-2 border-[#00C896]/20"
          style={{ background: "#0F1923" }}
        >
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-10 lg:hidden">
              <img
                src={logoSrc}
                alt="BleepBots"
                className="w-[180px] h-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.08]">
              <Lock className="h-3 w-3 text-white/30" />
              <span className="text-[11px] text-white/30 tracking-wide">
                256-bit encrypted connection
              </span>
            </div>
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-[#00C896] mx-auto mb-4" />
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                Account Created!
              </h2>
              <Link
                to="/login"
                className="inline-flex font-semibold py-3 px-8 rounded-lg text-sm"
                style={{
                  background: "#00C896",
                  color: "#0A1628",
                }}
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AuthPageAside />
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-up border-l-2 border-[#00C896]/20"
        style={{ background: "#0F1923" }}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <img
              src={logoSrc}
              alt="BleepBots"
              className="w-[180px] h-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.08]">
            <Lock className="h-3 w-3 text-white/30" />
            <span className="text-[11px] text-white/30 tracking-wide">
              256-bit encrypted connection
            </span>
          </div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-[#00C896]" />
              <span className="text-xs font-medium text-[#00C896] uppercase tracking-wide">
                Caregiver portal
              </span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-50"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]"></span>
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-white/40 text-sm mt-1.5">
              Enter your details to get started.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]/30 transition"
                placeholder="Your username"
              />
              <p className="mt-2 text-xs text-white/40">
                Spaces will be removed for the submitted username.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]/30 transition"
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]/30 transition"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]/30 transition"
                placeholder=""
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <Activity className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-semibold py-3 rounded-lg text-sm active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "#00C896",
                color: "#0A1628",
                boxShadow: "0 0 20px rgba(0, 200, 150, 0.15)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(0, 200, 150, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(0, 200, 150, 0.15)";
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-[#0A1628]/30 border-t-[#0A1628] rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <p className="text-center text-white/25 text-xs mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-[#00C896] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
