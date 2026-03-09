"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { providers } from "@/lib/providers";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const features = [
  { icon: "🔍", title: "Smart Search", desc: "Search by location, NDIS support category, availability, and ratings. Find providers who offer what you need, near where you are." },
  { icon: "⭐", title: "Real Reviews", desc: "Verified reviews from real NDIS participants. No fake ratings, no paid placements. See what people actually think." },
  { icon: "💬", title: "Direct Messaging", desc: "Message providers instantly. Ask questions, check availability, discuss your needs — before you pick up the phone." },
  { icon: "📋", title: "Detailed Profiles", desc: "Every provider shows services, areas covered, qualifications, availability, and what participants say about them." },
  { icon: "📍", title: "Location-Based", desc: "Find providers near you. Search by suburb, region, or postcode. See distance and service areas at a glance." },
  { icon: "🆓", title: "Free for Participants", desc: "Always. No sign-up fees, no premium tiers, no hidden costs. Browse, search, message, connect — completely free." },
];

const testimonials = [
  { name: "Sarah M.", role: "Participant, Merewether", text: "ReferAus made finding the right support worker so easy. I found Sunshine Support within minutes and they have been incredible with our son." },
  { name: "Dr. James P.", role: "PhysioPlus Maitland", text: "Since listing on Refer, our enquiries from the Hunter Region have tripled. The direct messaging means we actually connect with participants." },
  { name: "Priya S.", role: "Parent, Charlestown", text: "I spent weeks calling around. A friend told me about Refer — I found Little Stars in ten minutes, messaged them, had an appointment within the week." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 max-w-[1200px] mx-auto relative">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(249,115,22,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-[40%] left-[-15%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(37,99,235,0.04)_0%,transparent_70%)] pointer-events-none" />

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="font-mono text-[0.7rem] text-blue-600 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-orange-500" />
          referaus.com — Australia&apos;s NDIS Marketplace
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="heading-bold text-[clamp(3rem,8vw,5.5rem)] leading-[1.05] mb-6 max-w-[800px]">
          Find the right{" "}
          <span className="text-orange-500">NDIS provider</span>{" "}
          for you
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 text-lg max-w-[550px] mb-8 font-light leading-relaxed">
          Search, compare, and connect with NDIS providers in your area. Real reviews from real participants. Direct messaging. No middleman.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-4 flex-wrap">
          <Link href="/providers" className="px-8 py-3.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all hover:-translate-y-0.5">
            Find a Provider
          </Link>
          <Link href="/register" className="px-8 py-3.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all">
            List Your Practice
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="flex gap-12 mt-16 pt-8 border-t border-gray-100">
          {[
            { num: 250, suffix: "+", label: "Providers Listed" },
            { num: 1200, suffix: "+", label: "Participants Connected" },
            { num: 15000, suffix: "+", label: "Successful Referrals" },
          ].map((s) => (
            <div key={s.label}>
              <div className="heading-bold text-[2.5rem] text-blue-600"><AnimatedCounter target={s.num} suffix={s.suffix} /></div>
              <div className="text-[0.75rem] text-gray-400 uppercase tracking-[0.1em] mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* How it works */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">How It Works</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Three steps. That&apos;s it.</h2>
        <p className="text-gray-500 max-w-[600px] mb-12 font-light">No sign-up required to browse. Find the support you need in minutes, not weeks.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: "1", title: "Search", desc: "Enter your location and what kind of support you need. Filter by category, rating, availability, and distance." },
            { num: "2", title: "Compare", desc: "Browse provider profiles with real reviews from other participants. See services, specialties, and ratings." },
            { num: "3", title: "Connect", desc: "Send an enquiry or message the provider directly. No phone tag, no waiting on hold. Get a response and start." },
          ].map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="text-center py-8">
              <div className="heading-bold text-[3.5rem] text-orange-500 leading-none">{step.num}</div>
              <div className="font-bold text-lg mt-4 mb-2">{step.title}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{step.desc}</div>
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
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
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
            { num: "15,000+", label: "Referrals Made" },
            { num: "250+", label: "Verified Providers" },
            { num: "98%", label: "Connection Rate" },
            { num: "< 2hrs", label: "Avg Response Time" },
          ].map((s) => (
            <div key={s.label}>
              <div className="heading-bold text-[3rem]">{s.num}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Providers */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label mb-3">Browse Providers</p>
            <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight">Top-rated in your area</h2>
          </div>
          <Link href="/providers" className="text-sm text-blue-600 hover:text-blue-700 transition-colors hidden sm:block">
            View all providers →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.slice(0, 6).map((p, i) => (
            <motion.div key={p.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link href={`/providers/${p.slug}`} className="block border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`p-5 text-white ${i % 3 === 0 ? "bg-gradient-to-r from-blue-600 to-blue-500" : i % 3 === 1 ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gradient-to-r from-purple-600 to-purple-500"}`}>
                  <div className="font-bold text-lg">{p.name}</div>
                  <div className="text-sm opacity-80">{p.category}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 text-sm">{"★".repeat(Math.floor(p.rating))}</span>
                    <span className="text-xs text-gray-400">{p.rating} ({p.reviewCount} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.services.slice(0, 3).map((s) => (
                      <span key={s} className="text-[0.7rem] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{s}</span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-1.5">📍 {p.location}</div>
                </div>
                <div className="text-center py-3 border-t border-gray-100 text-blue-600 font-semibold text-sm hover:bg-blue-600 hover:text-white transition-all">
                  View Profile & Connect →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">What People Say</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-12">Real stories from real people</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-gray-50 border border-gray-100 rounded-xl p-8 relative">
              <div className="heading-bold text-[4rem] text-orange-500 opacity-20 absolute top-2 left-5 leading-none">"</div>
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

      {/* Provider Pricing */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
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
              <Link href="/register" className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${plan.style === "orange" ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white rounded-2xl p-12 text-center">
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

