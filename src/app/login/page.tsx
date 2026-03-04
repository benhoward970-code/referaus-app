"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, isConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isConfigured()) {
      setError("Demo mode - Supabase not configured yet");
      setLoading(false);
      return;
    }

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm text-white/45">Sign in to your Refer account</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">No account? <Link href="/register" className="text-blue-400 hover:text-blue-300">Create one</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}