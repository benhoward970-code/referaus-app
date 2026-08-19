"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Provider } from "@/lib/providers";
import { PrefetchLink } from "@/components/PrefetchOnHover";
import { isSaved, toggleSaved } from "@/lib/saved";

function isNewProvider(provider: Provider): boolean {
  // Check created_at if available (DB providers may have it)
  const createdAt = (provider as any).created_at;
  if (!createdAt) return false;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() > thirtyDaysAgo;
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const isNew = isNewProvider(provider);
  const isTopRated = provider.reviewCount >= 5;
  const cover = provider.cover_image_url;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved(provider.slug));
  }, [provider.slug]);

  return (
    <PrefetchLink href={`/providers/${provider.slug}`}>
      <div className="group card-flat overflow-hidden h-full flex flex-col cursor-pointer">
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-orange-50">
          {cover ? (
            <Image
              src={cover}
              alt={`${provider.name} cover`}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-3xl italic text-blue-600/30">{provider.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

          <button
            onClick={(e) => {
              e.preventDefault();
              setSaved(toggleSaved(provider.slug));
            }}
            aria-label={saved ? "Remove from saved" : "Save provider"}
            className="absolute top-2.5 right-2.5 z-10 h-8 w-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-ink-500"}`} />
          </button>

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {provider.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-white/95 backdrop-blur px-2 py-1 rounded-full shadow-sm">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4M12 3l1.9 1.4 2.35-.3 1.05 2.15L19.4 7.7l-.3 2.35L21 12l-1.9 1.9.3 2.35-2.15 1.05-1.05 2.15-2.35-.3L12 21l-1.9-1.9-2.35.3-1.05-2.15-2.15-1.05.3-2.35L3 12l1.9-1.9-.3-2.35 2.15-1.05 1.05-2.15 2.35.3z" /></svg>
                NDIS Registered
              </span>
            )}
          </div>
          <div className="absolute top-2.5 right-2.5 flex flex-wrap justify-end gap-1.5">
            {provider.registrationReady && (
              <span className="text-[10px] font-semibold text-green-700 bg-white/95 backdrop-blur px-2 py-1 rounded-full shadow-sm">Reg Ready</span>
            )}
            {isTopRated && (
              <span className="text-[10px] font-semibold text-blue-700 bg-white/95 backdrop-blur px-2 py-1 rounded-full shadow-sm">Top Rated</span>
            )}
            {isNew && (
              <span className="text-[10px] font-semibold text-purple-700 bg-white/95 backdrop-blur px-2 py-1 rounded-full shadow-sm">New</span>
            )}
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink-900 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
              {provider.name}
            </h3>
            <p className="text-[12.5px] text-ink-500 flex items-center gap-1 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.1-7-11a7 7 0 1114 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              {provider.location} &middot; {provider.category}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="13" height="13" viewBox="0 0 24 24" fill={star <= Math.round(provider.rating) ? "#f97316" : "#e5e7eb"}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-ink-700">{provider.rating}</span>
            <span className="text-xs text-ink-400">({provider.reviewCount})</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {provider.services.slice(0, 3).map((s) => (
              <span key={s} className="pill-neutral">{s}</span>
            ))}
            {provider.services.length > 3 && (
              <span className="text-[11px] px-2 py-1 text-ink-400">+{provider.services.length - 3}</span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-line-100">
            <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
              View profile
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
            {!provider.verified && (
              <span
                role="button"
                tabIndex={0}
                className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/register";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    window.location.href = "/register";
                  }
                }}
              >
                Claim listing
              </span>
            )}
          </div>
        </div>
      </div>
    </PrefetchLink>
  );
}
