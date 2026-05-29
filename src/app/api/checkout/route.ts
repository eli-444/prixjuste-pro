import { NextResponse } from 'next/server';
import { createStripeClient } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  const appUrl = new URL(request.url).origin;
  const stripe = createStripeClient();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: 'Le paiement est momentanement indisponible.' },
      { status: 500 },
    );
  }

  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous avant de debloquer le premium.' }, { status: 401 });
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      mode,
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
      subscription_data:
        mode === 'subscription'
          ? {
              metadata: {
                user_id: user.id,
                product: 'tarifly_premium',
              },
            }
          : undefined,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossible d'ouvrir la page de paiement." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout creation failed', error);
    return NextResponse.json(
      { error: 'Impossible de preparer le paiement pour le moment.' },
      { status: 500 },
    );
  }
}
