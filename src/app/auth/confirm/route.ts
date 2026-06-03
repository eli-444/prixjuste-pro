import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const supabase = await createServerSupabaseClient();

  if (!tokenHash || !type || !supabase) {
    return NextResponse.redirect(new URL('/mot-de-passe-oublie?error=missing_token', request.url));
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    const forgotPasswordUrl = new URL('/mot-de-passe-oublie', request.url);
    forgotPasswordUrl.searchParams.set('error', 'expired_or_invalid');
    return NextResponse.redirect(forgotPasswordUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
