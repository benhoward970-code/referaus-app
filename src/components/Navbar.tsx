"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#060B14]/70 border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Refer</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/providers" className="text-sm text-white/50 hover:text-white transition-colors">Browse</Link>
          <Link href="/compare" className="text-sm text-white/50 hover:text-white transition-colors">Compare</Link>
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors">Resources</Link>
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="text-sm px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all hover:shadow-lg hover:shadow-blue-600/20">
            Get Started
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/50">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-white/[0.04] bg-[#060B14]/95 backdrop-blur-2xl">
            <div className="px-6 py-4 flex flex-col gap-4">
              <Link href="/providers" onClick={() => setOpen(false)} className="text-white/60">Browse Providers</Link>
              <Link href="/compare" onClick={() => setOpen(false)} className="text-white/60">Compare</Link>
              <Link href="/pricing" onClick={() => setOpen(false)} className="text-white/60">Pricing</Link>
              <Link href="/blog" onClick={() => setOpen(false)} className="text-white/60">Resources</Link>
              <Link href="/login" onClick={() => setOpen(false)} className="text-white/60">Sign In</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="text-center py-2.5 rounded-xl bg-blue-600 text-white font-medium">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}