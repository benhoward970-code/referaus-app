"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, isConfigured, submitWaitlist } from "@/lib/supabase";

export default function RegisterPage() {
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

    if (!isConfigured()) {
      await submitWaitlist(email, role);
      setSuccess(true);
      setLoading(false);
      return;
    }

    const { error: err } = await signUp(email, password, { name, role });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black mb-2">You are in!</h2>
          <p className="text-white/45 text-sm mb-6">{isConfigured() ? "Check your email to verify your account." : "We have added you to the waitlist. We will be in touch soon!"}</p>
          <Link href="/" className="text-blue-400 text-sm hover:text-blue-300">Back to home</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.04] blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Create your account</h1>
          <p className="text-sm text-white/45">Join Refer today</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <div className="flex rounded-xl bg-white/[0.04] p-1 mb-6">
            <button onClick={() => setRole("participant")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${role === "participant" ? "bg-blue-600 text-white" : "text-white/50"}`}>Participant</button>
            <button onClick={() => setRole("provider")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${role === "provider" ? "bg-blue-600 text-white" : "text-white/50"}`}>Provider</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">{role === "provider" ? "Business Name" : "Full Name"}</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
              {loading ? "Creating account..." : role === "provider" ? "Create Provider Account" : "Sign Up Free"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}