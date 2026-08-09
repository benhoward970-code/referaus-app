import Image from "next/image";
import type { Provider } from "@/lib/providers";
import { PrefetchLink } from "@/components/PrefetchOnHover";

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

  const tagClass = "font-mono text-[9.5px] tracking-[0.05em] uppercase border px-1.5 py-0.5 rounded-[2px] shrink-0";

  return (
    <PrefetchLink href={`/providers/${provider.slug}`}>
      <div className="group relative card-flat p-5 h-full flex flex-col cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="w-9 h-9 rounded-[3px] overflow-hidden shrink-0 bg-ink-950 flex items-center justify-center">
            {provider.logo_url ? (
              <Image
                src={provider.logo_url}
                alt={provider.name}
                width={36}
                height={36}
                className="object-cover w-full h-full"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAF0lEQVR4nGNkYGD4z8BQDwAAAf8A/ob0qgAAAABJRU5ErkJggg=="
              />
            ) : (
              <span className="text-cream text-xs font-bold">{provider.name[0]}</span>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {provider.verified && <span className={`${tagClass} border-orange-500 text-orange-500`}>Verified</span>}
            {provider.registrationReady && <span className={`${tagClass} border-green-600 text-green-600`}>Reg Ready</span>}
            {isTopRated && <span className={`${tagClass} border-blue-600 text-blue-600`}>Top Rated</span>}
            {isNew && <span className={`${tagClass} border-purple-600 text-purple-600`}>New</span>}
          </div>
        </div>

        <h3 className="text-[15px] font-bold text-ink-900 leading-tight mb-0.5">{provider.name}</h3>
        <p className="text-[12.5px] text-ink-500 mb-3">{provider.category}</p>

        <div className="flex items-center gap-2 mb-3">
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

        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.services.slice(0, 3).map((s) => (
            <span key={s} className="pill-neutral">{s}</span>
          ))}
          {provider.services.length > 3 && (
            <span className="text-[11px] px-2 py-1 text-ink-400">+{provider.services.length - 3}</span>
          )}
        </div>

        <div className="font-mono text-[10px] text-ink-400 uppercase tracking-wide mb-1">{provider.location}</div>
        <div className="text-xs text-ink-400 mb-3">
          {((provider as any).languages as string[] | undefined)?.join(", ") || "English"}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-line-100">
          <span className="border-b border-ink-900 pb-0.5 text-ink-900 font-mono text-[11px] uppercase group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
            View &rarr;
          </span>
          {!provider.verified && (
            <span
              role="button"
              tabIndex={0}
              className="font-mono text-[9.5px] tracking-[0.05em] uppercase border border-orange-500 text-orange-500 px-2 py-1 rounded-[2px] hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
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
    </PrefetchLink>
  );
}
