"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { providers } from "@/lib/providers";
import { ProviderCard } from "@/components/ProviderCard";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stats = [
  { value: "10+", label: "Verified Providers" },
  { value: "500+", label: "Reviews" },
  { value: "Free", label: "For Participants" },
  { value: "Hunter", label: "Region Focus" },
];

const features = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Smart Search",
    desc: "Filter by service type, location, availability, and verified status to find exactly what you need.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Verified Providers",
    desc: "Every premium provider is identity-verified and NDIS-registered. No guesswork.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Real Reviews",
    desc: "Genuine reviews from NDIS participants. Make informed decisions based on real experiences.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Connect",
    desc: "Send enquiries directly to providers and get responses within hours, not days.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Direct Booking",
    desc: "Book appointments directly with premium providers. No phone tag.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Provider Analytics",
    desc: "Powerful insights dashboard to understand and grow your provider business.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "NDIS Participant, Merewether",
    text: "NexaConnect made finding the right support worker so easy. I found Sunshine Support within minutes and they have been incredible!",
  },
  {
    name: "Dr. James P.",
    role: "Provider — PhysioPlus, Maitland",
    text: "Since joining NexaConnect, our enquiries from the Lake Macquarie area have tripled. The platform is a game-changer for Hunter Region providers.",
  },
  {
    name: "Priya S.",
    role: "Parent, Charlestown",
    text: "Finding quality early intervention for my son was stressful until I found NexaConnect. Little Stars was exactly what we needed.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.05] blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Now live in Newcastle & Hunter Region
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
           
            className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8"
          >
            Find Your
            <br />
            <span className="gradient-text">Perfect NDIS</span>
            <br />
            Provider
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
           
            className="text-lg sm:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Browse trusted providers across Newcastle, Lake Macquarie &amp; the Hunter.
            Read real reviews, compare services, and connect — completely free.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
           
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/providers"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Browse Providers
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-base border border-white/[0.08] transition-all"
            >
              List Your Service
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
           
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 max-w-2xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">
              Why NexaConnect
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              Everything you need to
              <br />
              <span className="gradient-text">find the right support</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl bg-surface border border-white/[0.06] p-8 transition-all duration-300 hover:border-blue-500/20 card-glow"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 bg-surface/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">
              How it works
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-16">
              Three steps to
              <br />
              <span className="gradient-text">better support</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Search", desc: "Browse our directory of NDIS providers by service, location, or keyword." },
              { step: "02", title: "Compare", desc: "Read reviews, check availability, and compare providers side by side." },
              { step: "03", title: "Connect", desc: "Send an enquiry or book directly with your chosen provider." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-6xl font-black text-white/[0.04] mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2 -mt-8">{item.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured providers */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">
                Featured
              </span>
              <h2 className="text-4xl font-black tracking-tight">Top-rated providers</h2>
            </div>
            <Link href="/providers" className="text-sm text-blue-400 hover:text-blue-300 transition-colors hidden sm:block">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.slice(0, 6).map((p) => (
              <ProviderCard key={p.slug} provider={p} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/providers" className="text-sm text-blue-400">View all providers →</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">
              Testimonials
            </span>
            <h2 className="text-4xl font-black tracking-tight">
              Trusted by the
              <span className="gradient-text"> Hunter community</span>
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
                className="rounded-2xl bg-surface border border-white/[0.06] p-8"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#F97316">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
              Ready to find your
              <br />
              <span className="gradient-text">perfect provider?</span>
            </h2>
            <p className="text-lg text-white/45 mb-10 max-w-lg mx-auto">
              Join hundreds of NDIS participants in the Hunter Region who&apos;ve found better support through NexaConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/providers"
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                Browse Providers — It&apos;s Free
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-medium border border-orange-500/20 transition-all"
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
