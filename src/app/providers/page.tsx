"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { providers, categories, locations } from "@/lib/providers";
import { ProviderCard } from "@/components/ProviderCard";

export default function ProvidersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All Locations");

  const filtered = providers.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || p.category === category;
    const matchLoc = location === "All Locations" || p.location === location;
    return matchSearch && matchCat && matchLoc;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Browse <span className="gradient-text">Providers</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl">
            {providers.length} NDIS providers across Newcastle &amp; the Hunter Region
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-10"
        >
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search providers, services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-white/[0.08] text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/40 transition-colors"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-surface border border-white/[0.08] text-white/70 text-sm focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer min-w-[180px]"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#111827]">
                {c}
              </option>
            ))}
          </select>

          {/* Location */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-3 rounded-xl bg-surface border border-white/[0.08] text-white/70 text-sm focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer min-w-[180px]"
          >
            {locations.map((l) => (
              <option key={l} value={l} className="bg-[#111827]">
                {l}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg mb-2">No providers found</p>
            <p className="text-white/25 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProviderCard provider={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
