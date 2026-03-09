"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { providers, categories, locations } from "@/lib/providers";
import { ProviderCard } from "@/components/ProviderCard";

type SortOption = "rating" | "name" | "reviews";

export default function ProvidersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("rating");

  const filtered = useMemo(() => {
    let result = providers.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "All" || p.category === category;
      const matchLoc = location === "All Locations" || p.location === location;
      const matchVerified = !verifiedOnly || p.verified;
      return matchSearch && matchCat && matchLoc && matchVerified;
    });

    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "reviews") result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);

    return result;
  }, [search, category, location, verifiedOnly, sort]);

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
            Browse <span className="text-orange-500">Providers</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            {providers.length} NDIS providers across Newcastle &amp; the Hunter Region
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500/40 transition-colors"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-500 text-sm focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer min-w-[180px]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Location */}
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-500 text-sm focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer min-w-[180px]"
            >
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Second row: verified + sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${verifiedOnly ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
              >
                {verifiedOnly && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 font-medium">Verified providers only</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Sort:</span>
              {(["rating", "name", "reviews"] as SortOption[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    sort === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {s === "rating" ? "Top Rated" : s === "name" ? "Name A-Z" : "Most Reviews"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-6">
          Showing {filtered.length} of {providers.length} providers
        </p>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">No providers found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
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
