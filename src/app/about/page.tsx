"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const values = [
  { title: "Participant First", desc: "Every decision we make starts with the question: does this make life easier for NDIS participants?", icon: "heart" },
  { title: "Transparency", desc: "No hidden fees, no sponsored rankings. What you see is what you get.", icon: "eye" },
  { title: "Local Focus", desc: "We know Newcastle and the Hunter. We are not a faceless national platform.", icon: "map" },
  { title: "Accessibility", desc: "Built from the ground up to be accessible to everyone, regardless of ability.", icon: "access" },
];

const timeline = [
  { year: "2025", title: "The Problem", desc: "We saw NDIS participants in Newcastle struggling to find quality providers. Google searches, outdated directories, word of mouth. There had to be a better way." },
  { year: "2026", title: "ReferAus Launches", desc: "We built the platform we wished existed. Clean, simple, focused on the Hunter Region. Real reviews from real participants." },
  { year: "2026+", title: "Growing Together", desc: "Expanding across NSW while keeping the local focus that makes us different. Every provider vetted, every review verified." },
];

const team = [
  { name: "Ben Deasey", role: "Founder & CEO", desc: "Passionate about using technology to improve disability services in Australia." },
  { name: "ReferAus Team", role: "Engineering & Design", desc: "A small, dedicated team building the future of NDIS provider discovery." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">About Us</span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Making NDIS provider
              <br />
              discovery <span className="gradient-text">simple</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              ReferAus was born from a simple frustration: finding the right NDIS provider in Newcastle should not be this hard. We are changing that.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-20 bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl bg-surface border border-gray-200 p-10 sm:p-14">
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">Our Mission</span>
              <p className="text-2xl sm:text-3xl font-bold leading-snug text-gray-500">
                To connect every NDIS participant in the Hunter Region with the right provider, based on real reviews, verified quality, and genuine compatibility Ã¢â‚¬â€ not who pays the most to advertise.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">What we stand for</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-surface border border-gray-200 p-8">
                <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-20 bg-surface/50">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">Our Story</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">How we got here</h2>
          </motion.div>
          <div className="space-y-8">
            {timeline.map((t, i) => (
              <motion.div key={t.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-6">
                <div className="shrink-0 w-16 text-right">
                  <span className="text-sm font-bold text-blue-400">{t.year}</span>
                </div>
                <div className="border-l border-gray-200 pl-6 pb-2">
                  <h3 className="text-lg font-bold mb-1">{t.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Team</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">The people behind ReferAus</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {team.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-surface border border-gray-200 p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-gray-200 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-400">{t.name[0]}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{t.name}</h3>
                <p className="text-sm text-orange-400 font-medium mb-2">{t.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-surface/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-4">
            Ready to <span className="gradient-text">get started?</span>
          </h2>
          <p className="text-gray-500 mb-8">Whether you are a participant looking for support or a provider wanting to grow, ReferAus is here for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/providers" className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25">
              Browse Providers
            </Link>
            <Link href="/register" className="px-8 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-50 text-gray-900 font-medium border border-gray-200 transition-all">
              List Your Service
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
