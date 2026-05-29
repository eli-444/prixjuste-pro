import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      { error: 'Stripe est mal configuré. Vérifiez STRIPE_SECRET_KEY et NEXT_PUBLIC_STRIPE_PRICE_ID.' },
      { status: 500 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe n'a pas retourné d'URL de paiement." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
