import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const allowedEvents = new Set([
  'checkout_started',
  'checkout_redirected',
  'calculation_saved',
  'quote_generated',
  'quote_link_generated',
  'support_opened',
]);

type EventPayload = {
  name?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as EventPayload;
  const eventName = typeof payload.name === 'string' ? payload.name.trim() : '';

  if (!allowedEvents.has(eventName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!supabase || !user) {
    return NextResponse.json({ ok: true });
  }

  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};

  const { error } = await supabase.from('product_events').insert({
    user_id: user.id,
    event_name: eventName,
    metadata,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
