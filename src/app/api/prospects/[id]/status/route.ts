import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type ProspectDecision = 'accepted' | 'refused';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as { status?: ProspectDecision };
  const decision = payload.status;

  if (decision !== 'accepted' && decision !== 'refused') {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!supabase || !user) {
    return NextResponse.json({ error: 'Utilisateur non connecté.' }, { status: 401 });
  }

  const { data: calculation, error: selectError } = await supabase
    .from('pricing_calculations')
    .select('id, opportunity_status')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (!calculation) {
    return NextResponse.json({ error: 'Démarche introuvable.' }, { status: 404 });
  }

  if (calculation.opportunity_status === 'won' || calculation.opportunity_status === 'lost') {
    return NextResponse.json({ error: 'Ce statut est déjà verrouillé.' }, { status: 409 });
  }

  const decidedAt = new Date().toISOString();
  const nextStatus = decision === 'accepted' ? 'won' : 'lost';
  const updatePayload =
    decision === 'accepted'
      ? {
          opportunity_status: nextStatus,
          quote_validated: true,
          quote_validated_at: decidedAt,
        }
      : {
          opportunity_status: nextStatus,
          quote_validated: false,
          quote_validated_at: null,
        };

  const { error: updateError } = await supabase
    .from('pricing_calculations')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ status: nextStatus });
}
