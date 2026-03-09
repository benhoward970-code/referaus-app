import Link from "next/link";
import type { Provider } from "@/lib/providers";

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link href={`/providers/${provider.slug}`}>
      <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{provider.name}</h3>
              <p className="text-blue-100 text-sm">{provider.category}</p>
            </div>
            {provider.verified && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(provider.rating) ? "#f97316" : "#e5e7eb"}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{provider.rating}</span>
            <span className="text-xs text-gray-400">({provider.reviewCount} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {provider.services.slice(0, 3).map((s) => (
              <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">{s}</span>
            ))}
            {provider.services.length > 3 && (
              <span className="text-[11px] px-2 py-1 text-gray-400">+{provider.services.length - 3}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span className="text-sm text-gray-500">{provider.location}</span>
          </div>

          <div className="mt-auto">
            {provider.verified ? (
              <div className="text-center">
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                  View Profile &amp; Connect &rarr;
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                  View Profile &rarr;
                </span>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 font-medium hover:bg-orange-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/register";
                  }}
                >
                  Claim listing
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}