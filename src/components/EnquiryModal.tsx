"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitEnquiry } from "@/lib/supabase";

interface Props {
  providerName: string;
  providerSlug: string;
  open: boolean;
  onClose: () => void;
}

export function EnquiryModal({ providerName, providerSlug, open, onClose }: Props) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "Personal Care", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await submitEnquiry({
      provider_slug: providerSlug,
      provider_name: providerName,
      ...form,
    });
    setSending(false);
    setSent(true);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-[#0F1729] border border-white/[0.08] p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Enquiry sent!</h3>
              <p className="text-sm text-white/45">{providerName} will receive your message and respond shortly.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">Send Enquiry</h2>
              <p className="text-sm text-white/45 mb-6">to {providerName}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-white/50 mb-1.5 block">Your Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50 mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40" />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Service Needed</label>
                  <select value={form.service} onChange={e => setForm({...form, service: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm focus:outline-none focus:border-blue-500/40 appearance-none">
                    {["Personal Care","Community Access","Allied Health","Plan Management","Support Coordination","Early Intervention","Mental Health","Other"].map(s => (
                      <option key={s} className="bg-[#0F1729]">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Message *</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Tell the provider about your needs..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/40 resize-none" />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
                  {sending ? "Sending..." : "Send Enquiry"}
                </button>
                <p className="text-xs text-white/20 text-center">Your details will only be shared with this provider.</p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}