"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const subjects = [
  "General Enquiry",
  "Provider Enquiry",
  "Partnership",
  "Support",
  "Media",
];

const faqs = [
  {
    q: "Is ReferAus free for participants?",
    a: "Yes � 100% free for NDIS participants. Always. You can search, compare, and contact providers without paying a cent. We are funded by providers who choose to list their services.",
  },
  {
    q: "How do I list my business on ReferAus?",
    a: "Head to our Register page and create a provider account. We review every application to ensure quality. Once approved, your profile goes live in our directory. Basic listings are free; premium features are available on paid plans.",
  },
  {
    q: "How are providers verified?",
    a: "We check that every provider holds current NDIS registration (or relevant exemptions), verify their business details, and review their service descriptions before they appear in search results.",
  },
  {
    q: "How do I leave a review for a provider?",
    a: "You need a free participant account to leave reviews. Once logged in, search for the provider and click 'Leave a Review'. We verify reviews are from genuine NDIS participants to keep them trustworthy.",
  },
  {
    q: "I found incorrect information � how do I report it?",
    a: "Use the 'Report an issue' link on any provider profile, or contact us directly via this form with the subject 'Support'. We take accuracy seriously and will investigate within 48 hours.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left gap-4 hover:text-blue-600 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm sm:text-base">{q}</span>
        <span className={`text-xl text-gray-400 transition-transform duration-300 shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: subjects[0], message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: form.subject.toLowerCase().replace(" ", "_") }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: subjects[0], message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">

      {/* Hero */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <span className="section-label mb-4 block">Contact Us</span>
            <h1 className="heading-bold text-[clamp(2.2rem,5vw,3.8rem)] leading-tight mb-4">
              Get in <span className="gradient-text">touch</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              Have a question, partnership idea, or need support? We would love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content: form + office info */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }}
            className="lg:col-span-3">
            {status === "sent" ? (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-10 text-center">
                <div className="text-4xl mb-4">?</div>
                <h3 className="font-bold text-xl mb-2">Message sent!</h3>
                <p className="text-gray-600 text-sm mb-6">We will get back to you within 24 hours.</p>
                <button onClick={() => setStatus("idle")} className="text-blue-600 text-sm font-semibold hover:text-blue-700">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-200 p-8 sm:p-10 shadow-sm space-y-5">
                <h2 className="text-xl font-bold mb-1">Send us a message</h2>
                <p className="text-sm text-gray-400 mb-2">We typically respond within one business day.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors"
                      placeholder="you@email.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors bg-white">
                    {subjects.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Message *</label>
                  <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors resize-none"
                    placeholder="How can we help?" />
                </div>

                <button type="submit" disabled={status === "sending"}
                  className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/25">
                  {status === "sending" ? "Sending�" : "Send Message ?"}
                </button>

                {status === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    Something went wrong. Try again or email{" "}
                    <a href="mailto:hello@referaus.com" className="underline">hello@referaus.com</a> directly.
                  </p>
                )}
              </form>
            )}
          </motion.div>

          {/* Office info */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.55 }}
            className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
              <h3 className="font-bold text-lg mb-5">Office</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex gap-3">
                  <span className="text-orange-500 mt-0.5">??</span>
                  <div>
                    <p className="font-medium text-gray-800">Hunter Region, NSW</p>
                    <p className="text-gray-400">Australia</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500 mt-0.5">??</span>
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <a href="mailto:hello@referaus.com" className="text-blue-600 hover:text-blue-700 transition-colors">hello@referaus.com</a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500 mt-0.5">??</span>
                  <div>
                    <p className="font-medium text-gray-800">Response time</p>
                    <p className="text-gray-400">Within 1 business day</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-8">
              <h3 className="font-bold text-lg mb-3">Are you a provider?</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Want to list your NDIS services and connect with more participants? Create a free provider account today.
              </p>
              <Link href="/register"
                className="inline-block px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all">
                List Your Business ?
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="section-label mb-4 block">FAQ</span>
            <h2 className="heading-bold text-3xl sm:text-4xl">Common questions</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
