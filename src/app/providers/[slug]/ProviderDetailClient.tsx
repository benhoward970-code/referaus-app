"use client";
import { use, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { providers } from "@/lib/providers";
import { EnquiryModal } from "@/components/EnquiryModal";

const mockReviews = [
  { author: "Emily T.", date: "2 weeks ago", rating: 5, text: "Absolutely wonderful service. The team went above and beyond to understand my needs and match me with the right support worker." },
  { author: "Mark L.", date: "1 month ago", rating: 5, text: "Professional, reliable, and genuinely caring. I have been with them for 6 months and could not be happier." },
  { author: "Jessica W.", date: "2 months ago", rating: 4, text: "Great service overall. Communication could be slightly better but the quality of care is excellent." },
];

export default function ProviderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const provider = providers.find((p) => p.slug === slug);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const jsonLd = provider ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    description: provider.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.location,
      addressRegion: "NSW",
      addressCountry: "AU",
    },
    telephone: provider.phone,
    email: provider.email,
    url: `https://referaus.com/providers/${provider.slug}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: provider.rating,
      reviewCount: provider.reviewCount,
    },
  } : null;

  if (!provider) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Provider not found</h1>
        <Link href="/providers" className="text-blue-400">Back to directory</Link>
      </div>
    </div>
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          <Link href="/providers" className="hover:text-gray-600 transition-colors">Providers</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          <span className="text-gray-600 truncate max-w-xs">{provider.name}</span>
        </nav>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-gray-200 flex items-center justify-center shrink-0">
            <span className="text-4xl font-bold text-blue-400">{provider.name[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">{provider.name}</h1>
              {provider.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Verified Provider
                </span>
              )}
              {!provider.verified && (
                <Link href="/register" className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors">
                  Claim this listing
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm text-orange-500 font-medium">{provider.category}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{provider.location}, NSW</span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(provider.rating) ? "#F97316" : "#e5e7eb"}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className="text-sm font-semibold text-orange-500 ml-1">{provider.rating}</span>
                <span className="text-xs text-gray-400">({provider.reviewCount} reviews)</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{provider.description}</p>
            <button
              onClick={() => setEnquiryOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-orange-500/25"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Request a Quote
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Services Offered</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.services.map((s) => (
                  <div key={s} className="flex items-center gap-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-sm text-gray-600">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Map placeholder */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-8 pt-8 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Location</h2>
                <p className="text-sm text-gray-500 mt-1">{provider.location}, NSW, Australia</p>
              </div>
              <div className="relative bg-gray-100 h-56 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: "linear-gradient(#c8d6e5 1px, transparent 1px), linear-gradient(90deg, #c8d6e5 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
                <div className="relative flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow">{provider.location}</span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(provider.name + " " + provider.location + " NSW")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Send a Message</h2>
              <p className="text-sm text-gray-500 mb-6">Get in touch with {provider.name} directly.</p>
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  </div>
                  <p className="font-semibold text-gray-800">Message sent!</p>
                  <p className="text-sm text-gray-500 mt-1">{provider.name} will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="04xx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="Hi, I am interested in learning more about your services..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-orange-500">{provider.rating}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((star) => (
                        <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(provider.rating) ? "#F97316" : "#e5e7eb"}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{provider.reviewCount} reviews</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {mockReviews.map((r, i) => (
                  <div key={i} className={i > 0 ? "pt-6 border-t border-gray-100" : ""}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {r.author[0]}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{r.author}</span>
                        <div className="flex gap-0.5">
                          {[...Array(r.rating)].map((_, j) => (
                            <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="#F97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-10">{r.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Get in Touch</h3>
              <button
                onClick={() => setEnquiryOpen(true)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25 mb-3"
              >
                Send Enquiry
              </button>
              <button
                onClick={() => setEnquiryOpen(true)}
                className="w-full py-3 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-sm transition-all mb-6"
              >
                Request a Quote
              </button>
              <div className="space-y-3 text-sm">
                <a href={`tel:${provider.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {provider.phone}
                </a>
                <a href={`mailto:${provider.email}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {provider.email}
                </a>
                <div className="flex items-center gap-3 text-gray-600">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {provider.location}, NSW
                </div>
              </div>
              {provider.verified && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl p-3 border border-green-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span className="font-medium">Verified NDIS Provider</span>
                  </div>
                </div>
              )}
              {!provider.verified && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link href="/register" className="block text-center text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors">
                    Is this your business? Claim this listing
                  </Link>
                </div>
              )}
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