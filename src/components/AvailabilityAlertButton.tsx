"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, Loader2 } from "lucide-react";

export function AvailabilityAlertButton({ providerSlug, providerName }: { providerSlug: string; providerName: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), provider_slug: providerSlug }),
      });
      if (res.ok) setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl font-semibold text-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 bg-white border border-line-200 text-ink-700 hover:border-blue-400 hover:text-blue-600"
        aria-label={`Get notified when ${providerName} has availability`}
      >
        <Bell className="w-4 h-4" />
        Notify Me
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-ink-900">Get notified</h3>
                <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-400 hover:text-ink-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {done ? (
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium py-4">
                  <CheckCircle2 className="w-5 h-5" /> We&apos;ll email you when {providerName} opens up.
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink-500 mb-4">We&apos;ll email you as soon as {providerName} has availability.</p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
                  />
                  <button onClick={submit} disabled={submitting} className="btn-primary w-full justify-center gap-2 text-sm">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                    {submitting ? "Saving…" : "Notify me"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
