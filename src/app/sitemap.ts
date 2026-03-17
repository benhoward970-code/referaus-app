import { MetadataRoute } from "next";
import { providers } from "@/lib/providers";
import { blogPosts } from "@/data/blog-posts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zfhapnnlxfhxsqpqcuje.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://referaus.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/providers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/resources`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/for-participants`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/for-providers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const allSlugs = new Set(providers.map(p => p.slug));

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/providers?select=slug`, {
      headers: { apikey: SUPABASE_KEY.trim(), Authorization: `Bearer ${SUPABASE_KEY.trim()}` },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const dbProviders = await res.json();
      dbProviders.forEach((p: { slug: string }) => allSlugs.add(p.slug));
    }
  } catch {
    // Fall back to hardcoded only
  }

  const providerRoutes: MetadataRoute.Sitemap = Array.from(allSlugs).map((slug) => ({
    url: `${base}/providers/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...providerRoutes, ...blogRoutes];
}
