import type { Metadata } from "next";
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
