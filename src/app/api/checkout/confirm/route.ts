import { NextResponse } from 'next/server';
import { createStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const stripe = createStripeClient();
  const supabase = await createServerSupabaseClient();
  const supabaseAdmin = createSupabaseAdminClient();
  const { sessionId } = (await request.json().catch(() => ({}))) as { sessionId?: string };

  if (!stripe || !supabaseAdmin) {
    return NextResponse.json({ error: 'Configuration paiement invalide.' }, { status: 500 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Session paiement manquante.' }, { status: 400 });
  }

  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous pour confirmer le paiement.' }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const sessionUserId = session.client_reference_id ?? session.metadata?.user_id;

  if (sessionUserId !== user.id || session.payment_status !== 'paid') {
    return NextResponse.json(
      {
        error: 'Paiement non valide.',
        paymentStatus: session.payment_status,
        hasMatchingUser: sessionUserId === user.id,
      },
      { status: 400 },
    );
  }

  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from('purchases')
    .upsert(
      {
        user_id: user.id,
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
    console.error('Premium purchase upsert failed', purchaseError);
    return NextResponse.json({ error: purchaseError.message }, { status: 500 });
  }

  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (stripeCustomerId) {
    const { error: customerError } = await supabaseAdmin.from('stripe_customers').upsert(
      {
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
      },
      { onConflict: 'user_id' },
    );

    if (customerError) {
      console.error('Stripe customer upsert failed', customerError);
    }
  }

  const { error: entitlementError } = await supabaseAdmin.from('premium_entitlements').upsert(
    {
      user_id: user.id,
      purchase_id: purchase?.id,
      status: 'active',
      source: 'stripe',
    },
    { onConflict: 'user_id,source' },
  );

  if (entitlementError) {
    console.error('Premium entitlement upsert failed', entitlementError);
    return NextResponse.json({ error: entitlementError.message }, { status: 500 });
  }

  return NextResponse.json({ premium: true });
}
