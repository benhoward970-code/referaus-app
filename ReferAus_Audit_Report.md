# ReferAus — Full Codebase Audit Report
**Date:** June 18, 2026  
**Project:** referaus.com — Next.js 16 / Supabase / Stripe / Resend

---

## Summary

The project is substantial and well-structured. Authentication, the provider dashboard, enquiries, reviews, and Stripe payments are all built and connected with live credentials. There are **6 critical bugs** that will cause visible broken behaviour right now, plus several smaller issues. Nothing requires a rebuild — all fixes are straightforward.

---

## CRITICAL — Broken Right Now

### 1. `manifest.json` missing from `/public`
**Impact:** PWA install fails. Browser logs an error on every page load.  
**Fix:** Create `/public/manifest.json` with your app name, icons, and theme colour. Example:
```json
{
  "name": "ReferAus",
  "short_name": "ReferAus",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f0f9ff",
  "theme_color": "#2563eb",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
}
```
You also need to add icon image files (icon-192.png, icon-512.png) to `/public`.

---

### 2. `og-image.png` and `favicon.svg` missing from `/public`
**Impact:** Social sharing (Facebook, Twitter, LinkedIn) shows a broken image. The schema.org structured data references `favicon.svg` which doesn't exist.  
**Fix:** Add `/public/og-image.png` (1200×630px) and `/public/favicon.svg` (or update references to match what you have).

---

### 3. `CookieConsent` component imported but never rendered
**Impact:** GDPR/privacy cookie notice never appears for visitors. Australia's Privacy Act requires this.  
**File:** `src/app/layout.tsx` — `CookieConsent` is imported on line 6 but is not in the JSX body.  
**Fix:** Add `<CookieConsent />` inside the layout, e.g. just before `</ToastProvider>`.

---

### 4. Stripe webhook bug — subscription renewal updates nothing
**Impact:** When a subscription payment succeeds after a failed payment or renewal, the provider's plan is not correctly updated because the function is called with an empty email string.  
**File:** `src/app/api/webhooks/stripe/route.ts` lines 55-58  
**Broken code:**
```ts
if (planId && customerId) {
  await updateProviderPlan('', planId, customerId, subscription.id); // ← empty email!
}
```
**Fix:** Look up the customer's email from Stripe first:
```ts
if (planId && customerId) {
  const customer = await stripe!.customers.retrieve(customerId);
  const email = (customer as any).email || '';
  await updateProviderPlan(email, planId, customerId, subscription.id);
}
```

---

