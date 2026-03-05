"use client";
import { useState } from "react";
import Link from "next/link";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", type: "participant" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", phone: "", message: "", type: "participant" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-[600px] mx-auto">
        <p className="section-label mb-3">Get in Touch</p>
        <h1 className="serif-i text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Contact us</h1>
        <p className="text-gray-500 mb-8 font-light">Have a question about Refer? Want to list your practice? We would love to hear from you.</p>

        {status === "sent" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold text-lg mb-2">Message sent!</h3>
            <p className="text-gray-600 text-sm">We will get back to you within 24 hours.</p>
            <Link href="/" className="inline-block mt-4 text-blue-600 text-sm font-semibold hover:text-blue-700">Back to home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">I am a...</label>
              <div className="flex gap-3">
                {["participant", "provider", "other"].map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${form.type === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors" placeholder="Your name" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors" placeholder="you@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors" placeholder="04XX XXX XXX" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Message *</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors resize-none" placeholder="How can we help?" />
            </div>

            <button type="submit" disabled={status === "sending"}
              className="w-full py-3.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all disabled:opacity-50">
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            {status === "error" && <p className="text-red-500 text-sm text-center">Something went wrong. Please try again or email hello@referaus.com directly.</p>}
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400 mb-2">Or email us directly at</p>
          <a href="mailto:hello@referaus.com" className="text-blue-600 font-semibold hover:text-blue-700">hello@referaus.com</a>
        </div>
      </div>
    </section>
  );
}