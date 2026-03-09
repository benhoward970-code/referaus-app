'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const weeklyData = [
  { day: 'Mon', views: 12, enquiries: 2, searches: 34 },
  { day: 'Tue', views: 18, enquiries: 3, searches: 41 },
  { day: 'Wed', views: 15, enquiries: 1, searches: 38 },
  { day: 'Thu', views: 22, enquiries: 4, searches: 52 },
  { day: 'Fri', views: 28, enquiries: 5, searches: 61 },
  { day: 'Sat', views: 9, enquiries: 1, searches: 22 },
  { day: 'Sun', views: 7, enquiries: 0, searches: 18 },
];

const topServices = [
  { name: 'Support Coordination', views: 45, pct: 100 },
  { name: 'Daily Living', views: 38, pct: 84 },
  { name: 'Community Access', views: 29, pct: 64 },
  { name: 'Therapy', views: 21, pct: 47 },
  { name: 'Transport', views: 14, pct: 31 },
];

const topSearchTerms = [
  { term: 'support coordination newcastle', count: 18 },
  { term: 'ndis provider maitland', count: 12 },
  { term: 'disability support hunter', count: 9 },
  { term: 'sil provider lake macquarie', count: 7 },
  { term: 'allied health ndis', count: 5 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const maxViews = Math.max(...weeklyData.map(d => d.views));
  const totalViews = weeklyData.reduce((s, d) => s + d.views, 0);
  const totalEnquiries = weeklyData.reduce((s, d) => s + d.enquiries, 0);
  const totalSearches = weeklyData.reduce((s, d) => s + d.searches, 0);
  const conversionRate = totalViews > 0 ? ((totalEnquiries / totalViews) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">How participants are finding and engaging with your listing</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={'px-3 py-1.5 rounded-md text-xs font-medium transition-all ' + (period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>{p}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Profile Views', value: totalViews, change: '+23%', color: 'text-blue-600' },
            { label: 'Enquiries', value: totalEnquiries, change: '+12%', color: 'text-orange-600' },
            { label: 'Search Appearances', value: totalSearches, change: '+31%', color: 'text-green-600' },
            { label: 'Conversion Rate', value: conversionRate + '%', change: '+2.1%', color: 'text-purple-600' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className={'text-2xl font-black ' + s.color}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              <div className="text-xs text-green-600 mt-2">{s.change} vs last period</div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="font-bold mb-6">Profile Views — This Week</h2>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">{d.views}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: (d.views / maxViews) * 100 + '%' }} transition={{ delay: i * 0.05, duration: 0.4 }} className="w-full bg-blue-500 rounded-t-md min-h-[4px]" />
                <span className="text-xs text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Services */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Top Services Viewed</h2>
            <div className="space-y-4">
              {topServices.map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-700">{s.name}</span><span className="text-gray-400">{s.views} views</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: s.pct + '%' }} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Search Terms */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">How Participants Find You</h2>
            <div className="space-y-3">
              {topSearchTerms.map((t, i) => (
                <div key={t.term} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                  <span className="text-sm text-gray-700 flex-1">{t.term}</span>
                  <span className="text-xs text-gray-400">{t.count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">Data shown is demo data. Connect Supabase to see real analytics.</p>
      </motion.div>
    </div>
  );
}
