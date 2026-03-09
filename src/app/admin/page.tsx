'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const mockProviders = [
  { id: 1, name: 'Hunter Disability Services', email: 'admin@hunterds.com.au', plan: 'pro', verified: true, status: 'active', signupDate: '2026-02-15', enquiries: 12 },
  { id: 2, name: 'Newcastle Allied Health', email: 'info@newcastleah.com.au', plan: 'premium', verified: true, status: 'active', signupDate: '2026-02-18', enquiries: 24 },
  { id: 3, name: 'Lake Mac Support', email: 'hello@lakemacsupport.com.au', plan: 'starter', verified: false, status: 'pending', signupDate: '2026-03-01', enquiries: 3 },
  { id: 4, name: 'Maitland Care Co', email: 'contact@maitlandcare.com.au', plan: 'free', verified: false, status: 'active', signupDate: '2026-03-05', enquiries: 1 },
  { id: 5, name: 'Cessnock Community Services', email: 'team@cessnockcs.org.au', plan: 'pro', verified: true, status: 'active', signupDate: '2026-02-20', enquiries: 8 },
];

const mockStats = { totalProviders: 47, activeListings: 38, totalEnquiries: 156, monthlyRevenue: 2847, pendingVerifications: 5, newThisWeek: 3 };

const planColors: Record<string, string> = { free: 'bg-gray-100 text-gray-600', starter: 'bg-blue-100 text-blue-700', pro: 'bg-orange-100 text-orange-700', premium: 'bg-purple-100 text-purple-700' };

export default function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'providers' | 'enquiries'>('overview');

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Manage providers, enquiries, and platform settings</p>
          </div>
          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">ADMIN</span>
        </div>

        <div className="flex gap-2 mb-8">
          {(['overview', 'providers', 'enquiries'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Total Providers', value: mockStats.totalProviders, color: 'text-blue-600' },
              { label: 'Active Listings', value: mockStats.activeListings, color: 'text-green-600' },
              { label: 'Total Enquiries', value: mockStats.totalEnquiries, color: 'text-orange-600' },
              { label: 'Monthly Revenue', value: '$' + mockStats.monthlyRevenue, color: 'text-purple-600' },
              { label: 'Pending Verification', value: mockStats.pendingVerifications, color: 'text-amber-600' },
              { label: 'New This Week', value: mockStats.newThisWeek, color: 'text-cyan-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className={'text-2xl font-black ' + s.color}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {(tab === 'overview' || tab === 'providers') && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold">Providers</h2>
              <span className="text-xs text-gray-400">{mockProviders.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Provider</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Enquiries</th>
                  <th className="px-6 py-3 font-medium">Signed Up</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {mockProviders.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.email}</div>
                      </td>
                      <td className="px-6 py-4"><span className={'text-xs font-semibold px-2 py-1 rounded-full ' + (planColors[p.plan] || '')}>{p.plan}</span></td>
                      <td className="px-6 py-4">
                        <span className={'inline-flex items-center gap-1.5 text-xs font-medium ' + (p.status === 'active' ? 'text-green-600' : 'text-amber-600')}>
                          <span className={'w-1.5 h-1.5 rounded-full ' + (p.status === 'active' ? 'bg-green-500' : 'bg-amber-500')} />
                          {p.status}{p.verified && ' (verified)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.enquiries}</td>
                      <td className="px-6 py-4 text-gray-400">{p.signupDate}</td>
                      <td className="px-6 py-4">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mr-3">View</button>
                        {!p.verified && <button className="text-xs text-green-600 hover:text-green-800 font-medium">Verify</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'enquiries' && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-500">Enquiry management coming soon. Connect Supabase to see real data.</p>
            <Link href="/contact" className="text-blue-600 text-sm mt-2 inline-block hover:underline">View contact page</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
