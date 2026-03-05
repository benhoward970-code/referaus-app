"use client";
import { subscribeNewsletter } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";

const posts = [
  {
    slug: "understanding-your-ndis-plan",
    title: "Understanding Your NDIS Plan: A Complete Guide",
    excerpt: "Everything you need to know about your NDIS plan, from funding categories to how to make the most of your budget.",
    category: "Guides",
    date: "28 Feb 2026",
    readTime: "8 min read",
    featured: true,
  },
  {
    slug: "choosing-the-right-provider",
    title: "How to Choose the Right NDIS Provider",
    excerpt: "Five key things to look for when selecting an NDIS service provider, and red flags to watch out for.",
    category: "Tips",
    date: "25 Feb 2026",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "ndis-plan-management-explained",
    title: "Plan Management vs Self-Management: What is Right for You?",
    excerpt: "A comparison of NDIS plan management options to help you decide which approach gives you the most flexibility and control.",
    category: "Guides",
    date: "20 Feb 2026",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "support-coordination-101",
    title: "Support Coordination 101: Do You Need It?",
    excerpt: "What support coordinators actually do, when you might need one, and how to find a great one in the Hunter Region.",
    category: "Guides",
    date: "15 Feb 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "ndis-price-guide-2026",
    title: "NDIS Price Guide 2026: What Has Changed",
    excerpt: "A breakdown of the key changes in the latest NDIS Price Guide and what they mean for participants and providers.",
    category: "News",
    date: "10 Feb 2026",
    readTime: "4 min read",
    featured: false,
  },
  {
    slug: "early-intervention-hunter",
    title: "Early Intervention Services in the Hunter Region",
    excerpt: "A guide to finding quality early childhood intervention services for children aged 0 to 6 in Newcastle and surrounds.",
    category: "Local",
    date: "5 Feb 2026",
    readTime: "6 min read",
    featured: false,
  },
];

export default function BlogPage() {
  const featured = posts.filter(p => p.featured);
  const rest = posts.filter(p => !p.featured);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Resources</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Guides & <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl">Practical guides to help you navigate the NDIS with confidence.</p>
        </motion.div>

        {/* Featured posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {featured.map((post, i) => (
            <motion.div key={post.slug} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="group rounded-2xl bg-surface border border-gray-200 p-8 h-full transition-all duration-300 hover:border-blue-500/20 card-glow cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{post.category}</span>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{post.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other posts */}
        <div className="space-y-4">
          {rest.map((post, i) => (
            <motion.div key={post.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <div className="group rounded-2xl bg-surface border border-gray-200 p-6 transition-all duration-300 hover:border-blue-500/20 card-glow cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{post.category}</span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-base font-bold group-hover:text-blue-400 transition-colors">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 hidden sm:block">{post.excerpt}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{post.readTime}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
          <div className="rounded-2xl bg-blue-600/[0.06] border border-blue-500/20 p-10 text-center">
            <h3 className="text-2xl font-bold mb-2">Stay in the loop</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Get NDIS tips, provider updates, and platform news delivered to your inbox. No spam, unsubscribe anytime.</p>
            <form onSubmit={async (e) => { e.preventDefault(); const email = new FormData(e.currentTarget).get("email") as string; await subscribeNewsletter(email); (e.target as HTMLFormElement).reset(); alert("Subscribed!"); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" name="email" required placeholder="your@email.com" className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
              <button type="submit" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-gray-900 font-semibold text-sm transition-all shrink-0">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
