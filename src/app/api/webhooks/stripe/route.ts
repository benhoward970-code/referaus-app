import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[Stripe] Checkout completed:', session.customer_email, session.metadata);
        // TODO: Update provider plan in Supabase
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('[Stripe] Subscription cancelled:', subscription.id);
        // TODO: Downgrade provider to free in Supabase
        break;
      }
      default:
        console.log('[Stripe] Unhandled event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe] Webhook error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
