import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = createStripeClient();

  if (!signature || !webhookSecret || !stripe) {
    return NextResponse.json({ error: 'Configuration paiement invalide.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signature paiement invalide.' },
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.user_id;
    const supabase = createSupabaseAdminClient();

    if (userId && supabase) {
      const { data: purchase } = await supabase
        .from('purchases')
        .upsert(
          {
            user_id: userId,
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            amount_total: session.amount_total,
            currency: session.currency ?? 'eur',
            status: 'paid',
            metadata: session.metadata ?? {},
          },
          { onConflict: 'stripe_session_id' },
        )
        .select('id')
        .single();

      await supabase.from('premium_entitlements').upsert(
        {
          user_id: userId,
          purchase_id: purchase?.id,
          status: 'active',
          source: 'stripe',
        },
        { onConflict: 'user_id,source' },
      );
    }
  }

  return NextResponse.json({ received: true });
}
