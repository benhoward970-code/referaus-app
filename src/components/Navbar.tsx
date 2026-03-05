"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="serif-i text-2xl text-blue-600">Refer</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/providers" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Browse</Link>
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</Link>
          <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign In</Link>
          <Link href="/register" className="text-sm px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all">
            Get Started
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-500">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 flex flex-col gap-4">
              <Link href="/providers" onClick={() => setOpen(false)} className="text-gray-600">Browse Providers</Link>
              <Link href="/pricing" onClick={() => setOpen(false)} className="text-gray-600">Pricing</Link>
              <Link href="/about" onClick={() => setOpen(false)} className="text-gray-600">About</Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="text-gray-600">Contact</Link>
              <Link href="/login" onClick={() => setOpen(false)} className="text-gray-600">Sign In</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="text-center py-2.5 rounded-lg bg-orange-500 text-white font-semibold">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
