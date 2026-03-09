import Link from "next/link";
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
