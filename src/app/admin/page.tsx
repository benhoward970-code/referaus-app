'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { isAdminEmail, ADMIN_EMAILS } from '@/lib/admin';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Provider {
  id: string;
  user_id: string;
  name: string;
  email: string;
  slug: string;
  plan: string;
  verified: boolean;
  created_at: string;
  phone: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  website: string | null;
  categories: string[] | string | null;
  bio: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  enquiry_count: number;
}

interface Enquiry {
  id: string;
  provider_slug: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Review {
  id: string;
  provider_slug: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Stats {
  totalProviders: number;
  totalEnquiries: number;
  totalReviews: number;
  newThisWeek: number;
  planCounts: Record<string, number>;
}

type Tab = 'overview' | 'providers' | 'enquiries' | 'reviews' | 'settings';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-orange-100 text-orange-700',
  premium: 'bg-purple-100 text-purple-700',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

async function adminFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({ label, value, color, delay }: { label: string; value: string | number; color: string; delay: number }) {
  return (
    <motion.div {...fadeUp(delay)} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
    </motion.div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [tab, setTab] = useState<Tab>('overview');

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // UI state
  const [search, setSearch] = useState('');
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ─── Auth Check ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkAdmin() {
      if (!supabase) {
        setAuthState('unauthorized');
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user || !isAdminEmail(data.user.email)) {
        router.replace('/dashboard');
        return;
      }
      setAuthState('authorized');
    }
    checkAdmin();
  }, [router]);

  // ─── Data Fetching ───────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const res = await adminFetch('/api/admin/stats');
    if (res.ok) setStats(await res.json());
  }, []);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/api/admin/providers');
    if (res.ok) {
      const data = await res.json();
      setProviders(data.providers || []);
    }
    setLoading(false);
  }, []);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/api/admin/enquiries');
    if (res.ok) {
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    }
    setLoading(false);
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/api/admin/reviews');
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authState !== 'authorized') return;
    fetchStats();
    if (tab === 'overview') { fetchProviders(); }
    if (tab === 'providers') { fetchProviders(); }
    if (tab === 'enquiries') { fetchEnquiries(); }
    if (tab === 'reviews') { fetchReviews(); }
  }, [authState, tab, fetchStats, fetchProviders, fetchEnquiries, fetchReviews]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  async function toggleVerified(provider: Provider) {
    setActionLoading(provider.id);
    await adminFetch('/api/admin/providers', {
      method: 'PATCH',
      body: JSON.stringify({ id: provider.id, verified: !provider.verified }),
    });
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, verified: !p.verified } : p))
    );
    setActionLoading(null);
  }

  async function changePlan(provider: Provider, newPlan: string) {
    setActionLoading(provider.id);
    await adminFetch('/api/admin/providers', {
      method: 'PATCH',
      body: JSON.stringify({ id: provider.id, plan: newPlan }),
    });
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, plan: newPlan } : p))
    );
    fetchStats();
    setActionLoading(null);
  }

  async function deleteProvider(provider: Provider) {
    if (!confirm(`Delete "${provider.name}"? This cannot be undone.`)) return;
    setActionLoading(provider.id);
    await adminFetch('/api/admin/providers', {
      method: 'DELETE',
      body: JSON.stringify({ id: provider.id }),
    });
    setProviders((prev) => prev.filter((p) => p.id !== provider.id));
    fetchStats();
    setActionLoading(null);
  }

  async function toggleEnquiryRead(enquiry: Enquiry) {
    setActionLoading(enquiry.id);
    await adminFetch('/api/admin/enquiries', {
      method: 'PATCH',
      body: JSON.stringify({ id: enquiry.id, read: !enquiry.read }),
    });
    setEnquiries((prev) =>
      prev.map((e) => (e.id === enquiry.id ? { ...e, read: !e.read } : e))
    );
    setActionLoading(null);
  }

  async function deleteReview(review: Review) {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setActionLoading(review.id);
    await adminFetch('/api/admin/reviews', {
      method: 'DELETE',
      body: JSON.stringify({ id: review.id }),
    });
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
    fetchStats();
    setActionLoading(null);
  }

  // ─── Filtered providers ──────────────────────────────────────────────────
  const filteredProviders = providers.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (authState === 'unauthorized') return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'providers', label: 'Providers', icon: '🏢' },
    { key: 'enquiries', label: 'Enquiries', icon: '📩' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div {...fadeUp()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              Manage providers, enquiries, reviews &amp; platform settings
            </p>
          </div>
          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
            Admin
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ' +
                (tab === t.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── OVERVIEW TAB ─────────────────────────────────────── */}
          {tab === 'overview' && (
            <motion.div key="overview" {...fadeUp(0.05)}>
              {stats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Total Providers" value={stats.totalProviders} color="text-blue-600" delay={0} />
                    <StatCard label="Total Enquiries" value={stats.totalEnquiries} color="text-orange-600" delay={0.05} />
                    <StatCard label="Total Reviews" value={stats.totalReviews} color="text-green-600" delay={0.1} />
                    <StatCard label="New This Week" value={stats.newThisWeek} color="text-cyan-600" delay={0.15} />
                    <StatCard label="Unread Enquiries" value={enquiries.filter((e) => !e.read).length || '—'} color="text-amber-600" delay={0.2} />
                  </div>

                  {/* Plan breakdown */}
                  <motion.div {...fadeUp(0.15)} className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                    <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Providers by Plan</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(['free', 'starter', 'pro', 'premium'] as const).map((plan) => (
                        <div key={plan} className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${planColors[plan]}`}>
                            {plan}
                          </span>
                          <span className="text-xl font-black text-gray-800">{stats.planCounts[plan] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent providers */}
                  <motion.div {...fadeUp(0.2)}>
                    <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Recent Providers</h2>
                    <ProviderTable
                      providers={providers.slice(0, 5)}
                      actionLoading={actionLoading}
                      expandedProvider={expandedProvider}
                      setExpandedProvider={setExpandedProvider}
                      onToggleVerified={toggleVerified}
                      onChangePlan={changePlan}
                      onDelete={deleteProvider}
                    />
                  </motion.div>
                </>
              ) : (
                <Spinner />
              )}
            </motion.div>
          )}

          {/* ─── PROVIDERS TAB ────────────────────────────────────── */}
          {tab === 'providers' && (
            <motion.div key="providers" {...fadeUp(0.05)}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              {loading && providers.length === 0 ? (
                <Spinner />
              ) : (
                <ProviderTable
                  providers={filteredProviders}
                  actionLoading={actionLoading}
                  expandedProvider={expandedProvider}
                  setExpandedProvider={setExpandedProvider}
                  onToggleVerified={toggleVerified}
                  onChangePlan={changePlan}
                  onDelete={deleteProvider}
                />
              )}
            </motion.div>
          )}

          {/* ─── ENQUIRIES TAB ────────────────────────────────────── */}
          {tab === 'enquiries' && (
            <motion.div key="enquiries" {...fadeUp(0.05)}>
              {loading && enquiries.length === 0 ? (
                <Spinner />
              ) : enquiries.length === 0 ? (
                <EmptyState message="No enquiries yet." />
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold">All Enquiries</h2>
                    <span className="text-xs text-gray-400">{enquiries.length} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-gray-500">
                          <th className="px-6 py-3 font-medium">Date</th>
                          <th className="px-6 py-3 font-medium">From</th>
                          <th className="px-6 py-3 font-medium">To (Provider)</th>
                          <th className="px-6 py-3 font-medium">Service</th>
                          <th className="px-6 py-3 font-medium">Message</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiries.map((e) => (
                          <tr key={e.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!e.read ? 'bg-orange-50/40' : ''}`}>
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(e.created_at)}</td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{e.name || '—'}</div>
                              <div className="text-xs text-gray-400">{e.email || '—'}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{e.provider_slug || '—'}</td>
                            <td className="px-6 py-4 text-gray-600">{e.service || '—'}</td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{e.message || '—'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${e.read ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>
                                {e.read ? 'Read' : 'Unread'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleEnquiryRead(e)}
                                disabled={actionLoading === e.id}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                              >
                                {actionLoading === e.id ? '...' : e.read ? 'Mark Unread' : 'Mark Read'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── REVIEWS TAB ──────────────────────────────────────── */}
          {tab === 'reviews' && (
            <motion.div key="reviews" {...fadeUp(0.05)}>
              {loading && reviews.length === 0 ? (
                <Spinner />
              ) : reviews.length === 0 ? (
                <EmptyState message="No reviews yet." />
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold">All Reviews</h2>
                    <span className="text-xs text-gray-400">{reviews.length} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-gray-500">
                          <th className="px-6 py-3 font-medium">Date</th>
                          <th className="px-6 py-3 font-medium">Reviewer</th>
                          <th className="px-6 py-3 font-medium">Provider</th>
                          <th className="px-6 py-3 font-medium">Rating</th>
                          <th className="px-6 py-3 font-medium">Comment</th>
                          <th className="px-6 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((r) => (
                          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{r.reviewer_name || '—'}</td>
                            <td className="px-6 py-4 text-gray-600">{r.provider_slug || '—'}</td>
                            <td className="px-6 py-4">
                              <span className="text-orange-500 font-bold">
                                {'★'.repeat(r.rating || 0)}
                                <span className="text-gray-300">{'★'.repeat(5 - (r.rating || 0))}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{r.comment || '—'}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => deleteReview(r)}
                                disabled={actionLoading === r.id}
                                className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                              >
                                {actionLoading === r.id ? '...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── SETTINGS TAB ─────────────────────────────────────── */}
          {tab === 'settings' && (
            <motion.div key="settings" {...fadeUp(0.05)}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl">
                <h2 className="font-bold text-lg mb-4">Platform Settings</h2>

                <div className="mb-6">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform Name</label>
                  <div className="mt-1 text-lg font-black text-gray-900">ReferAus</div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin Emails</label>
                  <div className="mt-2 space-y-2">
                    {ADMIN_EMAILS.map((email) => (
                      <div key={email} className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-gray-700">{email}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    To add more admins, edit <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">src/lib/admin.ts</code>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Provider Table Component ────────────────────────────────────────────────

function ProviderTable({
  providers,
  actionLoading,
  expandedProvider,
  setExpandedProvider,
  onToggleVerified,
  onChangePlan,
  onDelete,
}: {
  providers: Provider[];
  actionLoading: string | null;
  expandedProvider: string | null;
  setExpandedProvider: (id: string | null) => void;
  onToggleVerified: (p: Provider) => void;
  onChangePlan: (p: Provider, plan: string) => void;
  onDelete: (p: Provider) => void;
}) {
  if (providers.length === 0) {
    return <EmptyState message="No providers found." />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold">Providers</h2>
        <span className="text-xs text-gray-400">{providers.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Provider</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">Verified</th>
              <th className="px-6 py-3 font-medium">Enquiries</th>
              <th className="px-6 py-3 font-medium">Signed Up</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <>
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setExpandedProvider(expandedProvider === p.id ? null : p.id)}
                      className="text-left"
                    >
                      <div className="font-medium text-gray-900 hover:text-orange-600 transition-colors">{p.name || '—'}</div>
                      <div className="text-xs text-gray-400">{p.email || '—'}</div>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.plan || 'free'}
                      onChange={(e) => onChangePlan(p, e.target.value)}
                      disabled={actionLoading === p.id}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${planColors[p.plan] || planColors.free}`}
                    >
                      {['free', 'starter', 'pro', 'premium'].map((plan) => (
                        <option key={plan} value={plan}>{plan}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleVerified(p)}
                      disabled={actionLoading === p.id}
                      className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                        p.verified ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {actionLoading === p.id ? '...' : p.verified ? '✓ Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.enquiry_count}</td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{p.created_at ? formatDate(p.created_at) : '—'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onDelete(p)}
                      disabled={actionLoading === p.id}
                      className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      {actionLoading === p.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
                {expandedProvider === p.id && (
                  <tr key={`${p.id}-details`} className="bg-gray-50/50">
                    <td colSpan={6} className="px-6 py-4">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs"
                      >
                        <div>
                          <span className="text-gray-400 font-medium">Phone</span>
                          <div className="text-gray-700 mt-0.5">{p.phone || '—'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Location</span>
                          <div className="text-gray-700 mt-0.5">
                            {[p.suburb, p.state, p.postcode].filter(Boolean).join(', ') || '—'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Website</span>
                          <div className="text-gray-700 mt-0.5 truncate">{p.website || '—'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Categories</span>
                          <div className="text-gray-700 mt-0.5">
                            {Array.isArray(p.categories)
                              ? p.categories.join(', ')
                              : p.categories || '—'}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-400 font-medium">Bio</span>
                          <div className="text-gray-700 mt-0.5">{p.bio || '—'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Stripe Customer</span>
                          <div className="text-gray-700 mt-0.5 font-mono text-[10px]">{p.stripe_customer_id || '—'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Stripe Subscription</span>
                          <div className="text-gray-700 mt-0.5 font-mono text-[10px]">{p.stripe_subscription_id || '—'}</div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}
