# ReferAus Design System — Implementation Files

Drop-in code for your Next.js + Tailwind codebase. These three files match the visual system shown in `design-system.html`.

## What's here

| File | Where it goes | Purpose |
|---|---|---|
| `tailwind.config.ts` | Project root (replaces existing) | Color tokens, font stacks, font sizes, shadows, radii, animations |
| `globals.css` | `src/app/globals.css` (replaces existing) | CSS variables + reusable component classes (`btn-primary`, `card`, `pill-verified`, `input`, `eyebrow`, etc.) |
| `components-reference.tsx` | Reference only — copy snippets you need | Real, working examples of every pattern |

## Setup

1. **Replace `tailwind.config.ts`** at project root with `implementation/tailwind.config.ts`.
2. **Replace `src/app/globals.css`** with `implementation/globals.css`.
3. (Optional) **Use `next/font`** instead of the Google Fonts CSS import for better performance. If you do, remove the `@import url(...)` line from globals.css and configure fonts in `src/app/layout.tsx`:

   ```tsx
   import { Outfit, Oswald, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
   const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
   // ...etc, then add ${outfit.variable} to <html className=...>
   ```
4. **Restart the dev server** (Tailwind config changes require a restart).

## How to use

### Buttons
```tsx
<button className="btn-primary">Send Enquiry</button>
<button className="btn-secondary">Cancel</button>
```

### Pills / badges
```tsx
<span className="pill-verified">Verified Provider</span>
<span className="pill-success">NDIS Registered</span>
```

### Cards
```tsx
<div className="card card-pad">...</div>
```

### Forms
```tsx
<label className="label">Email</label>
<input className="input" type="email" />
```

### Typography (Tailwind classes)
```tsx
<h1 className="text-h1">Headline</h1>
<h2 className="text-h2">Subhead</h2>
<p className="text-body text-ink-700">Body copy</p>
<p className="eyebrow">Step 02</p>
```

### Color usage
- **Primary CTAs** → `bg-orange-500` (only color that converts; keep it for the action you most want clicked)
- **Links / accents / verified state** → `text-blue-600`, `bg-blue-50`
- **Body text** → `text-ink-700`
- **Muted text** → `text-ink-500`
- **Borders** → `border-line-200`
- **Card surfaces** → `bg-white` on `bg-surface-page` (sky-50)

### Italic-serif accent (display headlines)
```tsx
<h1 className="h-display">
  Find your <em>perfect</em> provider
</h1>
```
The `<em>` inside `.h-display` automatically picks up Instrument Serif italic with the brand gradient fill.

## Migration notes

Your existing code uses raw Tailwind defaults (`bg-blue-600`, `bg-orange-500`, `border-gray-200`, etc.). These still work — the new config extends the theme, it doesn't break it. But for new code, prefer the semantic tokens:

| Old | New | Why |
|---|---|---|
| `text-gray-500` | `text-ink-500` | Semantic — "muted text" not "color #6b7280" |
| `border-gray-200` | `border-line-200` | Semantic — "divider" not "color" |
| `bg-gray-50` | `bg-surface-muted` | Semantic — "muted surface" |
| Inline button styles | `btn-primary` / `btn-secondary` | DRY + ensures hover/focus consistency |
| Inline pill styles | `pill-verified` / `pill-success` | DRY |
| Custom `<input>` classes | `input` + `label` | Consistent focus rings |

You can migrate incrementally — old classes keep working.

## Component examples

See `components-reference.tsx` for ten ready-to-paste components:
1. Buttons (all variants)
2. Pills / Badges
3. Card
4. Provider listing card (composite)
5. Form fields
6. Section heading
7. Star rating
8. Empty state
9. Skeleton loader
10. Toast
