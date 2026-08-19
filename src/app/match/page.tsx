"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, MapPin, Star, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const SERVICES = [
  "Occupational Therapy", "Speech Pathology", "Physiotherapy", "Psychology",
  "Support Coordination", "Plan Management", "Behaviour Support", "Daily Living Support",
  "Community Access", "Supported Independent Living", "Transport", "Respite Care",
  "Early Childhood", "Home Modifications", "Assistive Technology",
];

const PREFERENCES = [
  "Home visits", "Telehealth", "Evening appointments", "Weekend availability",
  "Female clinician", "Male clinician", "Paediatric / kids", "Auslan / interpreter", "Group programs",
];

type MatchResult = { slug: string; score: number; reasoning: string; factors?: string[] };
type MatchedProvider = MatchResult & { name?: string; suburb?: string; rating?: number; review_count?: number; verified?: boolean };

function MatchRing({ score }: { score: number }) {
  const size = 64;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const tone = score >= 80 ? "#2563eb" : score >= 60 ? "#f97316" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-ink-900 leading-none text-lg">{score}</span>
        <span className="text-[9px] text-ink-400 -mt-0.5">match</span>
      </div>
    </div>
  );
}

export default function MatchPage() {
  const [servicesNeeded, setServicesNeeded] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [budget, setBudget] = useState(180);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchedProvider[] | null>(null);
  const [usedAI, setUsedAI] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const runMatch = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicesNeeded, region, budget, preferences }),
      });
      const data = await res.json();
      const ranked: MatchResult[] = data.results || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allProviders: any[] = await fetch("/api/providers-public").then((x) => (x.ok ? x.json() : [])).catch(() => []);
      const bySlug = new Map(allProviders.map((p) => [p.slug, p]));

      const withDetails: MatchedProvider[] = ranked.map((r) => {
        const pr = bySlug.get(r.slug);
        return { ...r, name: pr?.name, suburb: pr?.suburb || pr?.location, rating: pr?.rating, review_count: pr?.review_count, verified: pr?.verified };
      });

      setResults(withDetails);
      setUsedAI(!!data.usedAI);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader
        label="AI Match"
        title="Find your best-fit provider"
        subtitle="Tell us what you need — we'll score every provider in the Hunter Region against it and explain why each one fits."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="card-flat p-6 space-y-6 mt-8">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2 block">Services you need</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button
                key={s}
                onClick={() => toggle(servicesNeeded, setServicesNeeded, s)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  servicesNeeded.includes(s) ? "bg-orange-500 border-orange-500 text-white" : "border-line-200 text-ink-700 hover:border-orange-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2 block">Suburb or region</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Newcastle, Maitland"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2 block">Budget (per session, up to ${budget})</label>
            <input
              type="range" min={50} max={300} step={10} value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-orange-500 mt-3"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2 block">Preferences</label>
          <div className="flex flex-wrap gap-2">
            {PREFERENCES.map((p) => (
              <button
                key={p}
                onClick={() => toggle(preferences, setPreferences, p)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  preferences.includes(p) ? "bg-blue-600 border-blue-600 text-white" : "border-line-200 text-ink-700 hover:border-blue-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <button onClick={runMatch} disabled={loading} className="btn-primary w-full justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Matching…" : "Find my matches"}
        </button>
      </div>

      <AnimatePresence>
        {results !== null && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">
                {results.length > 0 ? `${results.length} matches, ranked for you` : "No matches found"}
              </h2>
              {usedAI && (
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI-ranked
                </span>
              )}
            </div>

            {results.map((r) => (
              <Link
                key={r.slug}
                href={`/providers/${r.slug}`}
                className="card-flat p-5 flex items-start gap-4 hover:border-orange-300 transition-colors block"
              >
                <MatchRing score={r.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-ink-900">{r.name || r.slug}</h3>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {r.suburb && (
                    <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {r.suburb}
                      {typeof r.rating === "number" && r.rating > 0 && (
                        <>
                          <span className="mx-1">·</span>
                          <Star className="w-3 h-3 fill-orange-400 text-orange-400" /> {r.rating.toFixed(1)} ({r.review_count || 0})
                        </>
                      )}
                    </p>
                  )}
                  <p className="text-sm text-ink-700 mt-2 leading-relaxed">{r.reasoning}</p>
                  {r.factors && r.factors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.factors.map((f, i) => (
                        <span key={i} className="pill-neutral">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-ink-400 shrink-0 mt-2" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