### 5. Providers directory only shows verified providers — new signups are invisible
**Impact:** Any provider who registers and completes their profile will NOT appear in the `/providers` directory until an admin manually sets `verified = true` in Supabase. No new providers can see themselves in the listing.  
**File:** `src/app/api/providers-public/route.ts` line 9  
```
?select=*&verified=eq.true   ← this filter hides all unverified providers
```
**Fix (two options):**
- Option A: Remove the `verified=eq.true` filter so all providers show, and display an "unverified" badge on unverified ones.
- Option B: Keep the filter but add a banner on the dashboard telling new providers their listing is pending verification — and make sure YOU manually verify them in Supabase after review. (There is already a "pending approval" banner in the dashboard, but providers won't know if it never changes.)

---

### 6. `next.config` file is missing
**Impact:** External images (logo URLs, cover images stored in Supabase Storage) will fail to load with a "hostname not configured" error. Next.js requires image domains to be whitelisted.  
**Fix:** Create `next.config.mjs` in the project root:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'zfhapnnlxfhxsqpqcuje.supabase.co' },
    ],
  },
};
export default nextConfig;
```

---

## MODERATE — Working but Flawed

### 7. `force-dynamic` and `revalidate: 300` conflict on providers-public route
**File:** `src/app/api/providers-public/route.ts`  
Both `export const dynamic = "force-dynamic"` and `export const revalidate = 300` are set. `force-dynamic` wins and disables all caching, so the 5-minute cache never activates. Every page load hits Supabase directly.  
**Fix:** Remove `export const dynamic = "force-dynamic"` and keep only `export const revalidate = 300`.

---

### 8. Rate limiting resets on every cold start (in-memory only)
**File:** `src/lib/rate-limit.ts`  
The rate limiter uses a plain JavaScript `Map`. On Vercel, each serverless function instance has its own memory and a user can bypass limits by hitting different instances.  
**Impact:** Low risk for now (small traffic), but spam/abuse could get through at scale.  
**Fix when needed:** Replace with Redis-based rate limiting (Upstash Redis is free tier and works perfectly with Vercel).

---

### 9. Newsletter route saves to `waitlist` table instead of `newsletter`
**File:** `src/app/api/newsletter/route.ts`  
Signups from the newsletter form are saved to the `waitlist` table in Supabase, not a `newsletter` table. This may be intentional but means you can't distinguish newsletter signups from waitlist signups.  
**Fix:** Either rename the Supabase table to `newsletter`, or create a separate `newsletter` table.

---

### 10. Slug collision on provider registration
**File:** `src/app/register/page.tsx` and `src/app/api/register-provider/route.ts`  
When a provider registers, their slug is generated from their business name (e.g. "My Business" → "my-business"). If two providers have similar names the second will fail silently (the API returns `success: true` even on error). The provider will have an account but no profile row.  
**Fix:** Add a uniqueness check and append a number suffix if the slug already exists.

---

## WORKING WELL ✅

| Area | Status |
|------|--------|
| **Authentication** | Full flow: login, register, email verify, forgot password, reset, MFA (TOTP) |
| **Provider dashboard** | Stats, enquiries, reviews, profile completion, ranking, quick edit |
| **Stripe payments** | Checkout sessions, webhook handling, plan upgrades/downgrades |
| **Supabase** | All credentials configured, admin client, RLS-aware routes |
| **API routes** | All authenticated with Bearer token verification and rate limiting |
| **Enquiries** | Submit, list, mark-read — all working with proper auth guards |
| **Reviews** | Submit and list with rate limiting |
| **Email (Resend)** | Contact form sends notification to hello@referaus.com |
| **Admin panel** | Protected by email allowlist, covers users/providers/enquiries/contacts |
| **Providers directory** | Search, category/location filter, verified filter, star rating filter, sort, infinite scroll |
| **Provider detail pages** | Dynamic routes `/providers/[slug]` |
| **Blog** | Built with static data in `src/data/blog-posts.ts` |
| **SEO** | Metadata, Open Graph, Twitter cards, sitemap, schema.org JSON-LD |
| **Performance** | SWR caching on providers list, skeleton loaders, infinite scroll |
| **Component library** | 42 components including modals, toast, keyboard shortcuts, command palette |
| **All pages built** | Home, About, Pricing, FAQ, Blog, Contact, Services, Resources, Compare, For Coordinators/Providers/Participants, Testimonial |

---

## Missing Features / Not Yet Built

- **No `public/` assets** — no icons, no OG image, no service worker file (`sw.js`). The service worker registration component exists but there's no actual SW file to register.
- **"Profile Views" analytics** — Dashboard shows "Coming soon" for profile views. Not yet implemented.
- **Direct booking system** — Listed as a Pro plan feature in pricing but not built.
- **Area alerts** — Listed as a Pro plan feature, not built.
- **Competitor insights** — Listed as a Premium plan feature, not built.
- **API access** — Listed as a Premium plan feature, not built.
- **Multi-location support** — Listed as a Premium plan feature, not built.
- **Billing portal** — `createPortalSession` exists in `src/lib/stripe.ts` but there's no route or UI to access it. Subscribers can't manage their own billing.

---

## Recommended Fix Order

1. Add `next.config.mjs` (images will break without it — 5 minutes)
2. Create `public/manifest.json` and add icon files (30 minutes)
3. Add `og-image.png` to `/public` (create or export a 1200×630 image)
4. Add `<CookieConsent />` to layout.tsx (2 minutes)
5. Fix Stripe `customer.subscription.updated` webhook (15 minutes)
6. Decide on verified-only vs all-providers in the directory
7. Fix the `force-dynamic` / `revalidate` conflict in providers-public route (2 minutes)

---

*Report generated by Claude — Cowork mode*
