import fs from 'fs';
import path from 'path';

const base = 'src/app';

// ── layout.tsx ──────────────────────────────────────────────
const layoutOld = `export const metadata: Metadata = {
  title: "ReferAus - Find NDIS Providers | referaus.com",
  description: "Search, compare and connect with trusted NDIS providers in Newcastle and the Hunter Region. Free for participants.",
  metadataBase: new URL("https://referaus.com"),
};`;

const layoutNew = `export const metadata: Metadata = {
  metadataBase: new URL("https://referaus.com"),
  title: {
    default: "ReferAus \u2014 NDIS Provider Directory",
    template: "%s | ReferAus \u2014 NDIS Provider Directory",
  },
  description:
    "Search, compare and connect with trusted NDIS providers in Newcastle and the Hunter Region. Free for participants. Real reviews, direct messaging, no middleman.",
  keywords: ["NDIS", "NDIS providers", "Newcastle", "Hunter Region", "disability support", "NDIS directory"],
  authors: [{ name: "ReferAus", url: "https://referaus.com" }],
  creator: "ReferAus",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://referaus.com",
    siteName: "ReferAus",
    title: "ReferAus \u2014 NDIS Provider Directory",
    description: "Find trusted NDIS providers in Newcastle and the Hunter Region. Real reviews, direct messaging, free for participants.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus \u2014 NDIS Provider Directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReferAus \u2014 NDIS Provider Directory",
    description: "Find trusted NDIS providers in Newcastle and the Hunter Region. Free for participants.",
    images: ["/og-image.png"],
    creator: "@referaus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://referaus.com" },
};`;

let layoutContent = fs.readFileSync(path.join(base, 'layout.tsx'), 'utf8');
layoutContent = layoutContent.replace(layoutOld, layoutNew);
fs.writeFileSync(path.join(base, 'layout.tsx'), layoutContent);
console.log('layout.tsx updated');

// ── Per-route layout files ───────────────────────────────────
const routes = [
  {
    dir: 'about',
    title: 'About Us',
    description: 'Learn about ReferAus — the NDIS provider directory built for Newcastle and the Hunter Region. Our mission, values, and team.',
    canonical: 'https://referaus.com/about',
  },
  {
    dir: 'blog',
    title: 'Blog',
    description: 'NDIS news, guides, and resources for participants and providers in Newcastle and the Hunter Region.',
    canonical: 'https://referaus.com/blog',
  },
  {
    dir: 'compare',
    title: 'Compare Providers',
    description: 'Compare NDIS providers side by side. Services, ratings, location, and more — all in one place.',
    canonical: 'https://referaus.com/compare',
  },
  {
    dir: 'login',
    title: 'Log In',
    description: 'Log in to your ReferAus account to manage your provider profile or saved searches.',
    canonical: 'https://referaus.com/login',
  },
  {
    dir: 'dashboard',
    title: 'Dashboard',
    description: 'Your ReferAus provider dashboard — manage your profile, view enquiries, and track analytics.',
    canonical: 'https://referaus.com/dashboard',
  },
  {
    dir: 'privacy',
    title: 'Privacy Policy',
    description: 'ReferAus privacy policy — how we collect, use, and protect your personal information.',
    canonical: 'https://referaus.com/privacy',
  },
  {
    dir: 'terms',
    title: 'Terms of Service',
    description: 'ReferAus terms of service — the rules and conditions for using the ReferAus platform.',
    canonical: 'https://referaus.com/terms',
  },
  {
    dir: 'providers',
    title: 'Find NDIS Providers',
    description: 'Browse and search verified NDIS providers in Newcastle and the Hunter Region. Filter by category, location, and rating.',
    canonical: 'https://referaus.com/providers',
  },
];

