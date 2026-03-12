"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { providers as hardcodedProviders, categories, locations } from "@/lib/providers";
import type { Provider } from "@/lib/providers";
import { ProviderCard } from "@/components/ProviderCard";
import { getAllProviders } from "@/lib/supabase";
import { mapDbProvider } from "@/lib/map-provider";

type SortOption = "rating" | "name" | "reviews";

export default function ProvidersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("rating");
  const [providers, setProviders] = useState<Provider[]>(hardcodedProviders);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchProviders() {
      try {
        const dbRows = await getAllProviders();
        if (!cancelled && dbRows.length > 0) {
          const dbProviders = dbRows.map((row: any) => mapDbProvider(row));
          // Merge: DB providers take priority (by slug), then fill with hardcoded
          const slugSet = new Set(dbProviders.map((p: any) => p.slug));
          const merged = [
            ...dbProviders,
            ...hardcodedProviders.filter((p) => !slugSet.has(p.slug)),
          ];
          setProviders(merged);
        }
      } catch (err) {
        console.error("[providers] Failed to fetch from DB, using hardcoded:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchProviders();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let result = providers.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.services.some((s) => s.toLowerCase().includes(search.toLowerCase())) || (p.postcode && p.postcode.includes(search)) || (p.suburb && p.suburb.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "All" || p.category === category;
      const matchLoc = location === "All Locations" || p.location === location;
      const matchVerified = !verifiedOnly || p.verified;
      return matchSearch && matchCat && matchLoc && matchVerified;
    });

    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "reviews") result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);

    return result;
  }, [search, category, location, verifiedOnly, sort, providers]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-500 text-sm focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer w-full sm:min-w-[180px] sm:w-auto"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-500 text-sm focus:outline-none focus:border-blue-500/40 appearance-none cursor-pointer w-full sm:min-w-[180px] sm:w-auto"
            >
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${verifiedOnly ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
                {verifiedOnly && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 font-medium">Verified providers only</span>
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Sort:</span>
              {(["rating", "name", "reviews"] as SortOption[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`text-xs px-3 py-2 min-h-[40px] rounded-lg font-medium transition-colors ${
                    sort === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {s === "rating" ? "Top Rated" : s === "name" ? "Name A-Z" : "Most Reviews"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-sm text-gray-400 mb-6">
          Showing {filtered.length} of {providers.length} providers
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                  <div className="h-6 bg-gray-100 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
