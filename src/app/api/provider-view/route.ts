import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// POST /api/provider-view { slug }
// Rate limited to 1 view per IP per provider per 30 minutes
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { slug } = await req.json();

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  // 1 view per IP per slug per 30 min
  const { allowed } = await checkRateLimit(`view:${ip}:${slug}`, 1, 1800000);
  if (!allowed) {
    return NextResponse.json({ ok: true }); // silently ignore, don't error
  }

  const admin = getAdmin();
  await admin.rpc('increment_provider_view', { slug_param: slug });

  return NextResponse.json({ ok: true });
}
