"use client";
import { LogoMark } from "../../components/Logo";
import { useState, Component, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, isConfigured, submitWaitlist, supabase } from "@/lib/supabase";

class RegisterErrorBoundary extends Component<{children: ReactNode}, {error: string | null}> {
  constructor(props: {children: ReactNode}) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-lg w-full">
          <h2 className="font-bold text-red-700 mb-2">Register page error:</h2>
          <pre className="text-xs text-red-600 whitespace-pre-wrap">{this.state.error}</pre>
        </div>
      </div>
    );
    return this.props.children;
  }
}

function RegisterInner() {
  const [role, setRole] = useState<"participant" | "provider">("participant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isConfigured()) {
        setError("DEBUG: Supabase not configured — check env vars");
        setLoading(false);
        return;
      }

      const result = await signUp(email, password, { name, role });
      if (result.error) {
        setError("Signup error: " + result.error.message + " (code: " + (result.error as any).status + ")");
        setLoading(false);
        return;
      }

      // For provider role, create provider profile via API (respects auth + RLS)
      if (role === "provider") {
        const newUser = result.data?.user;
        if (newUser) {
          const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

          await fetch("/api/register-provider", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: newUser.id,
              name,
              slug,
              email,
            }),
          }).catch(() => {
            // Non-blocking — user can complete profile in dashboard
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!supabase || !email) return;
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
    setResending(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black mb-2">You are in!</h2>
          <p className="text-gray-500 text-sm mb-6">
            {isConfigured()
              ? "Check your email to verify your account. Once verified, you can sign in and start using ReferAus."
              : "We have added you to the waitlist. We will be in touch soon!"}
          </p>
          {isConfigured() && (
            <div className="mb-4">
              {resent ? (
                <p className="text-green-600 text-sm font-medium">Verification email resent! Check your inbox.</p>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium underline disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          )}
          <Link href="/login" className="text-blue-600 text-sm hover:text-blue-700">Go to sign in</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.04] blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4"><LogoMark /></div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Create your account</h1>
          <p className="text-sm text-gray-500">Join ReferAus today</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <div className="flex rounded-xl bg-gray-50 p-1 mb-6" role="radiogroup" aria-label="Account type">
            <button onClick={() => setRole("participant")} role="radio" aria-checked={role === "participant"} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${role === "participant" ? "bg-blue-600 text-white" : "text-gray-500"}`}>Participant</button>
            <button onClick={() => setRole("provider")} role="radio" aria-checked={role === "provider"} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${role === "provider" ? "bg-blue-600 text-white" : "text-gray-500"}`}>Provider</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{role === "provider" ? "Business Name" : "Full Name"}</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
              )}
              {password.length >= 6 && (
                <p className="text-xs text-green-600 mt-1">&#10003; Password looks good</p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
              {loading ? "Creating account..." : role === "provider" ? "Create Provider Account" : "Sign Up Free"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700">Sign in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <RegisterErrorBoundary>
      <RegisterInner />
    </RegisterErrorBoundary>
  );
}
