"use client";
import { LogoMark } from "../../components/Logo";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, isConfigured, getProviderByUserId } from "@/lib/supabase";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

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
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (redirect) {
      router.push(redirect);
      return;
    }

    const user = result.data?.user;
    if (user) {
      const provider = await getProviderByUserId(user.id);
      router.push(provider ? "/dashboard" : "/");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="glass rounded-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">No account? <Link href="/register" className="text-blue-400 hover:text-blue-300">Create one</Link></p>
      </div>
    </div>
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
