import { NextResponse } from 'next/server';
import { createStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const appUrl = new URL(request.url).origin;
  const stripe = createStripeClient();
  const supabase = createSupabaseAdminClient();

  if (!stripe || !supabase) {
    return NextResponse.json({ error: 'Paiement indisponible pour le moment.' }, { status: 500 });
  }

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, user_id, quote_number, company_snapshot, client_snapshot, total_including_tax, deposit_percent, deposit_amount, deposit_status')
    .eq('public_token', token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable.' }, { status: 404 });
  }

  if (quote.deposit_status === 'paid') {
    return NextResponse.json({ error: 'Acompte deja paye.' }, { status: 400 });
  }

  const client = (quote.client_snapshot ?? {}) as { email?: string; name?: string };
  const company = (quote.company_snapshot ?? {}) as { name?: string };
  const depositAmount = Number(quote.deposit_amount || 0) > 0
    ? Number(quote.deposit_amount)
    : Math.round(((Number(quote.total_including_tax || 0) * Number(quote.deposit_percent || 30)) / 100) * 100) / 100;
  const unitAmount = Math.max(50, Math.round(depositAmount * 100));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: client.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: {
            name: `Acompte devis ${quote.quote_number}`,
            description: company.name ? `Acompte a verser a ${company.name}` : 'Acompte devis',
          },
        },
      },
    ],
    success_url: `${appUrl}/devis/${token}?payment=success`,
    cancel_url: `${appUrl}/devis/${token}?payment=cancel`,
    metadata: {
      product: 'quote_deposit',
      quote_id: quote.id,
      quote_public_token: token,
      user_id: quote.user_id,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Impossible d'ouvrir Stripe." }, { status: 500 });
  }

  await supabase
    .from('quotes')
    .update({
      deposit_status: 'pending',
      stripe_deposit_session_id: session.id,
    })
    .eq('id', quote.id);

  await supabase.from('quote_payments').upsert(
    {
      quote_id: quote.id,
      user_id: quote.user_id,
      stripe_session_id: session.id,
      amount_total: unitAmount / 100,
      currency: 'eur',
      status: 'pending',
      metadata: session.metadata ?? {},
    },
    { onConflict: 'stripe_session_id' },
  );

  return NextResponse.json({ url: session.url });
}
