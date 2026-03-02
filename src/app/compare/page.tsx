"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { providers } from "@/lib/providers";
import type { Provider } from "@/lib/providers";

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleProvider = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < 3 ? [...prev, slug] : prev
    );
  };

  const compareList = selected.map((s) => providers.find((p) => p.slug === s)!).filter(Boolean);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Compare</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Compare <span className="gradient-text">Providers</span>
          </h1>
          <p className="text-white/50 text-lg">Select up to 3 providers to compare side by side.</p>
        </motion.div>

        {/* Provider selector */}
        <div className="flex flex-wrap gap-2 mb-10">
          {providers.map((p) => (
            <button
              key={p.slug}
              onClick={() => toggleProvider(p.slug)}
              className={`text-sm px-4 py-2 rounded-xl border transition-all ${
                selected.includes(p.slug)
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                  : "bg-surface border-white/[0.06] text-white/60 hover:border-white/[0.15]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {compareList.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-surface border border-white/[0.06]">
            <p className="text-white/30 text-lg mb-2">Select providers above to compare</p>
            <p className="text-white/20 text-sm">Choose 2 or 3 providers to see them side by side</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
            {/* Header row */}
            <div className={`grid gap-0 border-b border-white/[0.06]`} style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
              <div className="p-6 border-r border-white/[0.06]" />
              {compareList.map((p) => (
                <div key={p.slug} className="p-6 text-center border-r border-white/[0.06] last:border-r-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-blue-400">{p.name[0]}</span>
                  </div>
                  <h3 className="text-sm font-bold">{p.name}</h3>
                  <p className="text-xs text-white/40 mt-1">{p.location}</p>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            {[
              { label: "Category", get: (p: Provider) => p.category },
              { label: "Rating", get: (p: Provider) => `${p.rating} / 5.0` },
              { label: "Reviews", get: (p: Provider) => `${p.reviewCount} reviews` },
              { label: "Verified", get: (p: Provider) => p.verified ? "Yes" : "No" },
              { label: "Services", get: (p: Provider) => p.services.join(", ") },
              { label: "Phone", get: (p: Provider) => p.phone },
            ].map((row) => (
              <div key={row.label} className={`grid border-b border-white/[0.04] last:border-b-0`} style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
                <div className="p-4 px-6 border-r border-white/[0.06] text-sm font-medium text-white/50">{row.label}</div>
                {compareList.map((p) => (
                  <div key={p.slug} className="p-4 px-6 border-r border-white/[0.06] last:border-r-0 text-sm text-white/70">{row.get(p)}</div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}