import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isFinalQuoteStatus, isQuoteExpired } from '@/lib/quotes';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    message?: string;
  };
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: 'Configuration Supabase invalide.' }, { status: 500 });
  }

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, user_id, calculation_id, quote_number, status, validity_days, generated_at, created_at')
    .eq('public_token', token)
    .maybeSingle();

  if (quoteError) {
    return NextResponse.json({ error: quoteError.message }, { status: 500 });
  }

  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable.' }, { status: 404 });
  }

  if (quote.status === 'accepted') {
    return NextResponse.json({ error: 'Ce devis a déjà été accepté.' }, { status: 409 });
  }

  if (quote.status === 'refused') {
    return NextResponse.json({ refused: true });
  }

  if (quote.status === 'expired' || isQuoteExpired(quote.generated_at ?? quote.created_at, quote.validity_days)) {
    if (!isFinalQuoteStatus(quote.status)) {
      await supabase.from('quotes').update({ status: 'expired' }).eq('id', quote.id);
    }

    return NextResponse.json({ error: 'Ce devis a expiré.' }, { status: 410 });
  }

  const refusedAt = new Date().toISOString();
  const { error } = await supabase
    .from('quotes')
    .update({
      status: 'refused',
      client_acceptance: {
        name: payload.name ?? '',
        email: payload.email ?? '',
        message: payload.message ?? '',
        refused_at: refusedAt,
        user_agent: request.headers.get('user-agent') ?? '',
      },
    })
    .eq('id', quote.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (quote.calculation_id) {
    await supabase
      .from('pricing_calculations')
      .update({
        opportunity_status: 'lost',
        quote_validated: false,
        quote_validated_at: null,
      })
      .eq('id', quote.calculation_id)
      .eq('user_id', quote.user_id);
  }

  await supabase.from('app_notifications').insert({
    user_id: quote.user_id,
    quote_id: quote.id,
    calculation_id: quote.calculation_id,
    type: 'quote_refused',
    title: 'Devis refusé',
    message: `Le devis ${quote.quote_number} a été refusé par le client.`,
  });

  return NextResponse.json({ refused: true });
}
