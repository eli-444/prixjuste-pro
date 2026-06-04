import { redirect } from 'next/navigation';
import { EditableOpportunityQuote } from '@/components/EditableOpportunityQuote';
import { statusLabels, type OpportunityStatus } from '@/lib/opportunities';
import type { PricingInput } from '@/lib/pricing';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type CalculationRow = {
  id: string;
  title: string | null;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  input: PricingInput | null;
  result: {
    priceIncludingTax?: number;
    priceExcludingTax?: number;
    taxAmount?: number;
    baseCost?: number;
    netProfit?: number;
  } | null;
  recommended_price: number | null;
  created_at: string;
};

type ProfileRow = {
  account_type: 'personal' | 'business' | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  company_name: string | null;
  siret: string | null;
  company_address: string | null;
  company_email: string | null;
  company_phone: string | null;
};

export default async function DashboardOpportunityQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ setup?: string }>;
}) {
  const { id } = await params;
  const { setup } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect(`/connexion?redirect=/dashboard/opportunites/${id}/devis`);
  }

  const [{ data: calculation }, { data: profile }] = await Promise.all([
    supabase
      .from('pricing_calculations')
      .select('id, title, client_name, opportunity_status, input, result, recommended_price, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('account_type, first_name, last_name, full_name, company_name, siret, company_address, company_email, company_phone')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (!calculation) {
    redirect('/dashboard/opportunites');
  }

  const row = calculation as CalculationRow;
  const profileRow = (profile ?? {}) as ProfileRow;
  const input = row.input ?? buildFallbackInput();
  const finalPrice = Number(row.recommended_price ?? row.result?.priceIncludingTax ?? 0);
  const taxRate = Number(input.taxPercent ?? 0);
  const subtotalExcludingTax = Number(row.result?.priceExcludingTax ?? computePriceExcludingTax(finalPrice, taxRate));
  const taxAmount = Number(row.result?.taxAmount ?? Math.max(0, finalPrice - subtotalExcludingTax));
  const holderName = getHolderName(profileRow, user.email ?? '');
  const accountType = profileRow.account_type === 'business' ? 'business' : 'personal';

  return (
    <EditableOpportunityQuote
      initialOpen={setup === '1'}
      quote={{
        id: row.id,
        title: row.title || 'Calcul sans titre',
        clientName: row.client_name || 'Client non renseigné',
        statusLabel: statusLabels[row.opportunity_status ?? 'to_price'],
        input,
        finalPrice,
        subtotalExcludingTax,
        taxAmount,
        taxRate,
        baseCost: Number(row.result?.baseCost ?? 0),
        netProfit: Number(row.result?.netProfit ?? 0),
        issuerLines: buildIssuerLines(profileRow, holderName, accountType),
        holderName,
        accountType,
        createdAt: row.created_at,
      }}
    />
  );
}

function buildIssuerLines(profile: ProfileRow, holderName: string, accountType: 'personal' | 'business') {
  if (accountType === 'business') {
    return [
      profile.company_name || holderName || 'Entreprise',
      profile.company_address || '',
      profile.company_phone || '',
      profile.company_email || '',
      profile.siret ? `SIRET : ${profile.siret}` : '',
    ].filter(Boolean);
  }

  return [holderName || 'Émetteur', profile.company_email || ''].filter(Boolean);
}

function getHolderName(profile: ProfileRow, fallback: string) {
  const nameParts = (profile.full_name ?? '').split(' ').filter(Boolean);
  return `${profile.first_name ?? nameParts[0] ?? ''} ${profile.last_name ?? nameParts.slice(1).join(' ') ?? ''}`.trim() || profile.company_name || fallback;
}

function computePriceExcludingTax(finalPrice: number, taxPercent: number) {
  const rate = Math.max(0, taxPercent) / 100;
  return rate >= 1 ? finalPrice : finalPrice / (1 + rate);
}

function buildFallbackInput(): PricingInput {
  return {
    activityType: 'service',
    billingMode: 'fixed',
    productCost: 0,
    workHours: 1,
    hourlyRate: 0,
    fixedFees: 0,
    transactionFeesPercent: 0,
    desiredMarginPercent: 0,
    taxPercent: 20,
    proposedPrice: 0,
  };
}
