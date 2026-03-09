import { Metadata } from "next";
import { providers } from "@/lib/providers";
import ProviderDetailClient from "./ProviderDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const provider = providers.find((p) => p.slug === slug);
  if (!provider) return { title: "Provider Not Found" };
  return {
    title: provider.name,
    description: `${provider.name} — ${provider.category} provider in ${provider.location}. ${provider.description}`,
    openGraph: {
      title: `${provider.name} | ReferAus`,
      description: provider.description,
      url: `https://referaus.com/providers/${provider.slug}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: provider.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${provider.name} | ReferAus`,
      description: provider.description,
    },
    alternates: { canonical: `https://referaus.com/providers/${provider.slug}` },
  };
}

export default function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProviderDetailClient params={params} />;
}
