"use client";
import { submitContact } from "@/lib/supabase";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "Is NexaConnect free for NDIS participants?", a: "Yes, always. Participants can browse providers, read reviews, send enquiries and book appointments completely free. We charge providers, not participants." },
  { q: "How do you verify providers?", a: "Premium and Professional providers go through our verification process which includes checking NDIS registration, ABN verification, insurance documentation, and quality indicators." },
  { q: "What area does NexaConnect cover?", a: "We currently focus on Newcastle, Lake Macquarie, Maitland, Cessnock, and the broader Hunter Region in NSW. We plan to expand across NSW in 2026." },
  { q: "Can I leave a review for a provider?", a: "Yes! If you are an NDIS participant who has used a provider listed on NexaConnect, you can leave a verified review. All reviews are moderated to ensure they are genuine." },
  { q: "How do I list my service as a provider?", a: "Click Get Started, choose Provider, and follow the onboarding wizard. A free listing takes about 5 minutes. You can upgrade to Professional or Premium anytime." },
  { q: "How do enquiries work?", a: "When a participant sends an enquiry through NexaConnect, the provider receives an email notification with the participant's message. Providers can respond directly via email or through the dashboard." },
  { q: "Is my data safe?", a: "We take privacy seriously. Your data is encrypted, stored securely in Australia, and never sold to third parties. See our Privacy Policy for full details." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-sm font-medium pr-4">{q}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={`shrink-0 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-white/45 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Contact</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Get in <span className="gradient-text">touch</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl">Have a question, feedback, or need support? We would love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          {/* Contact form */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message sent!</h3>
                  <p className="text-sm text-white/45">We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); await submitContact({ name: form.get("name") as string, email: form.get("email") as string, subject: form.get("subject") as string, message: form.get("message") as string }); setSent(true); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-white/50 mb-1.5 block">Name</label>
                      <input type="text" name="name" required placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/50 mb-1.5 block">Email</label>
                      <input type="email" name="email" required placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50 mb-1.5 block">Subject</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm focus:outline-none focus:border-blue-500/40 appearance-none">
                      <option className="bg-[#111827]">General Enquiry</option>
                      <option className="bg-[#111827]">Provider Support</option>
                      <option className="bg-[#111827]">Participant Help</option>
                      <option className="bg-[#111827]">Report an Issue</option>
                      <option className="bg-[#111827]">Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50 mb-1.5 block">Message</label>
                    <textarea name="message" required rows={5} placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40 resize-none" />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact info */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
              <h3 className="text-lg font-bold mb-6">Other ways to reach us</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <p className="text-sm text-white/45">hello@nexaconnect.com.au</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Location</p>
                    <p className="text-sm text-white/45">Newcastle, NSW, Australia</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Response Time</p>
                    <p className="text-sm text-white/45">Within 24 hours, usually much faster</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-600/[0.06] border border-blue-500/20 p-8">
              <h3 className="text-lg font-bold mb-2">Are you a provider?</h3>
              <p className="text-sm text-white/45 mb-4">Need help with your listing, analytics, or account? Our provider support team is here to help.</p>
              <a href="mailto:providers@nexaconnect.com.au" className="text-sm text-blue-400 font-medium hover:text-blue-300">providers@nexaconnect.com.au</a>
            </div>
          </motion.div>
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Frequently asked questions</h2>
            </div>
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}