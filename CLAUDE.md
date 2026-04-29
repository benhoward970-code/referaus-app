# ReferAus Design System — Implementation Brief for Claude

You are implementing the **ReferAus design system** in this Next.js + Tailwind CSS codebase. This document is your complete specification. Work through it methodically and ask the user before making changes that affect more than one file.

## Project context

- **Stack:** Next.js 14 (App Router), Tailwind CSS, TypeScript, Supabase
- **Repo:** `referaus-app` (NDIS provider directory, Newcastle / Hunter region)
- **Audience:** NDIS participants, families, support coordinators, plan managers
- **Design system source of truth:** the files in `design-system/` (this folder)

## Implementation order

Do these in order. After each step, run `npm run build` (or `npm run dev`) and confirm with the user before moving on.

### Step 1 — Install the token system

1. Replace `tailwind.config.ts` at the project root with `design-system/tailwind.config.ts`.
2. Replace `src/app/globals.css` with `design-system/globals.css`.
3. Restart the dev server (Tailwind config changes require it).
4. Verify: the home page should look identical or very close — the new config **extends** the default Tailwind theme, it doesn't replace working classes.

**Important:** the existing codebase uses raw Tailwind colors (`bg-blue-600`, `text-gray-500`, etc.). These still work. The new config adds **semantic tokens** alongside them. Don't refactor existing files in this step — just install the foundation.

### Step 2 — Pick one component to migrate as a pilot

Suggest to the user: start with `src/components/ProviderCard.tsx` because it's used everywhere. Migrate it to use the new semantic classes (`card`, `card-pad`, `pill-verified`, `btn-primary`, `text-ink-500`, `border-line-200`, etc.) without changing its behavior or props. Use `design-system/components-reference.tsx` example #4 as the target shape.

Show the diff to the user and get approval before continuing.

### Step 3 — Migrate the rest, page by page

Recommended order (highest visual impact first):

1. `src/app/page.tsx` (home)
2. `src/app/providers/page.tsx` (directory)
3. `src/app/providers/[slug]/ProviderDetailClient.tsx` (provider profile)
4. `src/components/Header.tsx` / `Footer.tsx`
5. `src/components/EnquiryModal.tsx`, `CallbackModal.tsx`
6. `src/app/register/page.tsx` (provider signup)
7. `src/app/dashboard/**` (provider dashboard)

For each file:
- Replace inline button styles with `btn-primary` / `btn-secondary` / `btn-ghost`
- Replace inline pill/badge styles with `pill-verified` / `pill-success` / `pill-pending` / `pill-neutral`
- Replace `text-gray-*` with `text-ink-*` (700→700, 500→500, 400→400)
- Replace `border-gray-200` with `border-line-200`
- Replace ad-hoc card wrappers with `<div className="card card-pad">`
- Replace ad-hoc form inputs with `className="input"` and `<label className="label">`
- Use `text-h1` / `text-h2` / `text-h3` / `text-body` / `eyebrow` instead of arbitrary `text-[Npx]`

### Step 4 — Add the italic-serif accent to the homepage hero

The brand uses an Instrument Serif italic accent with a gradient fill for hero headlines. Find the home page hero `<h1>`, wrap one or two key words in `<em>`, and apply the `h-display` class:

```tsx
<h1 className="h-display">
  Find your <em>perfect</em> NDIS provider
</h1>
```

The `<em>` inside `.h-display` automatically gets the gradient fill — no extra classes needed.

### Step 5 — Verify accessibility

The audience requires AA-level accessibility minimum:
- All interactive elements have `min-height: 44px` (the `.btn` class enforces this — keep it).
- Focus rings are visible (`focus-visible:ring-2`) — don't override with `outline-none` alone.
- Color contrast: orange-500 on white = 3.4:1 (AA Large only — never use orange-500 for body text; only for buttons / accents on white backgrounds with ≥18px text).
- Verify with the user that they have an a11y testing flow.

## Design tokens reference

### Colors

| Token | Hex | Use for |
|---|---|---|
| `orange-500` | `#f97316` | **Primary CTA only.** One per screen. |
| `orange-600` | `#ea580c` | CTA hover |
| `orange-50` | `#fff7ed` | CTA tint backgrounds (rare) |
| `blue-600` | `#2563eb` | Links, accents, "verified" state |
| `blue-50` | `#eff6ff` | Trust pill backgrounds, info banners |
| `purple-600` | `#7c3aed` | Tertiary accent (gradients only) |
| `green-500` | `#22c55e` | Success states, "NDIS registered" |
| `red-500` | `#ef4444` | Errors, destructive actions |
| `ink-900` | `#1a1d23` | Headings |
| `ink-700` | `#374151` | Body copy |
| `ink-500` | `#6b7280` | Secondary text |
| `ink-400` | `#9ca3af` | Disabled, placeholder |
| `line-200` | `#e5e7eb` | Borders, dividers |
| `surface-page` | `#f0f9ff` | Page background (sky-50) |

### Typography

- **Display / sans:** Outfit (300, 400, 500, 600, 700, 800, 900)
- **Display alt:** Oswald (logo wordmark only)
- **Serif accent:** Instrument Serif italic (for `<em>` inside hero headlines)
- **Mono:** IBM Plex Mono (eyebrows, code, numeric data)

Use `text-display` / `text-h1` / `text-h2` / `text-h3` / `text-h4` / `text-body-lg` / `text-body` / `text-small` / `text-micro` / `text-eyebrow` instead of arbitrary sizes.

### Spacing

Stick to Tailwind's default scale: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px). Don't invent intermediate values.

### Shadows

| Class | Use for |
|---|---|
| `shadow-sm` | Subtle lift (chips, small cards) |
| `shadow-card` | Default card elevation |
| `shadow-md` | Hover state for cards |
| `shadow-xl` | Featured / hero cards (brand-tinted glow) |
| `shadow-cta` | Primary CTA hover (orange-tinted glow) |

## Voice and copy

- **Plain English, conversational.** Read aloud — if it sounds stilted, rewrite.
- **No jargon without explanation.** "NDIS plan-managed" → ok. "ILO/SIL/SDA acronym soup" → not ok.
- **Specific over vague.** "Newcastle, Maitland and Lake Macquarie" beats "the local area".
- **Affirming, not clinical.** "Find a provider you'll love working with" beats "Browse our service registry".
- **Australian English** (-ise, -our endings; "mum" not "mom").

## Don't do these things

- Don't use emoji as iconography. SVG icons (1.6 stroke) only.
- Don't use raw `text-gray-*` in new code — use `text-ink-*`.
- Don't use more than one orange CTA per screen.
- Don't use gradient backgrounds on full sections (only on hero accent text and one accent block per page).
- Don't break the 44px minimum tap target on mobile.
- Don't introduce new fonts. The four families above are it.
- Don't auto-translate Australian English to American English.

## When in doubt

Ask the user. Especially before:
- Removing or renaming an existing component
- Changing copy that mentions specific places, prices, or services
- Adding a new dependency
- Touching routing, auth, or Supabase queries

The design system is about **how things look and feel**, not **what they do**. Keep behavior identical unless explicitly asked to change it.
