"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const SERVICES = [
  "Occupational Therapy", "Speech Pathology", "Physiotherapy", "Psychology",
  "Support Coordination", "Plan Management", "Behaviour Support", "Daily Living Support",
  "Community Access", "Supported Independent Living", "Transport", "Respite Care",
  "Early Childhood", "Home Modifications", "Assistive Technology",
];

export default function RequestsPage() {
  const [form, setForm] = useState({
    participant_name: "", email: "", region: "", postcode: "", budget: "", details: "",
  });
  const [servicesNeeded, setServicesNeeded] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const toggleService = (s: string) => {
    setServicesNeeded((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = async () => {
    setError("");
    if (!form.participant_name.trim() || !form.email.trim() || !form.details.trim()) {
      setError("Please fill in your name, email, and what you need.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, services_needed: servicesNeeded, budget: form.budget ? Number(form.budget) : null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong — please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="pb-24">
        <PageHeader label="Post a Request" title="Your request is live" />
        <div className="max-w-xl mx-auto px-4 sm:px-6 mt-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-flat p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-ink-900 mb-1">We&apos;ve posted your request</h2>
            <p className="text-sm text-ink-500">
              Providers in your area can now see it and respond directly. We&apos;ll email {form.email} when someone replies.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        label="Post a Request"
        title="Let providers come to you"
        subtitle="Describe what you need once — matching NDIS providers in the Hunter Region can respond directly, free of charge."
      />

      <div className="max-w-xl mx-auto px-4 sm:px-6 mt-8">
        <div className="card-flat p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5 block">Your name</label>
              <input
                value={form.participant_name}
                onChange={(e) => setForm((f) => ({ ...f, participant_name: e.target.value }))}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5 block">Services needed</label>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    servicesNeeded.includes(s) ? "bg-orange-500 border-orange-500 text-white" : "border-line-200 text-ink-700 hover:border-orange-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5 block">Suburb / region</label>
              <input
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5 block">Postcode</label>
              <input
                value={form.postcode}
                onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5 block">Budget ($/session)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5 block">What do you need?</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              rows={4}
              placeholder="Tell providers about your situation, goals, and what you're looking for…"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button onClick={submit} disabled={submitting} className="btn-primary w-full justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Posting…" : "Post my request"}
          </button>
        </div>
      </div>
    </div>
  );
}
