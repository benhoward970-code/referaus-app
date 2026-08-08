import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const admin = getAdmin();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET /api/analytics?period=7d|30d|90d
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const period = request.nextUrl.searchParams.get('period') || '7d';
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const admin = getAdmin();

  // Get provider for this user
  const { data: provider, error: providerError } = await admin
    .from('providers')
    .select('id, slug, view_count, views_this_month, enquiries_this_month, review_count, rating')
    .eq('user_id', user.id)
    .maybeSingle();

  if (providerError || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  // Enquiries grouped by day for the period
  const { data: enquiriesRaw } = await admin
    .from('enquiries')
    .select('created_at, service')
    .eq('provider_slug', provider.slug)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  // Reviews grouped by day for the period
  const { data: reviewsRaw } = await admin
    .from('reviews')
    .select('created_at, rating, service_type')
    .eq('provider_slug', provider.slug)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  // All-time top services from enquiries
  const { data: allEnquiries } = await admin
    .from('enquiries')
    .select('service')
    .eq('provider_slug', provider.slug);

  // Build day-by-day arrays covering the full period
  const dayMap: Record<string, { enquiries: number; reviews: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    dayMap[key] = { enquiries: 0, reviews: 0 };
  }

  for (const e of enquiriesRaw ?? []) {
    const key = e.created_at.slice(0, 10);
    if (dayMap[key]) dayMap[key].enquiries++;
  }

  for (const r of reviewsRaw ?? []) {
    const key = r.created_at.slice(0, 10);
    if (dayMap[key]) dayMap[key].reviews++;
  }

  const dailyData = Object.entries(dayMap).map(([date, counts]) => ({
    date,
    label: formatDayLabel(date, days),
    ...counts,
  }));

  // Top services (all-time from enquiries)
  const serviceCounts: Record<string, number> = {};
  for (const e of allEnquiries ?? []) {
    if (e.service) {
      serviceCounts[e.service] = (serviceCounts[e.service] || 0) + 1;
    }
  }
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  const maxServiceCount = topServices[0]?.count || 1;

  // Period totals
  const periodEnquiries = (enquiriesRaw ?? []).length;
  const periodReviews = (reviewsRaw ?? []).length;

  return NextResponse.json({
    provider: {
      viewCount: provider.view_count ?? 0,
      viewsThisMonth: provider.views_this_month ?? 0,
      enquiriesThisMonth: provider.enquiries_this_month ?? 0,
      reviewCount: provider.review_count ?? 0,
      rating: provider.rating ?? 0,
    },
    period: {
      days,
      enquiries: periodEnquiries,
      reviews: periodReviews,
      conversionRate: provider.view_count > 0
        ? ((periodEnquiries / Math.max(provider.views_this_month, 1)) * 100).toFixed(1)
        : '0',
    },
    dailyData,
    topServices: topServices.map(s => ({
      ...s,
      pct: Math.round((s.count / maxServiceCount) * 100),
    })),
  });
}

function formatDayLabel(dateStr: string, totalDays: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (totalDays <= 7) {
    return d.toLocaleDateString('en-AU', { weekday: 'short' });
  }
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}
