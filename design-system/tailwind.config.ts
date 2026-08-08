import type { Config } from "tailwindcss";

/**
 * ReferAus Design System — Tailwind config
 * Drop this in at the root of your Next.js project (replaces existing tailwind.config.ts).
 * Pairs with implementation/globals.css.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand color tokens ──────────────────────────────────────────
      colors: {
        // Primary brand
        orange: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // primary CTA
          600: "#ea580c",
          700: "#c2410c",
        },
        // Trust / link
        blue: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb", // accent / link
          700: "#1d4ed8",
        },
        // Tertiary
        purple: {
          50:  "#faf5ff",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        // Status
        green: { 50: "#f0fdf4", 500: "#22c55e", 600: "#16a34a", 700: "#15803d" },
        red:   { 50: "#fef2f2", 500: "#ef4444", 600: "#dc2626" },
        amber: { 50: "#fffbeb", 500: "#f59e0b", 600: "#d97706" },

        // Neutrals (semantic)
        ink: {
          900: "#1a1d23", // text primary
          700: "#374151", // text secondary
          500: "#6b7280", // text muted
          400: "#9ca3af", // text disabled
          300: "#d1d5db",
        },
        line: {
          100: "#f3f4f6",
          200: "#e5e7eb",
        },
        surface: {
          page:  "#f0f9ff", // sky-50 page background
          card:  "#ffffff",
          muted: "#f9fafb",
          soft:  "#f3f4f6",
        },
        // Brand ink (logo hex fill)
        "brand-ink": "#1a0f05",
      },

      // ── Typography ──────────────────────────────────────────────────
      fontFamily: {
        sans:    ["Outfit", "system-ui", "sans-serif"],
        display: ["Oswald", "sans-serif"],
        serif:   ["'Instrument Serif'", "Georgia", "serif"],
        mono:    ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Recommended scale (use these instead of arbitrary text-[Npx])
        "display": ["64px", { lineHeight: "1.02", letterSpacing: "-0.02em", fontWeight: "900" }],
        "h1":      ["44px", { lineHeight: "1.05", letterSpacing: "-0.02em",  fontWeight: "900" }],
        "h2":      ["30px", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "800" }],
        "h3":      ["22px", { lineHeight: "1.3",  fontWeight: "700" }],
        "h4":      ["18px", { lineHeight: "1.4",  fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.55" }],
        "body":    ["16px", { lineHeight: "1.55" }],
        "small":   ["14px", { lineHeight: "1.5" }],
        "micro":   ["12px", { lineHeight: "1.4" }],
        "eyebrow": ["11px", { lineHeight: "1.4", letterSpacing: "0.2em",  fontWeight: "500" }],
      },

      // ── Radius (spec uses 4px → 20px scale) ─────────────────────────
      borderRadius: {
        "sm":   "6px",
        "md":   "10px",
        "lg":   "12px",
        "xl":   "16px",
        "2xl":  "20px",
        "3xl":  "24px",
      },

      // ── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        sm:  "0 1px 2px rgba(0,0,0,.04)",
        md:  "0 4px 14px rgba(0,0,0,.06)",
        lg:  "0 8px 30px rgba(0,0,0,.06)",
        xl:  "0 14px 40px rgba(37,99,235,.12)",          // brand-glow elevation
        cta: "0 10px 25px -5px rgba(249,115,22,.35)",    // primary CTA hover
        card:"0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04)",
      },

      // ── Spacing additions ───────────────────────────────────────────
      // Tailwind's default scale is fine; only add if you specifically need them.

      // ── Animation ───────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
