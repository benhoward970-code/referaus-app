/* ──────────────────────────────────────────────────────────────────────
   ReferAus Design System — Component Reference
   Copy/paste these into your codebase. Every example uses the tokens
   from tailwind.config.ts and globals.css (no extra dependencies).
   ────────────────────────────────────────────────────────────────────── */

import Link from "next/link";

/* ─── 1. BUTTONS ────────────────────────────────────────────────────── */

export function ButtonExamples() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Primary CTA */}
      <button className="btn-primary">Send Enquiry</button>

      {/* Secondary */}
      <button className="btn-secondary">Request Callback</button>

      {/* Ghost */}
      <button className="btn-ghost">Cancel</button>

      {/* With icon */}
      <button className="btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        Send Enquiry
      </button>

      {/* Small variant */}
      <button className="btn-secondary text-xs" style={{ minHeight: 36, padding: "0 0.875rem" }}>
        Small
      </button>
    </div>
  );
}

/* ─── 2. PILLS / BADGES ─────────────────────────────────────────────── */

export function PillExamples() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="pill-verified">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
        Verified Provider
      </span>
      <span className="pill-pending">Pending Verification</span>
      <span className="pill-success">NDIS Registered</span>
      <span className="pill-neutral">Allied Health</span>
    </div>
  );
}

/* ─── 3. CARD ───────────────────────────────────────────────────────── */

export function CardExample() {
  return (
    <div className="card card-pad">
      <h3 className="text-h3 mb-2">Provider Card</h3>
      <p className="text-ink-500 text-sm leading-relaxed">
        The standard surface — white background, line-200 border, rounded-2xl,
        shadow-card. Use card-pad for default 24/32px padding.
      </p>
    </div>
  );
}

/* ─── 4. PROVIDER LISTING CARD (real-world composite) ───────────────── */

interface ProviderCardProps {
  slug: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  description: string;
  initial: string;
}

export function ProviderCard({
  slug, name, category, location, rating, reviewCount, verified, description, initial,
}: ProviderCardProps) {
  return (
    <Link
      href={`/providers/${slug}`}
      className="group card card-pad block transition-all hover:shadow-xl hover:-translate-y-0.5
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center
                        bg-gradient-to-br from-orange-50 to-blue-50">
          <span className="text-2xl font-black text-orange-500">{initial}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-h4 truncate">{name}</h3>
            {verified && (
              <span className="pill-verified">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span className="text-orange-500 font-medium">{category}</span>
            <span className="text-ink-300">•</span>
            <span>{location}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-ink-700 leading-relaxed line-clamp-2 mb-4">
        {description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-line-100">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((s) => (
            <svg key={s} width="13" height="13" viewBox="0 0 24 24"
                 fill={s <= Math.round(rating) ? "#F97316" : "#e5e7eb"}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
          <span className="text-xs font-semibold text-orange-500 ml-1">{rating}</span>
          <span className="text-xs text-ink-400">({reviewCount})</span>
        </div>
        <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
          View profile →
        </span>
      </div>
    </Link>
  );
}

/* ─── 5. INPUT / FORM FIELD ─────────────────────────────────────────── */

export function FormFieldExample() {
  return (
    <form className="space-y-4 max-w-md">
      <div className="field">
        <label className="label">Full Name</label>
        <input type="text" placeholder="Jane Smith" className="input" />
      </div>
      <div className="field">
        <label className="label">Email Address</label>
        <input type="email" placeholder="jane@example.com" className="input" />
      </div>
      <div className="field">
        <label className="label">Message</label>
        <textarea rows={4} className="input resize-none"
                  placeholder="Hi, I'm interested in learning more..." />
      </div>
      <button type="submit" className="btn-primary w-full">Send Message</button>
    </form>
  );
}

/* ─── 6. SECTION HEADING ────────────────────────────────────────────── */

export function SectionHeadingExample() {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow mb-2">Step 02</p>
        <h2 className="text-h2">Find your provider</h2>
      </div>
      <Link href="/providers" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
        View all →
      </Link>
    </div>
  );
}

/* ─── 7. STAR RATING ────────────────────────────────────────────────── */

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
             fill={s <= Math.round(rating) ? "#F97316" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── 8. EMPTY STATE ────────────────────────────────────────────────── */

export function EmptyState() {
  return (
    <div className="card card-pad text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <h3 className="text-h3 mb-2">No providers found</h3>
      <p className="text-ink-500 text-sm mb-6 max-w-sm mx-auto">
        Try adjusting your filters or expanding your search radius.
      </p>
      <button className="btn-secondary">Clear filters</button>
    </div>
  );
}

/* ─── 9. SKELETON LOADER ────────────────────────────────────────────── */

export function SkeletonCard() {
  return (
    <div className="card card-pad">
      <div className="flex gap-4 mb-4">
        <div className="skeleton w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="skeleton h-4 rounded w-2/3" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
      </div>
      <div className="skeleton h-3 rounded w-full mb-2" />
      <div className="skeleton h-3 rounded w-5/6" />
    </div>
  );
}

/* ─── 10. TOAST (call from a portal or top-level layout) ────────────── */

export function Toast({ kind, message }: { kind: "success" | "error"; message: string }) {
  const styles = kind === "success"
    ? "bg-green-50 border-green-200 text-green-700"
    : "bg-red-50 border-red-200 text-red-600";
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg
                     flex items-center gap-3 ${styles}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        {kind === "success"
          ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          : <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        }
      </svg>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
