import { NextResponse } from 'next/server';
import { createStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const stripe = createStripeClient();
  const supabase = await createServerSupabaseClient();
  const supabaseAdmin = createSupabaseAdminClient();
  const appUrl = new URL(request.url).origin;

  if (!stripe || !supabaseAdmin) {
    return NextResponse.json({ error: 'Configuration abonnement invalide.' }, { status: 500 });
  }

  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous pour gerer votre abonnement.' }, { status: 401 });
  }

  const { data: customer } = await supabaseAdmin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: purchase } = customer?.stripe_customer_id
    ? { data: null }
    : await supabaseAdmin
        .from('purchases')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .not('stripe_customer_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

  const stripeCustomerId = customer?.stripe_customer_id ?? purchase?.stripe_customer_id;

  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'Aucun abonnement Stripe retrouve pour ce compte.' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/dashboard/facturation`,
  });

  return NextResponse.json({ url: portalSession.url });
}
