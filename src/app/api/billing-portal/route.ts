import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession, isStripeConfigured } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const admin = getAdmin();

  const { data: { user }, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Get the provider's Stripe customer ID
  const { data: provider, error: provErr } = await admin
    .from('providers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (provErr || !provider?.stripe_customer_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  try {
    const session = await createPortalSession(provider.stripe_customer_id);
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
