import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type PremiumGateOptions = {
  loginRedirect: string;
  paywallRedirect?: string;
};

export async function requireActivePremium({
  loginRedirect,
  paywallRedirect = '/dashboard/facturation?paywall=1',
}: PremiumGateOptions) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect(`/connexion?redirect=${encodeURIComponent(loginRedirect)}`);
  }

  const { data: entitlement } = await supabase
    .from('premium_entitlements')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!entitlement) {
    redirect(paywallRedirect);
  }

  return { supabase, user, entitlement };
}
