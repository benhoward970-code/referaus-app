import Link from "next/link";
import type { Provider } from "@/lib/providers";

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link href={`/providers/${provider.slug}`}>
      <div className="group relative glass rounded-2xl p-6 transition-all duration-400 card-glow cursor-pointer">
        {provider.verified && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              Verified
            </span>
          </div>
        )}

        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-white/[0.08] flex items-center justify-center mb-4 group-hover:from-blue-600/30 group-hover:to-orange-500/30 transition-all">
          <span className="text-xl font-bold text-blue-400">{provider.name[0]}</span>
        </div>

        <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-400 transition-colors">{provider.name}</h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-orange-400 font-medium">{provider.category}</span>
          <span className="text-gray-900/15">|</span>
          <span className="text-xs text-gray-400">{provider.location}</span>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{provider.description}</p>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span className="text-sm font-semibold text-orange-400">{provider.rating}</span>
          </div>
          <span className="text-xs text-gray-900/25">({provider.reviewCount} reviews)</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {provider.services.slice(0, 3).map((s) => (
            <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] text-gray-400 border border-white/[0.05]">{s}</span>
          ))}
          {provider.services.length > 3 && (
            <span className="text-[11px] px-2 py-1 text-gray-900/25">+{provider.services.length - 3}</span>
          )}
        </div>

        {/* Hover shimmer */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
      </div>
    </Link>
  );
}
