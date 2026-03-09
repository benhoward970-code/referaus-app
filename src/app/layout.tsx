import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://referaus.com"),
  title: {
    default: "ReferAus — NDIS Provider Directory",
    template: "%s | ReferAus — NDIS Provider Directory",
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
    title: "ReferAus — NDIS Provider Directory",
    description: "Find trusted NDIS providers in Newcastle and the Hunter Region. Real reviews, direct messaging, free for participants.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus — NDIS Provider Directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReferAus — NDIS Provider Directory",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