for (const route of routes) {
  const dir = path.join(base, route.dir);
  const layoutPath = path.join(dir, 'layout.tsx');
  const content = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${route.title}",
  description: "${route.description}",
  openGraph: {
    title: "${route.title} | ReferAus \u2014 NDIS Provider Directory",
    description: "${route.description}",
    url: "${route.canonical}",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "${route.title} | ReferAus \u2014 NDIS Provider Directory",
    description: "${route.description}",
  },
  alternates: { canonical: "${route.canonical}" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
  fs.writeFileSync(layoutPath, content);
  console.log(`${route.dir}/layout.tsx written`);
}

// ── providers/[slug]/page.tsx — add generateMetadata ──────────────
const slugPagePath = path.join(base, 'providers/[slug]/page.tsx');
let slugContent = fs.readFileSync(slugPagePath, 'utf8');
if (!slugContent.includes('generateMetadata')) {
  const insertAfter = `"use client";`;
  const metadataBlock = `
import type { Metadata } from "next";
import { providers } from "@/lib/providers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const provider = providers.find((p) => p.slug === slug);
  if (!provider) return { title: "Provider Not Found" };
  return {
    title: provider.name,
    description: \`\${provider.name} — \${provider.category} provider in \${provider.location}. \${provider.description}\`,
    openGraph: {
      title: \`\${provider.name} | ReferAus\`,
      description: provider.description,
      url: \`https://referaus.com/providers/\${provider.slug}\`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: provider.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: \`\${provider.name} | ReferAus\`,
      description: provider.description,
    },
    alternates: { canonical: \`https://referaus.com/providers/\${provider.slug}\` },
  };
}
`;
  // generateMetadata must be in a server component file
  // Since page.tsx is "use client", we need to separate concerns.
  // Create a server wrapper page.tsx and rename client component.
  const clientPath = path.join(base, 'providers/[slug]/ProviderDetailClient.tsx');
  fs.writeFileSync(clientPath, slugContent);
  
  const serverPage = `import { Metadata } from "next";
import { providers } from "@/lib/providers";
import ProviderDetailClient from "./ProviderDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const provider = providers.find((p) => p.slug === slug);
  if (!provider) return { title: "Provider Not Found" };
  return {
    title: provider.name,
    description: \`\${provider.name} — \${provider.category} provider in \${provider.location}. \${provider.description}\`,
    openGraph: {
      title: \`\${provider.name} | ReferAus\`,
      description: provider.description,
      url: \`https://referaus.com/providers/\${provider.slug}\`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: provider.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: \`\${provider.name} | ReferAus\`,
      description: provider.description,
    },
    alternates: { canonical: \`https://referaus.com/providers/\${provider.slug}\` },
  };
}

export default function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProviderDetailClient params={params} />;
}
`;
  fs.writeFileSync(slugPagePath, serverPage);
  console.log('providers/[slug]/page.tsx → server wrapper; client component saved');
}

// ── Homepage: wrap for JSON-LD ──────────────────────────────
// Rename page.tsx → HomeClient.tsx, create server page.tsx
const homePage = path.join(base, 'page.tsx');
const homeClient = path.join(base, 'HomeClient.tsx');
const homeContent = fs.readFileSync(homePage, 'utf8');
if (!fs.existsSync(homeClient)) {
  fs.writeFileSync(homeClient, homeContent);
  const homeServer = `import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Find NDIS Providers in Newcastle | ReferAus",
  description: "Search, compare and connect with trusted NDIS providers in Newcastle and the Hunter Region. Real reviews, direct messaging. Free for participants.",
  openGraph: {
    title: "Find NDIS Providers in Newcastle | ReferAus",
    description: "Search, compare and connect with trusted NDIS providers in Newcastle and the Hunter Region.",
    url: "https://referaus.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find NDIS Providers in Newcastle | ReferAus",
    description: "Search, compare and connect with trusted NDIS providers in Newcastle and the Hunter Region.",
  },
  alternates: { canonical: "https://referaus.com" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ReferAus",
  url: "https://referaus.com",
  logo: "https://referaus.com/logo.png",
  description: "Australia's NDIS provider directory for Newcastle and the Hunter Region.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Newcastle",
    addressRegion: "NSW",
    addressCountry: "AU",
  },
  sameAs: [],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
`;
  fs.writeFileSync(homePage, homeServer);
  console.log('homepage split into HomeClient.tsx + server page.tsx with JSON-LD');
}

// ── Add JSON-LD to provider client page ───────────────────────
// Already handled via server wrapper + we'll inject in the client component
// The server wrapper can pass props but simpler is to add script in client.
// Let's add JSON-LD script directly into ProviderDetailClient.tsx
const providerClientPath = path.join(base, 'providers/[slug]/ProviderDetailClient.tsx');
let providerClient = fs.readFileSync(providerClientPath, 'utf8');
if (!providerClient.includes('application/ld+json')) {
  // Add JSON-LD after provider check
  providerClient = providerClient.replace(
    `  if (!provider) return (`,
    `  const jsonLd = provider ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    description: provider.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.location,
      addressRegion: "NSW",
      addressCountry: "AU",
    },
    telephone: provider.phone,
    email: provider.email,
    url: \`https://referaus.com/providers/\${provider.slug}\`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: provider.rating,
      reviewCount: provider.reviewCount,
    },
  } : null;

  if (!provider) return (`
  );
  // Add the script tag right after the opening div
  providerClient = providerClient.replace(
    `      <div className="max-w-5xl mx-auto">`,
    `      <div className="max-w-5xl mx-auto">
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}`
  );
  fs.writeFileSync(providerClientPath, providerClient);
  console.log('ProviderDetailClient.tsx: JSON-LD added');
}

// ── sitemap.ts ────────────────────────────────────────────────
const sitemapContent = `import { MetadataRoute } from "next";
import { providers } from "@/lib/providers";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://referaus.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: \`\${base}/providers\`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: \`\${base}/about\`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: \`\${base}/blog\`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: \`\${base}/compare\`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: \`\${base}/pricing\`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: \`\${base}/register\`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: \`\${base}/login\`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: \`\${base}/privacy\`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: \`\${base}/terms\`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const providerRoutes: MetadataRoute.Sitemap = providers.map((p) => ({
    url: \`\${base}/providers/\${p.slug}\`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...providerRoutes];
}
`;
fs.writeFileSync(path.join(base, 'sitemap.ts'), sitemapContent);
console.log('sitemap.ts written');

// ── robots.ts ─────────────────────────────────────────────────
const robotsContent = `import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: "https://referaus.com/sitemap.xml",
    host: "https://referaus.com",
  };
}
`;
fs.writeFileSync(path.join(base, 'robots.ts'), robotsContent);
console.log('robots.ts written');

// ── not-found.tsx ─────────────────────────────────────────────
const notFoundContent = `import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="max-w-lg text-center">
        <p className="font-mono text-[0.7rem] text-orange-500 tracking-[0.2em] uppercase mb-6 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-orange-500" />
          404 Error
          <span className="w-8 h-px bg-orange-500" />
        </p>

        <h1 className="text-[clamp(4rem,15vw,8rem)] font-black leading-none text-gray-100 select-none mb-2">
          404
        </h1>

        <h2 className="text-2xl font-bold mb-4">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all hover:-translate-y-0.5"
          >
            Go Home
          </Link>
          <Link
            href="/providers"
            className="px-8 py-3.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all"
          >
            Find Providers
          </Link>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(base, 'not-found.tsx'), notFoundContent);
console.log('not-found.tsx written');

// ── loading.tsx ───────────────────────────────────────────────
const loadingContent = `export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
        </div>
        <p className="font-mono text-[0.7rem] text-gray-400 tracking-[0.2em] uppercase">
          Loading&hellip;
        </p>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(base, 'loading.tsx'), loadingContent);
console.log('loading.tsx written');

console.log('\nAll SEO files written successfully!');
