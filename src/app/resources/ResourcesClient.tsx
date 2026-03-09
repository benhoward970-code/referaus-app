"use client";
import Link from "next/link";

const externalLinks = [
  { label: "NDIS Price Guide", url: "https://www.ndis.gov.au/providers/pricing-arrangements", desc: "Current NDIS pricing arrangements and price limits." },
  { label: "NDIS Provider Registration", url: "https://www.ndis.gov.au/providers/working-provider/apply-become-registered-provider", desc: "How to apply to become a registered NDIS provider." },
  { label: "NDIS Complaints", url: "https://www.ndiscommission.gov.au/about/complaints", desc: "Lodge a complaint about an NDIS provider or support." },
  { label: "NDIS Quality & Safeguards Commission", url: "https://www.ndiscommission.gov.au", desc: "The independent body regulating NDIS providers." },
  { label: "My NDIS Portal", url: "https://my.ndis.gov.au", desc: "Manage your NDIS plan online." },
];

const glossary = [
  { term: "SIL", meaning: "Supported Independent Living — funded support in a home you share with others." },
  { term: "SDA", meaning: "Specialist Disability Accommodation — funding for housing with specialised design features." },
  { term: "STA", meaning: "Short Term Accommodation — respite and short-term stays away from home." },
  { term: "Core", meaning: "Core Supports — everyday activities including assistance with daily life, transport, and social participation." },
  { term: "Capacity Building", meaning: "Supports that build your skills and independence over time." },
  { term: "LAC", meaning: "Local Area Coordinator — a person who helps you implement your NDIS plan." },
  { term: "ECEI", meaning: "Early Childhood Early Intervention — support for children under 7 with developmental delay." },
  { term: "Plan Manager", meaning: "A registered provider who manages the financial side of your NDIS plan." },
];

export default function ResourcesClient() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="section-label mb-2">Resources</p>
          <h1 className="text-4xl font-black tracking-tight mb-3">NDIS Resources Hub</h1>
          <p className="text-gray-500 text-lg">Free resources for NDIS participants and providers across Australia.</p>
        </div>

        {/* External links */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Official NDIS Links</h2>
          <div className="grid gap-3">
            {externalLinks.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all group">
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{link.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
                </div>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors mt-0.5 flex-shrink-0 ml-4">↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* Glossary */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">NDIS Glossary</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {glossary.map((item) => (
              <div key={item.term} className="p-4 rounded-xl border border-gray-200 bg-white">
                <p className="font-bold text-blue-600 mb-1">{item.term}</p>
                <p className="text-sm text-gray-600">{item.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
          <p className="font-semibold text-gray-900 mb-2">Looking for a provider?</p>
          <p className="text-sm text-gray-600 mb-4">Search our directory of verified NDIS providers in Newcastle and the Hunter Region.</p>
          <Link href="/providers" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-sm">
            Browse Providers
          </Link>
        </div>
      </div>
    </div>
  );
}
