import type { SupabaseClient } from '@supabase/supabase-js';
import { sendQuoteStatusEmail } from '@/lib/resend';

type QuoteEmailNotificationInput = {
  userId: string;
  status: 'accepted' | 'refused';
  quoteNumber: string;
  clientSnapshot?: unknown;
  totalIncludingTax?: number;
  publicToken?: string;
};

export async function notifyQuoteOwnerByEmail(
  supabase: SupabaseClient,
  input: QuoteEmailNotificationInput,
) {
  const recipientEmail = await getQuoteOwnerEmail(supabase, input.userId);

  return sendQuoteStatusEmail({
    to: recipientEmail,
    status: input.status,
    quoteNumber: input.quoteNumber,
    clientName: getClientName(input.clientSnapshot),
    totalIncludingTax: input.totalIncludingTax,
    publicToken: input.publicToken,
  });
}

async function getQuoteOwnerEmail(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, company_email')
    .eq('id', userId)
    .maybeSingle();

  const profileEmail = getStringValue(profile, 'company_email') || getStringValue(profile, 'email');

  if (profileEmail) {
    return profileEmail;
  }

  const { data } = await supabase.auth.admin.getUserById(userId);

  return data.user?.email ?? '';
}

function getClientName(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== 'object') {
    return '';
  }

  return getStringValue(snapshot, 'name');
}

function getStringValue(source: unknown, key: string) {
  if (!source || typeof source !== 'object' || !(key in source)) {
    return '';
  }

  const value = (source as Record<string, unknown>)[key];

  return typeof value === 'string' ? value : '';
}
