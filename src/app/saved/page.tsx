"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProviderCard } from "@/components/ProviderCard";
import { mapDbProvider } from "@/lib/map-provider";
import type { Provider } from "@/lib/providers";
import { getSaved } from "@/lib/saved";

export default function SavedPage() {
  const [providers, setProviders] = useState<Provider[] | null>(null);

  useEffect(() => {
    const slugs = getSaved();
    if (slugs.length === 0) {
      setProviders([]);
      return;
    }
    fetch("/api/providers-public")
      .then((r) => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any[]) => {
        if (!Array.isArray(data)) return setProviders([]);
        const matched = data.filter((p) => slugs.includes(p.slug)).map(mapDbProvider);
        setProviders(matched);
      })
      .catch(() => setProviders([]));
  }, []);

  return (
    <div className="pb-24">
      <PageHeader label="Your shortlist" title="Saved providers" subtitle="Your shortlist, with private notes. Only stored on this device." />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {providers === null ? (
          <div className="py-20 text-center text-ink-400 text-sm">Loading…</div>
        ) : providers.length === 0 ? (
          <div className="card-flat p-12 text-center border-dashed">
            <Heart className="w-8 h-8 text-rose-300 mx-auto mb-4" />
            <h2 className="font-semibold text-ink-900 mb-1">Nothing saved yet</h2>
            <p className="text-sm text-ink-500 mb-5">Tap the heart on any provider to build your shortlist.</p>
            <Link href="/providers" className="btn-primary inline-flex">Browse providers</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((p) => (
              <ProviderCard key={p.slug} provider={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
