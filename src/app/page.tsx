"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { providers } from "@/lib/providers";
import { ProviderCard } from "@/components/ProviderCard";
import { FloatingParticles } from "@/components/AnimatedBackground";

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
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { value: 10, suffix: "+", label: "Verified Providers" },
  { value: 500, suffix: "+", label: "Reviews" },
  { value: 0, suffix: "", label: "Cost to Participants", display: "Free" },
  { value: 100, suffix: "%", label: "Hunter Region" },
];

const features = [
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    title: "Smart Search",
    desc: "Filter by service, location, availability, and verified status. Find what you need in seconds.",
    color: "blue",
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    title: "Verified Providers",
    desc: "Identity-verified and NDIS-registered. Every premium provider checked.",
    color: "orange",
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    title: "Real Reviews",
    desc: "Genuine reviews from NDIS participants. No fakes, no paid placements.",
    color: "blue",
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    title: "Instant Connect",
    desc: "Send enquiries directly. Get responses in hours, not days.",
    color: "orange",
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    title: "Direct Booking",
    desc: "Book appointments directly with premium providers. Zero phone tag.",
    color: "blue",
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: "Provider Analytics",
    desc: "Powerful insights dashboard. Understand and grow your business.",
    color: "orange",
  },
];

const testimonials = [
  { name: "Sarah M.", role: "NDIS Participant, Merewether", text: "NexaConnect made finding the right support worker so easy. I found Sunshine Support within minutes and they have been incredible!" },
  { name: "Dr. James P.", role: "Provider, PhysioPlus Maitland", text: "Since joining NexaConnect, our enquiries from Lake Macquarie have tripled. Game-changer for Hunter Region providers." },
  { name: "Priya S.", role: "Parent, Charlestown", text: "Finding quality early intervention for my son was stressful until NexaConnect. Little Stars was exactly what we needed." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <FloatingParticles />

        {/* Hero glow line */}
        <div className="absolute top-16 left-0 right-0 glow-line" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full glass text-blue-300 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Now live in Newcastle and Hunter Region
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[0.95] mb-8"
          >
            Find Your
            <br />
            <span className="gradient-text">Perfect NDIS</span>
            <br />
            Provider
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/45 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Browse trusted providers across Newcastle, Lake Macquarie and the Hunter.
            Read real reviews, compare services, and connect for free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/providers"
              className="group relative px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold text-base transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:bg-blue-500 overflow-hidden"
            >
              <span className="relative z-10">Browse Providers</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl glass hover:bg-white/[0.08] text-white font-medium text-base transition-all"
            >
              List Your Service
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                  {s.display || <AnimatedCounter target={s.value} suffix={s.suffix} />}
                </div>
                <div className="text-xs text-white/35">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#060B14] to-transparent" />
      </section>

      {/* Glow divider */}
      <div className="glow-line" />

      {/* Features */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">
              Platform Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              Everything you need to
              <br />
              <span className="gradient-text">find the right support</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`group glass rounded-2xl p-8 card-glow ${f.color === "orange" ? "card-glow-orange" : ""} cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${
                  f.color === "orange"
                    ? "bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20"
                    : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
                }`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">How it works</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-16">
              Three steps to <span className="gradient-text">better support</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Search", desc: "Browse our directory by service, location, or keyword.", icon: <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
              { step: "02", title: "Compare", desc: "Read reviews, check availability, compare side by side.", icon: <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
              { step: "03", title: "Connect", desc: "Send an enquiry or book directly with your provider.", icon: <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-8 relative overflow-hidden group"
              >
                {/* Step number watermark */}
                <div className="absolute top-4 right-4 text-5xl font-black text-white/[0.03]">{item.step}</div>

                <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 mx-auto group-hover:bg-blue-500/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>

                {/* Shimmer */}
                <div className="absolute inset-0 shimmer rounded-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line" />

      {/* Featured providers */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Featured</span>
              <h2 className="text-4xl font-black tracking-tight">Top-rated providers</h2>
            </div>
            <Link href="/providers" className="text-sm text-blue-400 hover:text-blue-300 transition-colors hidden sm:block">
              View all providers
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <ProviderCard provider={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">Testimonials</span>
            <h2 className="text-4xl font-black tracking-tight">
              Trusted by the <span className="gradient-text">Hunter community</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#F97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-white/55 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-orange-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-400">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/35">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line" />

      {/* CTA */}
      <section className="py-32 px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
              Ready to find your
              <br />
              <span className="gradient-text">perfect provider?</span>
            </h2>
            <p className="text-lg text-white/40 mb-10 max-w-lg mx-auto">
              Join hundreds of NDIS participants in the Hunter Region who have found better support through NexaConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/providers"
                className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
              >
                Browse Providers
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-2xl glass hover:bg-white/[0.08] text-orange-400 font-medium transition-all"
              >
                Provider Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}