import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "NDIS Provider Plans & Pricing | ReferAus" },
  description: "Simple, transparent pricing for NDIS providers. Free listing forever. Upgrade to Starter ($29/mo), Pro ($79/mo), or Premium ($149/mo) for more visibility, analytics, and direct messaging.",
  openGraph: {
    title: "NDIS Provider Plans & Pricing | ReferAus",
    description: "Free to list. Upgrade when you're ready. Transparent pricing for NDIS providers in Newcastle and the Hunter Region.",
    url: "https://referaus.com/pricing",
    siteName: "ReferAus",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "NDIS Provider Plans & Pricing | ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NDIS Provider Plans & Pricing | ReferAus",
    description: "Free to list. Upgrade when you're ready. Transparent pricing for NDIS providers.",
    images: ["/opengraph-image"],
  },
  alternates: { canonical: "https://referaus.com/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
