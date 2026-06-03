import { redirect } from 'next/navigation';
import { EditableOpportunityQuote } from '@/components/EditableOpportunityQuote';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analyzeProposedPrice, getClientPrice, type PricingInput } from '@/lib/pricing';
import { statusLabels, type OpportunityStatus } from '@/lib/opportunities';

type CalculationRow = {
  id: string;
  title: string | null;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  input: PricingInput;
  result: {
    baseCost?: number;
    priceExcludingTax?: number;
    taxAmount?: number;
    netProfit?: number;
  } | null;
  recommended_price: number | null;
  created_at: string;
};

type ProfileRow = {
  account_type: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  siret: string | null;
  company_address: string | null;
  company_email: string | null;
  company_phone?: string | null;
};

export default async function OpportunityPrintableQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ setup?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
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
      .select('account_type, first_name, last_name, full_name, email, company_name, siret, company_address, company_email, company_phone')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (!calculation) {
    redirect('/dashboard/opportunites');
  }

  const row = calculation as CalculationRow;
  const account = (profile ?? {}) as ProfileRow;
  const input = row.input;
  const analysis = analyzeProposedPrice(input);
  const finalPrice = Number(row.recommended_price ?? getClientPrice(input));
  const result = row.result ?? {};
  const accountType = account.account_type === 'business' ? 'business' : 'personal';
  const holderName = getHolderName(account, user.email);
  const issuerLines = (
    accountType === 'business'
      ? [
          account.company_name,
          account.company_address,
          account.company_email || account.email || user.email,
          account.company_phone,
          account.siret ? `SIRET : ${account.siret}` : null,
          holderName ? `Titulaire : ${holderName}` : null,
        ]
      : [holderName, account.email || user.email]
  ).filter((line): line is string => Boolean(line));

  return (
    <EditableOpportunityQuote
      initialOpen={query?.setup === '1'}
      quote={{
        id: row.id,
        title: row.title || 'Prestation',
        clientName: row.client_name || 'Client non renseigne',
        statusLabel: statusLabels[row.opportunity_status ?? 'to_price'],
        input,
        finalPrice,
        subtotalExcludingTax: Number(result.priceExcludingTax ?? analysis.priceExcludingTax),
        taxAmount: Number(result.taxAmount ?? analysis.taxAmount),
        taxRate: Math.max(0, input.taxPercent || 0),
        baseCost: Number(result.baseCost ?? input.productCost + input.fixedFees),
        netProfit: Number(result.netProfit ?? analysis.netProfit),
        issuerLines,
        holderName,
        accountType,
        createdAt: row.created_at,
      }}
    />
  );
}

function getHolderName(profile: ProfileRow, fallback?: string | null) {
  const nameParts = (profile.full_name ?? '').split(' ').filter(Boolean);
  return `${profile.first_name ?? nameParts[0] ?? ''} ${profile.last_name ?? nameParts.slice(1).join(' ') ?? ''}`.trim() || fallback || '';
}
