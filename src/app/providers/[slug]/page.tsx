"use client";
import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { providers } from "@/lib/providers";

const reviews = [
  { author: "Emily T.", date: "2 weeks ago", rating: 5, text: "Absolutely wonderful service. The team went above and beyond to understand my needs." },
  { author: "Mark L.", date: "1 month ago", rating: 5, text: "Professional, reliable, and genuinely caring. Could not be happier." },
  { author: "Jessica W.", date: "2 months ago", rating: 4, text: "Great service overall. The quality of care is excellent." },
];

export default function ProviderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const provider = providers.find((p) => p.slug === slug);
  if (!provider) return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-2">Provider not found</h1><Link href="/providers" className="text-blue-400">Back</Link></div></div>);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/providers" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8">Back to providers</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-white/[0.08] flex items-center justify-center shrink-0">
            <span className="text-4xl font-bold text-blue-400">{provider.name[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{provider.name}</h1>
              {provider.verified && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Verified</span>}
            </div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm text-orange-400 font-medium">{provider.category}</span>
              <span className="text-white/20">|</span>
              <span className="text-sm text-white/50">{provider.location}</span>
              <span className="text-white/20">|</span>
              <span className="text-sm font-semibold text-orange-400">{provider.rating} ({provider.reviewCount} reviews)</span>
            </div>
            <p className="text-white/55 leading-relaxed">{provider.description}</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
              <h2 className="text-xl font-bold mb-6">Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.services.map((s) => (<div key={s} className="flex items-center gap-3 py-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-sm text-white/70">{s}</span></div>))}
              </div>
            </div>
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
              <h2 className="text-xl font-bold mb-6">Reviews</h2>
              <div className="space-y-6">
                {reviews.map((r, i) => (<div key={i} className={i > 0 ? "pt-6 border-t border-white/[0.06]" : ""}><div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{r.author}</span><span className="text-xs text-white/30">{r.date}</span></div><p className="text-sm text-white/50 leading-relaxed">{r.text}</p></div>))}
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
              <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm mb-3">Send Enquiry</button>
              <button className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-sm border border-white/[0.08] mb-6">Book Appointment</button>
              <div className="space-y-3 text-sm text-white/50">
                <p>{provider.phone}</p>
                <p>{provider.email}</p>
                <p>{provider.location}, NSW</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
