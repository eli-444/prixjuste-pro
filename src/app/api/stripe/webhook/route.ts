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
    const product = session.metadata?.product;
    const supabase = createSupabaseAdminClient();

    if (product === 'quote_deposit') {
      const quoteId = session.metadata?.quote_id;
      const userId = session.metadata?.user_id;

      if (quoteId && userId && supabase) {
        const amountTotal = typeof session.amount_total === 'number' ? session.amount_total / 100 : 0;
        const { error: paymentError } = await supabase.from('quote_payments').upsert(
          {
            quote_id: quoteId,
            user_id: userId,
            stripe_session_id: session.id,
            amount_total: amountTotal,
            currency: session.currency ?? 'eur',
            status: session.payment_status === 'paid' ? 'paid' : 'pending',
            metadata: session.metadata ?? {},
          },
          { onConflict: 'stripe_session_id' },
        );

        if (paymentError) {
          console.error('Stripe webhook quote payment upsert failed', paymentError);
          return NextResponse.json({ error: paymentError.message }, { status: 500 });
        }

        const { error: quoteError } = await supabase
          .from('quotes')
          .update({
            deposit_status: session.payment_status === 'paid' ? 'paid' : 'pending',
            stripe_deposit_session_id: session.id,
          })
          .eq('id', quoteId)
          .eq('user_id', userId);

        if (quoteError) {
          console.error('Stripe webhook quote update failed', quoteError);
          return NextResponse.json({ error: quoteError.message }, { status: 500 });
        }
      }

      return NextResponse.json({ received: true });
    }

    const userId = session.client_reference_id ?? session.metadata?.user_id;

    if (userId && supabase) {
      const { data: purchase, error: purchaseError } = await supabase
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

      if (purchaseError) {
        console.error('Stripe webhook purchase upsert failed', purchaseError);
        return NextResponse.json({ error: purchaseError.message }, { status: 500 });
      }

      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (stripeCustomerId) {
        const { error: customerError } = await supabase.from('stripe_customers').upsert(
          {
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
          },
          { onConflict: 'user_id' },
        );

        if (customerError) {
          console.error('Stripe webhook customer upsert failed', customerError);
        }
      }

      const { error: entitlementError } = await supabase.from('premium_entitlements').upsert(
        {
          user_id: userId,
          purchase_id: purchase?.id,
          status: 'active',
          source: 'stripe',
        },
        { onConflict: 'user_id,source' },
      );

      if (entitlementError) {
        console.error('Stripe webhook entitlement upsert failed', entitlementError);
        return NextResponse.json({ error: entitlementError.message }, { status: 500 });
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const stripeCustomerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    const supabase = createSupabaseAdminClient();

    if (stripeCustomerId && supabase) {
      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .maybeSingle();

      if (customer?.user_id) {
        const { error } = await supabase
          .from('premium_entitlements')
          .update({ status: 'revoked' })
          .eq('user_id', customer.user_id)
          .eq('source', 'stripe');

        if (error) {
          console.error('Stripe webhook entitlement revoke failed', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
