import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ReferAus provider dashboard — manage your profile, view enquiries, and track analytics.",
  openGraph: {
    title: "Dashboard | ReferAus — NDIS Provider Directory",
    description: "Your ReferAus provider dashboard — manage your profile, view enquiries, and track analytics.",
    url: "https://referaus.com/dashboard",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | ReferAus — NDIS Provider Directory",
    description: "Your ReferAus provider dashboard — manage your profile, view enquiries, and track analytics.",
  },
  alternates: { canonical: "https://referaus.com/dashboard" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
