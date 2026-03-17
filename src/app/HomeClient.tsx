"use client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { providers } from "@/lib/providers";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) { setCount(target); return; }
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, prefersReduced]);
  return <span ref={ref}>{count}{suffix}</span>;
}


const features = [
  { icon: "🔍", title: "Smart Search", desc: "Search by location, NDIS support category, availability, and ratings. Find providers who offer what you need, near where you are." },
  { icon: "⭐", title: "Real Reviews", desc: "Verified reviews from real NDIS participants. No fake ratings, no paid placements. See what people actually think." },
  { icon: "💬", title: "Direct Messaging", desc: "Message providers instantly. Ask questions, check availability, discuss your needs before you pick up the phone." },
  { icon: "📋", title: "Detailed Profiles", desc: "Every provider shows services, areas covered, qualifications, availability, and what participants say about them." },
  { icon: "📍", title: "Location-Based", desc: "Find providers near you. Search by suburb, region, or postcode. See distance and service areas at a glance." },
  { icon: "🆓", title: "Free for Participants", desc: "Always. No sign-up fees, no premium tiers, no hidden costs. Browse, search, message, connect completely free." },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "NDIS Participant · Merewether, NSW",
    text: "ReferAus made finding the right support worker so easy. I found a provider within minutes and they have been absolutely incredible. I wish I had known about this site years ago.",
  },
  {
    name: "Priya S.",
    role: "NDIS Participant · Charlestown, NSW",
    text: "I spent weeks calling around trying to find an OT who had availability. A friend told me about ReferAus — I found the right provider in ten minutes, messaged them, and had an appointment within the week.",
  },
  {
    name: "Mark T.",
    role: "NDIS Participant · Lake Macquarie, NSW",
    text: "The reviews on ReferAus are genuine and helpful. I could see what other participants thought before making a choice. That transparency made all the difference for me and my family.",
  },
];

const featuredProviders = providers.filter((p) => p.verified).slice(0, 4);

const gradients = [
  "from-blue-600 to-blue-500",
  "from-orange-500 to-orange-400",
  "from-purple-600 to-purple-500",
  "from-teal-600 to-teal-500",
];

