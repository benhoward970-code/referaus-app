import { Metadata } from "next";
import { redirect } from "next/navigation";
import { providers } from "@/lib/providers";
import ProviderDetailClient from "./ProviderDetailClient";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function resolveSlug(slug: string): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/providers?select=slug&previous_slug=eq.${encodeURIComponent(slug)}&limit=1`,
    {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.slug ?? null;
}

async function fetchProviderForSchema(slug: string) {
  try {
    const [provRes, revRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/providers?select=name,bio,description,suburb,state,phone,website,logo_url,rating,categories&slug=eq.${encodeURIComponent(slug)}&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, next: { revalidate: 3600 } }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/reviews?select=reviewer_name,rating,text,created_at&provider_slug=eq.${encodeURIComponent(slug)}&limit=20`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, next: { revalidate: 3600 } }
      ),
    ]);
    const prov = provRes.ok ? (await provRes.json())[0] : null;
    const revs = revRes.ok ? await revRes.json() : [];
    return { prov, revs };
  } catch {
    return { prov: null, revs: [] };
  }
}

function buildJsonLd(slug: string, prov: Record<string, unknown> | null, revs: Record<string, unknown>[]) {
  const hardcoded = providers.find((p) => p.slug === slug);
  const name = (prov?.name || hardcoded?.name || "NDIS Provider") as string;
  const description = (prov?.bio || prov?.description || hardcoded?.description || "") as string;
  const suburb = (prov?.suburb || hardcoded?.location || "") as string;
  const state = (prov?.state || "NSW") as string;
  const phone = (prov?.phone || hardcoded?.phone || "") as string;
  const website = (prov?.website || "") as string;
  const logo = (prov?.logo_url || "") as string;
  const rating = prov?.rating as number | undefined;
  const categories = (prov?.categories as string[]) || (hardcoded?.category ? [hardcoded.category] : []);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url: `https://referaus.com/providers/${slug}`,
    ...(logo ? { image: logo } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(website ? { sameAs: [website] } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: suburb,
      addressRegion: state,
      addressCountry: "AU",
    },
    ...(categories.length > 0 ? { additionalType: categories[0] } : {}),
    ...(rating && revs.length > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: revs.length,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
    ...(revs.length > 0 ? {
      review: revs.slice(0, 5).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.reviewer_name || "Anonymous" },
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.text || "",
        datePublished: r.created_at ? String(r.created_at).slice(0, 10) : undefined,
      })),
    } : {}),
  };

  return JSON.stringify(schema);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Try hardcoded data first (available at build time, no async DB call needed)
  const provider = providers.find((p) => p.slug === slug);

  if (!provider) {
    // Provider might exist only in DB - return generic metadata
    return {
      title: "Provider | ReferAus",
      description: "View NDIS provider details on ReferAus - the Hunter Region NDIS marketplace.",
    };
  }

  return {
    title: provider.name,
    description: `${provider.name} — ${provider.category} provider in ${provider.location}. ${provider.description}`,
    openGraph: {
      title: `${provider.name} | ReferAus`,
      description: provider.description,
      url: `https://referaus.com/providers/${provider.slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: provider.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${provider.name} | ReferAus`,
      description: provider.description,
    },
    alternates: { canonical: `https://referaus.com/providers/${provider.slug}` },
  };
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // If this slug was renamed, redirect permanently to the new URL
  const newSlug = await resolveSlug(slug);
  if (newSlug) {
    redirect(`/providers/${newSlug}`);
  }

  // Fetch data for schema.org JSON-LD (SEO)
  const { prov, revs } = await fetchProviderForSchema(slug);
  const jsonLd = buildJsonLd(slug, prov, revs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ProviderDetailClient params={Promise.resolve({ slug })} />
    </>
  );
}
