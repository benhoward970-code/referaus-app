"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { label: "Total Enquiries", value: "24", change: "+12%", up: true },
  { label: "Profile Views", value: "342", change: "+8%", up: true },
  { label: "Bookings", value: "7", change: "+3", up: true },
  { label: "Avg. Rating", value: "4.8", change: "0.0", up: true },
];

const recentEnquiries = [
  { name: "Sarah Mitchell", service: "Personal Care", date: "2 hours ago", status: "New" },
  { name: "David Chen", service: "Community Access", date: "5 hours ago", status: "Replied" },
  { name: "Amanda Torres", service: "Transport", date: "1 day ago", status: "Booked" },
  { name: "James Wright", service: "Meal Preparation", date: "2 days ago", status: "New" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-1">Dashboard</h1>
          <p className="text-white/45 text-sm">Welcome back, Sunshine Support Services</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-surface border border-white/[0.06] p-6">
              <p className="text-xs text-white/40 mb-2">{s.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{s.value}</span>
                <span className={`text-xs font-medium mb-1 ${s.up ? "text-green-400" : "text-red-400"}`}>{s.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enquiries table */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-2xl bg-surface border border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Enquiries</h2>
              <span className="text-xs text-blue-400 cursor-pointer">View all</span>
            </div>
            <div className="space-y-4">
              {recentEnquiries.map((e) => (
                <div key={e.name} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-white/40">{e.service}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      e.status === "New" ? "bg-orange-500/10 text-orange-400" :
                      e.status === "Replied" ? "bg-blue-500/10 text-blue-400" :
                      "bg-green-500/10 text-green-400"
                    }`}>{e.status}</span>
                    <p className="text-xs text-white/30 mt-1">{e.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-surface border border-white/[0.06] p-6">
            <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-medium border border-blue-500/20 transition-all">Edit Profile</button>
              <button className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-sm font-medium border border-white/[0.06] transition-all">Manage Services</button>
              <button className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-sm font-medium border border-white/[0.06] transition-all">View Analytics</button>
              <button className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-sm font-medium border border-white/[0.06] transition-all">Respond to Reviews</button>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/20">
              <p className="text-xs text-orange-400 font-medium mb-1">Upgrade to Professional</p>
              <p className="text-xs text-white/40">Get verified, priority ranking, and direct bookings.</p>
              <Link href="/pricing" className="text-xs text-orange-400 font-semibold mt-2 inline-block hover:text-orange-300">View plans</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
