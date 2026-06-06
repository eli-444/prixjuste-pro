import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isFinalQuoteStatus, isQuoteExpired } from '@/lib/quotes';
import { notifyQuoteOwnerByEmail } from '@/lib/quote-email-notifications';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    message?: string;
    signature?: string;
  };
  const signature = payload.signature?.trim();

  if (!signature) {
    return NextResponse.json({ error: 'Signature électronique obligatoire.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: 'Configuration Supabase invalide.' }, { status: 500 });
  }

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, user_id, calculation_id, public_token, quote_number, status, client_snapshot, total_including_tax, validity_days, generated_at, created_at')
    .eq('public_token', token)
    .maybeSingle();

  if (quoteError) {
    return NextResponse.json({ error: quoteError.message }, { status: 500 });
  }

  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable.' }, { status: 404 });
  }

  if (quote.status === 'accepted') {
    return NextResponse.json({ accepted: true });
  }

  if (quote.status === 'refused') {
    return NextResponse.json({ error: 'Ce devis a déjà été refusé.' }, { status: 409 });
  }

  if (quote.status === 'expired' || isQuoteExpired(quote.generated_at ?? quote.created_at, quote.validity_days)) {
    if (!isFinalQuoteStatus(quote.status)) {
      await supabase.from('quotes').update({ status: 'expired' }).eq('id', quote.id);
    }

    return NextResponse.json({ error: 'Ce devis a expiré.' }, { status: 410 });
  }

  const acceptedAt = new Date().toISOString();
  const { error } = await supabase
    .from('quotes')
    .update({
      status: 'accepted',
      accepted_at: acceptedAt,
      client_acceptance: {
        name: payload.name ?? '',
        email: payload.email ?? '',
        signature,
        message: payload.message ?? '',
        accepted_at: acceptedAt,
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
        opportunity_status: 'won',
        quote_validated: true,
        quote_validated_at: acceptedAt,
      })
      .eq('id', quote.calculation_id)
      .eq('user_id', quote.user_id);
  }

  await supabase.from('app_notifications').insert({
    user_id: quote.user_id,
    quote_id: quote.id,
    calculation_id: quote.calculation_id,
    type: 'quote_accepted',
    title: 'Devis accepté',
    message: `Le devis ${quote.quote_number} a été signé et accepté par le client.`,
  });

  await notifyQuoteOwnerByEmail(supabase, {
    userId: quote.user_id,
    status: 'accepted',
    quoteNumber: quote.quote_number,
    clientSnapshot: quote.client_snapshot,
    totalIncludingTax: Number(quote.total_including_tax ?? 0),
    publicToken: quote.public_token,
  });

  return NextResponse.json({ accepted: true });
}
