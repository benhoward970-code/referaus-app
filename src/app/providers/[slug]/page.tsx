"use client";
import { use, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { providers } from "@/lib/providers";
import { EnquiryModal } from "@/components/EnquiryModal";

const reviews = [
  { author: "Emily T.", date: "2 weeks ago", rating: 5, text: "Absolutely wonderful service. The team went above and beyond to understand my needs and match me with the right support worker." },
  { author: "Mark L.", date: "1 month ago", rating: 5, text: "Professional, reliable, and genuinely caring. I have been with them for 6 months and could not be happier." },
  { author: "Jessica W.", date: "2 months ago", rating: 4, text: "Great service overall. Communication could be slightly better but the quality of care is excellent." },
];

export default function ProviderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const provider = providers.find((p) => p.slug === slug);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  if (!provider) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Provider not found</h1>
        <Link href="/providers" className="text-blue-400">Back to directory</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/providers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-500 mb-8 transition-colors">
          ? Back to providers
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-gray-200 flex items-center justify-center shrink-0">
            <span className="text-4xl font-bold text-blue-400">{provider.name[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{provider.name}</h1>
              {provider.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm text-orange-400 font-medium">{provider.category}</span>
              <span className="text-gray-500">|</span>
              <span className="text-sm text-gray-500">{provider.location}</span>
              <span className="text-gray-500">|</span>
              <div className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span className="text-sm font-semibold text-orange-400">{provider.rating}</span>
                <span className="text-xs text-gray-500">({provider.reviewCount} reviews)</span>
              </div>
            </div>
            <p className="text-gray-500 leading-relaxed">{provider.description}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6">Services Offered</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.services.map((s) => (
                  <div key={s} className="flex items-center gap-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-500">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6">Reviews</h2>
              <div className="space-y-6">
                {reviews.map((r, i) => (
                  <div key={i} className={i > 0 ? "pt-6 border-t border-gray-200" : ""}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{r.author}</span>
                        <div className="flex gap-0.5">
                          {[...Array(r.rating)].map((_, j) => (
                            <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="#F97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{r.date}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
              <button onClick={() => setEnquiryOpen(true)} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25 mb-3">
                Send Enquiry
              </button>
              <button className="w-full py-3 rounded-xl glass hover:bg-white/[0.08] text-gray-900 font-medium text-sm transition-all mb-6">
                Book Appointment
              </button>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-500">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {provider.phone}
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {provider.email}
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {provider.location}, NSW
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <EnquiryModal
        providerName={provider.name}
        providerSlug={provider.slug}
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </div>
  );
}
