import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AuthProvider } from "@/components/AuthProvider";

const heading = Space_Grotesk({
  variable: "--font-cabinet",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  variable: "--font-satoshi",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexaConnect - Find NDIS Providers in Newcastle and Hunter Region",
  description: "Search, compare and connect with trusted NDIS disability service providers in Newcastle, Lake Macquarie and the Hunter Region. Free for participants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground noise">
        <AuthProvider>
          <AnimatedBackground />
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}