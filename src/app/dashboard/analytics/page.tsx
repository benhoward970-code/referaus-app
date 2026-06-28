'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface DailyPoint {
  date: string;
  label: string;
  enquiries: number;
  reviews: number;
}

interface TopService {
  name: string;
  count: number;
  pct: number;
}

interface AnalyticsData {
  provider: {
    viewCount: number;
    viewsThisMonth: number;
    enquiriesThisMonth: number;
    reviewCount: number;
    rating: number;
  };
  period: {
    days: number;
    enquiries: number;
    reviews: number;
    conversionRate: string;
  };
  dailyData: DailyPoint[];
  topServices: TopService[];
}

function SkeletonBar() {
  return <div className="flex-1 bg-gray-100 rounded-t-md animate-pulse" style={{ minHeight: '4px', height: '40%' }} />;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async (p: string) => {
    setLoading(true);
    setError('');
    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`/api/analytics?period=${p}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to load analytics');
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  const daily = data?.dailyData ?? [];
  const maxEnq = Math.max(...daily.map(d => d.enquiries), 1);

  // Thin out labels for 30d/90d so they don't crowd
  const labelInterval = period === '90d' ? 14 : period === '30d' ? 7 : 1;

  return (
    <div className="">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">How participants are finding and engaging with your listing</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={'px-3 py-1.5 rounded-md text-xs font-medium transition-all ' + (period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Profile Views',
              value: loading ? '…' : (data?.provider.viewCount ?? 0).toLocaleString(),
              sub: loading ? '' : `${data?.provider.viewsThisMonth ?? 0} this month`,
              color: 'text-blue-600',
            },
            {
              label: 'Enquiries',
              value: loading ? '…' : (data?.period.enquiries ?? 0).toString(),
              sub: loading ? '' : `last ${period}`,
              color: 'text-orange-600',
            },
            {
              label: 'Reviews',
              value: loading ? '…' : (data?.provider.reviewCount ?? 0).toString(),
              sub: loading ? '' : `${data?.period.reviews ?? 0} this period`,
              color: 'text-green-600',
            },
            {
              label: 'Avg Rating',
              value: loading ? '…' : (data?.provider.rating ?? 0) > 0 ? Number(data!.provider.rating).toFixed(1) + ' ★' : '—',
              sub: loading ? '' : data?.period.conversionRate + '% conversion',
              color: 'text-purple-600',
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className={'text-2xl font-black ' + s.color}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              {s.sub && <div className="text-xs text-gray-400 mt-1">{s.sub}</div>}
            </motion.div>
          ))}
        </div>

        {/* Enquiries Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="font-bold mb-1">Enquiries — Last {period}</h2>
          <p className="text-xs text-gray-400 mb-6">Number of enquiries received per day</p>
          {loading ? (
            <div className="flex items-end gap-1.5 h-40">
              {Array.from({ length: period === '7d' ? 7 : period === '30d' ? 30 : 90 }).map((_, i) => (
                <SkeletonBar key={i} />
              ))}
            </div>
          ) : data?.period.enquiries === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium">No enquiries yet</p>
              <p className="text-xs mt-1">Analytics will appear once you receive enquiries</p>
            </div>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {daily.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  {d.enquiries > 0 && (
                    <span className="text-xs text-gray-500 font-medium leading-none">{d.enquiries}</span>
                  )}
                  <div className="w-full flex-1 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: d.enquiries === 0 ? '4px' : `${(d.enquiries / maxEnq) * 100}%` }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                      className={`w-full rounded-t-sm ${d.enquiries === 0 ? 'bg-gray-100' : 'bg-orange-400'}`}
                      style={{ minHeight: '4px' }}
                    />
                  </div>
                  {i % labelInterval === 0 && (
                    <span className="text-xs text-gray-400 truncate w-full text-center leading-none">{d.label}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Services */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Top Services Requested</h2>
            {loading ? (
              <div className="space-y-4">
                {[100, 75, 55, 40, 25].map(w => (
                  <div key={w}>
                    <div className="h-4 bg-gray-100 rounded animate-pulse mb-1" style={{ width: w + '%' }} />
                    <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (data?.topServices ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No enquiries yet — service data will appear once you receive some.</p>
            ) : (
              <div className="space-y-4">
                {(data?.topServices ?? []).map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 truncate">{s.name}</span>
                      <span className="text-gray-400 ml-2 shrink-0">{s.count} enquir{s.count === 1 ? 'y' : 'ies'}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: s.pct + '%' }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Profile Summary</h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Total profile views', value: (data?.provider.viewCount ?? 0).toLocaleString() },
                  { label: 'Views this month', value: (data?.provider.viewsThisMonth ?? 0).toLocaleString() },
                  { label: 'Enquiries this month', value: (data?.provider.enquiriesThisMonth ?? 0).toLocaleString() },
                  { label: 'Average rating', value: (data?.provider.rating ?? 0) > 0 ? Number(data!.provider.rating).toFixed(1) + ' / 5' : 'No reviews yet' },
                  { label: 'Total reviews', value: (data?.provider.reviewCount ?? 0).toString() },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