export default function Home() {
  const prefersReduced = useReducedMotion();
  const d = (n: number) => prefersReduced ? 0 : n;

  return (
    <>
      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 max-w-[1200px] mx-auto relative">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(249,115,22,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-[40%] left-[-15%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(37,99,235,0.04)_0%,transparent_70%)] pointer-events-none" />

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5) }}
          className="font-mono text-[0.7rem] text-blue-600 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-orange-500" />
          referaus.com — Australia&apos;s NDIS Marketplace
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.7), delay: d(0.1) }}
          className="heading-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.05] mb-6 max-w-[820px]">
          Find Trusted{" "}
          <span className="text-orange-500">NDIS Providers</span>{" "}
          Near You
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.6), delay: d(0.2) }}
          className="text-gray-500 text-lg max-w-[550px] mb-8 font-light leading-relaxed">
          Search, compare, and connect with NDIS providers in your area. Real reviews from real participants. Direct messaging. No middleman.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5), delay: d(0.3) }}
          className="mb-7">
          <SearchAutocomplete className="w-full max-w-[600px]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5), delay: d(0.4) }}
          className="flex flex-wrap gap-3 mb-4">
          {[
            { icon: "🏢", label: "500+ Providers" },
            { icon: "✅", label: "Verified Reviews" },
            { icon: "🆓", label: "100% Free" },
          ].map((badge) => (
            <span key={badge.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600">
              <span>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.6), delay: d(0.55) }}
          className="flex flex-wrap gap-6 sm:gap-12 mt-12 pt-8 border-t border-gray-100">
          {[
            { num: 50, suffix: "+", label: "Providers Listed" },
            { num: 50, suffix: "+", label: "Hunter Region Providers" },
            { num: 100, suffix: "%", label: "Free for Participants" },
          ].map((s) => (
            <div key={s.label}>
              <div className="heading-bold text-[2rem] sm:text-[2.5rem] text-blue-600">
                <AnimatedCounter target={s.num} suffix={s.suffix} />
              </div>
              <div className="text-[0.75rem] text-gray-400 uppercase tracking-[0.1em] mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* How It Works */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">How It Works</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Three steps. That&apos;s it.</h2>
        <p className="text-gray-500 max-w-[600px] mb-14 font-light">No sign-up required to browse. Find the support you need in minutes, not weeks.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "🔍", num: "01", title: "Search", desc: "Enter your location and what kind of support you need. Filter by category, rating, availability, and distance." },
            { icon: "⚖️", num: "02", title: "Compare", desc: "Browse provider profiles with real reviews from other participants. See services, specialties, and ratings side by side." },
            { icon: "🤝", num: "03", title: "Connect", desc: "Send an enquiry or message the provider directly. No phone tag, no waiting on hold. Get a response and start." },
          ].map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.15), duration: d(0.5) }}
              className="card p-8 relative overflow-hidden group">
              <div className="absolute top-4 right-5 heading-bold text-[4rem] text-gray-100 leading-none select-none group-hover:text-orange-50 transition-colors">
                {step.num}
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl mb-5">
                {step.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Features */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">Why ReferAus</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Built for the NDIS community</h2>
        <p className="text-gray-500 max-w-[600px] mb-12 font-light">Everything participants and providers need to find each other — nothing they don&apos;t.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.08), duration: d(0.4) }}
              className="card relative overflow-hidden p-8">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-lg">{f.icon}</div>
              <h3 className="font-semibold text-[1.05rem] mb-2">{f.title}</h3>
              <p className="text-gray-500 text-[0.85rem] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-600 text-white py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex justify-around text-center flex-wrap gap-8">
          {[
            { num: "50+", label: "Local Providers" },
            { num: "Free", label: "For Participants" },
            { num: "24/7", label: "Always Available" },
            { num: "Hunter", label: "Region Focus" },
          ].map((s) => (
            <div key={s.label}>
              <div className="heading-bold text-[2rem] sm:text-[3rem]">{s.num}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p className="section-label mb-3">Featured Providers</p>
            <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight">Verified &amp; top-rated</h2>
          </div>
          <Link href="/providers" className="text-sm text-blue-600 hover:text-blue-700 transition-colors hidden sm:block">
            View all providers &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProviders.map((p, i) => (
            <motion.div key={p.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.08), duration: d(0.4) }}>
              <Link href={`/providers/${p.slug}`}
                className="flex flex-col h-full border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`p-5 text-white bg-gradient-to-r ${gradients[i % gradients.length]}`}>
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="font-bold text-base leading-tight">{p.name}</div>
                    {p.verified && (
                      <span className="text-[0.6rem] font-bold bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">VERIFIED</span>
                    )}
                  </div>
                  <div className="text-sm opacity-80">{p.category}</div>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 text-sm">{"★".repeat(Math.floor(p.rating))}</span>
                    <span className="text-xs text-gray-400">{p.rating} ({p.reviewCount})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.services.slice(0, 2).map((s) => (
                      <span key={s} className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{s}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">📍 {p.location}</div>
                </div>
                <div className="text-center py-3 border-t border-gray-100 text-blue-600 font-semibold text-xs hover:bg-blue-600 hover:text-white transition-all">
                  View Profile &rarr;
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">What Participants Say</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-12">Real stories, real impact</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.1), duration: d(0.4) }}
              className="bg-gray-50 border border-gray-100 rounded-xl p-8 relative">
              <div className="heading-bold text-[4rem] text-orange-500 opacity-20 absolute top-2 left-5 leading-none">&ldquo;</div>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => <span key={j} className="text-orange-500 text-sm">★</span>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{t.text}</p>
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-gray-400">{t.role}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Provider CTA */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: d(0.5) }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-blue-200 mb-3">For Providers</p>
            <h2 className="heading-bold text-[clamp(1.8rem,4vw,2.8rem)] mb-3">Are you an NDIS Provider?</h2>
            <p className="text-blue-100 max-w-[480px] leading-relaxed text-sm">
              Get listed in front of thousands of NDIS participants actively searching for your services. Free to list — upgrade when you&apos;re ready.
            </p>
            <ul className="mt-5 space-y-2">
              {["Free basic listing", "Verified profile badge", "Direct participant messaging"].map((item) => (
                <li key={item} className="text-sm text-blue-100 flex items-center gap-2">
                  <span className="text-orange-400 font-bold">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 min-w-[200px] text-center">
            <Link href="/register"
              className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-400 hover:-translate-y-0.5 transition-all shadow-lg whitespace-nowrap">
              List Your Practice Free
            </Link>
            <Link href="/pricing" className="text-sm text-blue-200 hover:text-white transition-colors">
              View pricing plans &rarr;
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Provider Pricing */}
      <section className="py-8 pb-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">For Providers</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Grow your practice</h2>
        <p className="text-gray-500 max-w-[600px] mb-12 font-light">Get found by participants actively looking for your services. Free to list. Upgrade when you&apos;re ready.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { tier: "Free", price: "$0", desc: "Get listed and start receiving enquiries.", features: ["Basic provider listing", "Show services and areas", "Enquiry notifications", "Up to 5 reviews"], cta: "Get Listed Free", style: "outline" },
            { tier: "Pro", price: "$49", desc: "Stand out and connect directly with participants.", features: ["Priority in search results", "Direct messaging", "Profile analytics", "Unlimited reviews", "Highlighted badge", "Area alerts"], cta: "Start Free Trial", style: "orange", popular: true },
            { tier: "Premium", price: "$149", desc: "Maximum visibility and dedicated support.", features: ["Everything in Pro", "Featured placement", "Multi-location support", "Custom branded profile", "Referral tracking", "Account manager"], cta: "Contact Sales", style: "outline" },
          ].map((plan) => (
            <div key={plan.tier} className={`bg-white border rounded-xl p-8 relative ${plan.popular ? "border-orange-500 shadow-lg shadow-orange-500/10" : "border-gray-200"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[0.6rem] font-bold px-3 py-0.5 rounded-full tracking-wider">MOST POPULAR</div>}
              <div className="text-sm text-gray-500 uppercase tracking-wider">{plan.tier}</div>
              <div className="heading-bold text-[3rem] my-2">{plan.price}<span className="text-base text-gray-400 font-sans not-italic">/mo</span></div>
              <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-orange-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${plan.style === "orange" ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Participant CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="heading-bold text-[clamp(1.8rem,4vw,2.8rem)] mb-4">Ready to find the right provider?</h2>
          <p className="opacity-90 max-w-[500px] mx-auto mb-8">Join thousands of NDIS participants who found better support through ReferAus. Free, fast, and it works.</p>
          <Link href="/providers" className="inline-block px-8 py-3.5 bg-white text-orange-500 font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Search Providers Now
          </Link>
        </div>
      </section>
    </>
  );
}
