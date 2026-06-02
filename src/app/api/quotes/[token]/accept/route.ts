import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

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
    .select('id, user_id, calculation_id, status')
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

  const acceptedAt = new Date().toISOString();
  const { error } = await supabase
    .from('quotes')
    .update({
      status: 'accepted',
      accepted_at: acceptedAt,
      client_acceptance: {
        name: payload.name ?? '',
        email: payload.email ?? '',
        message: payload.message ?? '',
        accepted_at: acceptedAt,
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

  return NextResponse.json({ accepted: true });
}
