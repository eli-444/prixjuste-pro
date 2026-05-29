import { NextResponse } from 'next/server';
import { createStripeClient } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const stripe = createStripeClient();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: 'Stripe est mal configure. Verifiez STRIPE_SECRET_KEY et NEXT_PUBLIC_STRIPE_PRICE_ID.' },
      { status: 500 },
    );
  }

  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous avant de debloquer le premium.' }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel`,
    allow_promotion_codes: true,
    metadata: {
      user_id: user.id,
      product: 'tarifly_premium',
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe n'a pas retourne d'URL de paiement." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
