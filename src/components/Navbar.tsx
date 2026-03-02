"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0A0E17]/80 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-lg tracking-tight">NexaConnect</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/providers" className="text-sm text-white/60 hover:text-white transition-colors">
            Browse Providers
          </Link>
          <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/compare" className="text-sm text-white/60 hover:text-white transition-colors">
            Compare
          </Link>
          <Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors">
            Resources
          </Link>
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/60">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <Link href="/providers" onClick={() => setOpen(false)} className="text-white/70 hover:text-white">Browse Providers</Link>
              <Link href="/pricing" onClick={() => setOpen(false)} className="text-white/70 hover:text-white">Pricing</Link>
              <Link href="/login" onClick={() => setOpen(false)} className="text-white/70 hover:text-white">Sign In</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="text-center py-2.5 rounded-lg bg-blue-600 text-white font-medium">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
