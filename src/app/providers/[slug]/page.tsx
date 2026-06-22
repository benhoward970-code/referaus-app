import { Metadata } from "next";
import { redirect } from "next/navigation";
import { providers } from "@/lib/providers";
import ProviderDetailClient from "./ProviderDetailClient";

async function resolveSlug(slug: string): Promise<string | null> {
  // Check if this slug was a previous_slug (i.e. provider renamed their business)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/providers?select=slug&previous_slug=eq.${encodeURIComponent(slug)}&limit=1`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.slug ?? null;
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

  return <ProviderDetailClient params={Promise.resolve({ slug })} />;
}
