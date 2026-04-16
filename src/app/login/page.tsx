"use client";
import { LogoMark } from "../../components/Logo";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, isConfigured, getProviderByUserId, supabase } from "@/lib/supabase";

const REMEMBER_ME_KEY = "referaus_remembered_email";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MFAChallenge({ factorId, onSuccess }: { factorId: string; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);

    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      setError(challengeErr.message);
      setLoading(false);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyErr) {
      setError("Invalid code. Please try again.");
      setCode("");
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="glass rounded-2xl p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
        </div>
        <h2 className="text-lg font-bold mb-1">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-500">Enter the 6-digit code from your authenticator app</p>
      </div>
      <form onSubmit={handleVerify} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Pre-fill remembered email on mount
  useEffect(() => {
    try {
      const remembered = localStorage.getItem(REMEMBER_ME_KEY);
      if (remembered) {
        setEmail(remembered);
        setRememberMe(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const navigateAfterLogin = async () => {
    if (redirect) {
      window.location.href = redirect;
      return;
    }
    if (!supabase) {
      window.location.href = "/";
      return;
    }
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (user) {
      const provider = await getProviderByUserId(user.id);
      window.location.href = provider ? "/dashboard" : "/";
    } else {
      window.location.href = "/";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isConfigured()) {
      setError("Demo mode - Supabase not configured yet");
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);

    if (result.error) {
      if (result.error.message?.toLowerCase().includes("email not confirmed")) {
        setError("Please verify your email before signing in. Check your inbox for the verification link.");
        setLoading(false);
        return;
      }
      setError(result.error.message);
      setLoading(false);
      return;
    }

    // Handle remember me
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch {
      // ignore
    }

    // Check if MFA is required
    if (supabase) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.nextLevel === "aal2" && aalData.currentLevel === "aal1") {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.find((f) => f.status === "verified");
        if (totp) {
          setMfaFactorId(totp.id);
          setLoading(false);
          return;
        }
      }
    }

    await navigateAfterLogin();
  };

  if (mfaFactorId) {
    return <MFAChallenge factorId={mfaFactorId} onSuccess={navigateAfterLogin} />;
  }

  return (
    <div className="glass rounded-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
            {error.toLowerCase().includes("verify your email") && (
              <ResendVerificationButton email={email} />
            )}
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>
        {/* Remember Me */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={rememberMe}
            onClick={() => setRememberMe(v => !v)}
            className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${rememberMe ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
          >
            {rememberMe && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            )}
          </button>
          <span className="text-xs text-gray-600 cursor-pointer select-none" onClick={() => setRememberMe(v => !v)}>
            Remember me
          </span>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-gray-500">
          <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700">Forgot your password?</Link>
        </p>
        <p className="text-xs text-gray-500">No account? <Link href="/register" className="text-blue-600 hover:text-blue-700">Create one</Link></p>
      </div>
    </div>
  );
}

function ResendVerificationButton({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (!supabase || !email) return;
    setSending(true);
    await supabase.auth.resend({ type: "signup", email });
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return <span className="block mt-2 text-green-600 text-xs">Verification email resent! Check your inbox.</span>;
  }

  return (
    <button
      onClick={handleResend}
      disabled={sending}
      className="block mt-2 text-blue-600 hover:text-blue-500 text-xs font-medium underline"
    >
      {sending ? "Sending..." : "Resend verification email"}
    </button>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4"><LogoMark /></div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your ReferAus account</p>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-8 animate-pulse h-64" />}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
