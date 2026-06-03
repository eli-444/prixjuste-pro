import { redirect } from 'next/navigation';
import { OpportunityPrintActions } from '@/components/OpportunityPrintActions';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analyzeProposedPrice, getClientPrice, type PricingInput } from '@/lib/pricing';
import { formatCurrency, formatPercent } from '@/lib/utils';
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
    priceIncludingTax?: number;
    netProfit?: number;
    marginRate?: number;
    riskLevel?: string;
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
};

export default async function OpportunityPrintableQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      .select('account_type, first_name, last_name, full_name, email, company_name, siret, company_address, company_email')
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

  return (
    <div className="h-full overflow-auto bg-slate-100 p-4 md:p-6 print:block print:h-auto print:overflow-visible print:bg-white print:p-0">
      <style>{`
        @media print {
          header, aside, nav, .print\\:hidden { display: none !important; }
          main, section { overflow: visible !important; height: auto !important; }
          body { background: #ffffff !important; }
          .print-page { box-shadow: none !important; border: 0 !important; border-radius: 0 !important; max-width: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
          <h1 className="text-2xl font-bold tracking-tight">Devis</h1>
          <OpportunityPrintActions />
        </div>

        <article className="print-page rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">Tarifly</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{row.title || 'Devis'}</h2>
              {row.client_name ? <p className="mt-2 text-lg font-semibold text-slate-700">{row.client_name}</p> : null}
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-slate-500">Date</p>
              <p className="mt-1 font-bold text-slate-950">{formatDate(row.created_at)}</p>
              <p className="mt-4 text-sm text-slate-500">Statut</p>
              <p className="mt-1 font-bold text-slate-950">{statusLabels[row.opportunity_status ?? 'to_price']}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <PartyCard
              title={accountType === 'business' ? 'Emetteur' : 'Titulaire'}
              lines={[
                accountType === 'business' ? account.company_name : holderName,
                accountType === 'business' && account.siret ? `SIRET ${account.siret}` : '',
                accountType === 'business' ? account.company_address : '',
                account.company_email || account.email || user.email || '',
                accountType === 'business' ? `Titulaire : ${holderName}` : '',
              ]}
            />
            <PartyCard title="Client" lines={[row.client_name || 'Client non renseigne']} />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_160px] bg-slate-950 px-5 py-4 text-sm font-bold text-white">
              <span>Poste</span>
              <span className="text-right">Valeur</span>
            </div>
            <SummaryRow label="Mode de facturation" value={getBillingModeLabel(input.billingMode)} />
            <SummaryRow label="Temps / quantite" value={getQuantityLabel(input)} />
            <SummaryRow label="Couts directs" value={formatCurrency(Number(result.baseCost ?? input.productCost + input.fixedFees))} />
            <SummaryRow label="Prix hors taxes" value={formatCurrency(Number(result.priceExcludingTax ?? analysis.priceExcludingTax))} />
            <SummaryRow label="TVA" value={formatCurrency(Number(result.taxAmount ?? analysis.taxAmount))} />
            <SummaryRow label="Profit net estime" value={formatCurrency(Number(result.netProfit ?? analysis.netProfit))} />
            <SummaryRow label="Marge reelle" value={formatPercent(Number(result.marginRate ?? analysis.marginRate))} />
          </div>

          <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-100">Prix final propose</p>
            <p className="mt-3 text-5xl font-bold tracking-tight">{formatCurrency(finalPrice)}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function PartyCard({ title, lines }: { title: string; lines: Array<string | null | undefined | false> }) {
  const visibleLines = lines.filter((line): line is string => Boolean(line));

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
        {visibleLines.map((line, index) => (
          <p key={`${line}-${index}`} className={index === 0 ? 'text-lg font-bold text-slate-950' : 'whitespace-pre-line'}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_160px] border-t border-slate-200 px-5 py-4 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="text-right font-bold text-slate-950">{value}</span>
    </div>
  );
}

function getHolderName(profile: ProfileRow, fallback?: string | null) {
  const nameParts = (profile.full_name ?? '').split(' ').filter(Boolean);
  return `${profile.first_name ?? nameParts[0] ?? ''} ${profile.last_name ?? nameParts.slice(1).join(' ') ?? ''}`.trim() || fallback || '';
}

function getBillingModeLabel(mode: PricingInput['billingMode']) {
  if (mode === 'hourly') return "A l'heure";
  if (mode === 'daily') return 'Journee';
  return 'Prestation Global';
}

function getQuantityLabel(input: PricingInput) {
  if (input.billingMode === 'fixed') return 'Prestation Global';
  if (input.billingMode === 'daily') return `${input.workHours || 0} jour(s)`;
  return `${input.workHours || 0} heure(s)`;
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value)) : 'Date indisponible';
}
