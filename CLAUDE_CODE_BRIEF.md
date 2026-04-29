# ReferAus Design System — Implementation Brief for Claude Code

> **For your local AI agent**: This is a complete, self-contained handoff. Read this file top-to-bottom, then execute the steps. Everything you need is in `implementation/`.

---

## Mission

Apply the ReferAus design system (defined in `design-system.html` and `implementation/`) to the live Next.js codebase. The system is already designed; your job is to wire it in and migrate existing components to use it.

## Constraints

- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase. Don't change the stack.
- **Don't break what works.** The site is live. Migrate incrementally, page by page.
- **Preserve all functionality.** Auth, forms, API routes, Supabase calls, modal state — leave alone. Only change *visual* code (className strings, layouts, typography).
- **Use semantic tokens** (`text-ink-700`, `border-line-200`, `bg-surface-page`) over raw Tailwind colors (`text-gray-700`, `border-gray-200`, `bg-sky-50`) in new/migrated code. Old code keeps working.

---

## Step 1 — Install the foundation

Three files, three places:

1. **Replace** `tailwind.config.ts` at project root with `implementation/tailwind.config.ts`.
2. **Replace** `src/app/globals.css` with `implementation/globals.css`.
   - If the existing globals.css has custom rules, preserve them by appending after the `@layer utilities` block.
3. **Restart** the dev server. (Tailwind config changes require a fresh build.)

Verify: a button styled `className="btn-primary"` should render orange with the correct hover/shadow.

---

## Step 2 — Fonts (recommended, optional)

If you're not already using `next/font`, switch to it for performance. In `src/app/layout.tsx`:

```tsx
import { Outfit, Oswald, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";

const outfit  = Outfit({ subsets: ["latin"], variable: "--font-sans", weight: ["300","400","500","600","700","800","900"] });
const oswald  = Oswald({ subsets: ["latin"], variable: "--font-display", weight: ["500","600","700"] });
const serif   = Instrument_Serif({ subsets: ["latin"], variable: "--font-serif", weight: "400", style: ["normal","italic"] });
const mono    = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500"] });

// in your <html>:
<html className={`${outfit.variable} ${oswald.variable} ${serif.variable} ${mono.variable}`}>
```

Then remove the `@import url("...fonts.googleapis.com...")` line from globals.css.

---

## Step 3 — Migration map

Find-and-replace these patterns across `src/`. **Be careful** — only replace inside `className` strings, not inside route logic or Tailwind utilities you genuinely need.

| Find (raw Tailwind) | Replace (semantic token) | Notes |
|---|---|---|
| `text-gray-900` | `text-ink-900` | Primary text |
| `text-gray-700` | `text-ink-700` | Secondary text |
| `text-gray-600` | `text-ink-700` | Body |
| `text-gray-500` | `text-ink-500` | Muted |
| `text-gray-400` | `text-ink-400` | Disabled / labels |
| `border-gray-200` | `border-line-200` | Standard divider |
| `border-gray-100` | `border-line-100` | Subtle divider |
| `bg-gray-50` | `bg-surface-muted` | Soft surface |
| `bg-gray-100` | `bg-surface-soft` | Soft surface |
| `bg-sky-50` | `bg-surface-page` | Page background |

Then look for **inline button styles** like:
```tsx
<button className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:shadow-lg ...">
```
Replace with:
```tsx
<button className="btn-primary">
```

And **inline pill styles** like:
```tsx
<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
```
Replace with:
```tsx
<span className="pill-verified">
```

---

## Step 4 — Migrate page-by-page

Suggested order (lowest risk → highest):

1. **Footer** (`src/components/Footer.tsx` or similar) — small, low-risk warm-up.
2. **Header / Navigation** — visible everywhere.
3. **Homepage** (`src/app/page.tsx`) — high visibility, but contained.
4. **Provider directory** (`src/app/providers/page.tsx` + `ProviderCard.tsx`) — touches the core listing flow.
5. **Provider profile** (`src/app/providers/[slug]/ProviderDetailClient.tsx`) — biggest file, save for last.
6. **Forms** (`EnquiryModal`, `CallbackModal`, contact pages) — replace input/button styling.
7. **Auth flows, dashboard, register** — finish the long tail.

**For each page**:
- Run the find/replace from Step 3.
- Replace inline button styles with `.btn-*` classes.
- Replace inline pill styles with `.pill-*` classes.
- Replace inline form input styles with `.input` and `.label`.
- Use `<h1 className="text-h1">` etc. instead of arbitrary `text-[Npx]`.
- Visually QA in the browser before moving on.

---

## Step 5 — New patterns to introduce

These don't exist in the codebase today but improve the UX:

### Eyebrow labels
Above section titles, add a mono-caps label:
```tsx
<p className="eyebrow mb-2">Step 02</p>
<h2 className="text-h2">Find your provider</h2>
```

### Display headline with serif accent
For hero sections:
```tsx
<h1 className="h-display">
  Find your <em>perfect</em> NDIS provider
</h1>
```
The `<em>` inside `.h-display` auto-picks-up Instrument Serif italic + the brand gradient.

### Skeleton loaders
Replace `animate-pulse` placeholders with the branded shimmer:
```tsx
<div className="skeleton h-4 rounded w-2/3" />
```

---

## Step 6 — Verification checklist

Before declaring done, verify:

- [ ] `tailwind.config.ts` builds without errors (`npm run build`)
- [ ] No console errors in dev mode
- [ ] Primary CTA buttons are orange-500 (not blue-600 or any other color)
- [ ] Verified-provider pills use `pill-verified` class everywhere
- [ ] All form inputs use the `.input` + `.label` pattern
- [ ] Section headings use `text-h2` / `text-h3` (not arbitrary px sizes)
- [ ] Body text uses `text-ink-700` (not `text-gray-600`)
- [ ] Page background is `bg-surface-page` (sky-50)
- [ ] All cards are `bg-white` with `border-line-200` and `rounded-2xl`
- [ ] Focus rings appear on all interactive elements (Tab through to verify)
- [ ] Mobile (375px) and desktop (1440px) both render cleanly

---

## Reference files

In `implementation/`:
- **`tailwind.config.ts`** — token definitions, replaces existing
- **`globals.css`** — CSS vars + component classes, replaces existing
- **`components-reference.tsx`** — 10 working component examples (buttons, cards, pills, forms, star rating, empty state, skeleton, toast, etc.)
- **`README.md`** — quick-reference cheatsheet

In project root:
- **`design-system.html`** — visual reference with all tokens, type, components rendered. Open this in a browser when you need to see what the system *looks like*.
- **`provider-profile.html`** + supporting JSX — hi-fi target for the provider detail page.

---

## Voice & content rules (don't lose these in migration)

- **Tone**: warm, plain Australian English. Avoid corporate jargon.
- **CTAs**: action-first, never "Click here". Use "Send Enquiry", "Find a Provider", "Get Started Free".
- **Plain English first**: "Funded by your NDIS plan" beats "NDIS plan-eligible service provision".
- **No "users"**: say "participants", "providers", "support coordinators" — or just "you".
- **Numbers under 10**: spell out (one, two, three) except in stats and prices.

---

## When in doubt

1. Open `design-system.html` in the browser — the answer is probably visualized there.
2. Check `implementation/components-reference.tsx` — 10 patterns covered.
3. If a pattern isn't in the system, follow the existing aesthetic: white cards, `rounded-2xl`, `border-line-200`, generous padding, orange-500 for the one most-important action, blue-600 for trust/links.
4. Ask the user before inventing new colors, fonts, or radii.
