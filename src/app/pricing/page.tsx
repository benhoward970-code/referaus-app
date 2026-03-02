"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Free Listing",
    price: "$0",
    period: "forever",
    desc: "Get discovered by NDIS participants in your area.",
    features: ["Basic provider profile", "Appear in search results", "Receive enquiries via email", "Up to 5 service categories"],
    cta: "Create Free Listing",
    href: "/register",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    desc: "Everything you need to grow your provider business.",
    features: ["Verified badge", "Priority search ranking", "Direct booking system", "Analytics dashboard", "Review management", "Unlimited service categories", "Phone & email support"],
    cta: "Start Professional",
    href: "/register?plan=pro",
    highlight: true,
  },
  {
    name: "Premium",
    price: "$149",
    period: "/month",
    desc: "For established providers who want maximum visibility.",
    features: ["Everything in Professional", "Featured homepage placement", "Competitor insights", "Custom branded profile", "API access", "Dedicated account manager", "Multi-location support"],
    cta: "Start Premium",
    href: "/register?plan=premium",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Pricing</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-lg text-white/50 max-w-lg mx-auto">Free for participants. Affordable plans for providers who want to grow.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border transition-all ${
                plan.highlight
                  ? "bg-blue-600/[0.08] border-blue-500/30 shadow-lg shadow-blue-600/10"
                  : "bg-surface border-white/[0.06]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white">Most Popular</span>
                </div>
              )}
              <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-sm text-white/40">{plan.period}</span>
              </div>
              <p className="text-sm text-white/45 mb-8">{plan.desc}</p>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all mb-8 ${
                  plan.highlight
                    ? "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-600/25"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? "#3B82F6" : "#4B5563"} strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-xs text-white/30 mt-12">
          All plans include GST. Cancel anytime. Free for all NDIS participants.
        </motion.p>
      </div>
    </div>
  );
}
