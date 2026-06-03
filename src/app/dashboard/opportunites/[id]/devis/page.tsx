import { redirect } from 'next/navigation';
import { FileText, Briefcase, CreditCard, PenLine, UserRound } from 'lucide-react';
import { OpportunityPrintActions } from '@/components/OpportunityPrintActions';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analyzeProposedPrice, getClientPrice, type PricingInput } from '@/lib/pricing';
import { formatCurrency } from '@/lib/utils';
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
  const taxRate = Math.max(0, input.taxPercent || 0);
  const subtotalExcludingTax = Number(result.priceExcludingTax ?? analysis.priceExcludingTax);
  const taxAmount = Number(result.taxAmount ?? analysis.taxAmount);
  const baseCost = Number(result.baseCost ?? input.productCost + input.fixedFees);
  const netProfit = Number(result.netProfit ?? analysis.netProfit);
  const accountType = account.account_type === 'business' ? 'business' : 'personal';
  const holderName = getHolderName(account, user.email);
  const serviceLine = buildServiceLine(row, input, finalPrice);
  const issuerLines =
    accountType === 'business'
      ? [
          account.company_name,
          account.company_address,
          account.company_email || account.email || user.email,
          account.company_phone,
          account.siret ? `SIRET : ${account.siret}` : null,
          holderName ? `Titulaire : ${holderName}` : null,
        ]
      : [holderName, account.email || user.email];

  return (
    <div className="h-full overflow-auto bg-slate-200 p-4 md:p-6 print:block print:h-auto print:overflow-visible print:bg-white print:p-0">
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          header, aside, nav, .print\\:hidden { display: none !important; }
          main, section { overflow: visible !important; height: auto !important; }
          body { background: #ffffff !important; }
          .quote-sheet { width: 100% !important; min-height: auto !important; box-shadow: none !important; border: 0 !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[980px]">
        <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
          <h1 className="text-2xl font-bold tracking-tight">Devis</h1>
          <OpportunityPrintActions />
        </div>

        <article className="quote-sheet relative overflow-hidden rounded-[4px] border border-slate-300 bg-white p-8 shadow-xl md:p-10">
          <div className="absolute bottom-0 left-0 h-3 w-full bg-brand-700" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-b-[80px] border-l-[80px] border-b-brand-900 border-l-transparent" />

          <header className="grid gap-8 border-b border-slate-200 pb-8 md:grid-cols-[1fr_0.9fr]">
            <section>
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-700 text-2xl font-black text-white">
                  T
                </div>
                <div>
                  <p className="text-4xl font-black tracking-tight text-slate-950">{accountType === 'business' ? account.company_name || 'Tarifly' : holderName || 'Tarifly'}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">Devis commercial</p>
                </div>
              </div>

              <InfoLines className="mt-6" lines={issuerLines} />
            </section>

            <section className="md:text-right">
              <h2 className="text-6xl font-black tracking-tight text-slate-950">DEVIS</h2>
              <p className="mt-4 inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white">
                {statusLabels[row.opportunity_status ?? 'to_price']}
              </p>
              <div className="mt-6 grid gap-3 text-sm md:justify-end">
                <HeaderMeta label="N devis" value={`OP-${row.id.slice(0, 8).toUpperCase()}`} />
                <HeaderMeta label="Date" value={formatDate(row.created_at)} />
                <HeaderMeta label="Valable jusqu'au" value={formatValidityDate(row.created_at)} accent />
              </div>
            </section>
          </header>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <DocumentBlock icon={<UserRound size={20} />} title="Client">
              <p className="text-lg font-bold text-slate-950">{row.client_name || 'Client non renseigne'}</p>
            </DocumentBlock>

            <DocumentBlock icon={<Briefcase size={20} />} title="Projet">
              <p className="text-lg font-bold text-slate-950">{row.title || 'Projet sans titre'}</p>
              <p className="mt-1 text-sm text-slate-600">{getBillingModeLabel(input.billingMode)}</p>
            </DocumentBlock>
          </div>

          <div className="mt-8 overflow-hidden rounded-[6px] border border-slate-300">
            <div className="grid grid-cols-[minmax(0,1fr)_90px_150px_150px] bg-brand-700 text-sm font-bold uppercase text-white">
              <div className="px-5 py-4">Designation des prestations</div>
              <div className="border-l border-white/30 px-4 py-4 text-center">Qte</div>
              <div className="border-l border-white/30 px-4 py-4 text-right">Prix unitaire HT</div>
              <div className="border-l border-white/30 px-4 py-4 text-right">Total HT</div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_90px_150px_150px] text-sm">
              <div className="min-h-[76px] px-5 py-4">
                <p className="font-bold text-slate-950">{serviceLine.title}</p>
                <p className="mt-1 leading-6 text-slate-600">{serviceLine.description}</p>
              </div>
              <div className="flex items-center justify-center border-l border-slate-200 px-4 py-4 font-semibold">{serviceLine.quantity}</div>
              <div className="flex items-center justify-end border-l border-slate-200 px-4 py-4 font-semibold">{formatCurrency(serviceLine.unitPriceExcludingTax)}</div>
              <div className="flex items-center justify-end border-l border-slate-200 px-4 py-4 font-bold text-slate-950">{formatCurrency(subtotalExcludingTax)}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <DocumentBlock icon={<CreditCard size={20} />} title="Conditions de paiement">
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  <li>30% a la validation du devis.</li>
                  <li>Solde a la livraison ou a la fin de mission.</li>
                </ul>
              </DocumentBlock>

              <DocumentBlock icon={<FileText size={20} />} title="Conditions & notes">
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  <li>Les prix sont etablis sur les informations communiquees a la date du devis.</li>
                  <li>Toute demande supplementaire pourra faire l'objet d'un devis complementaire.</li>
                </ul>
              </DocumentBlock>
            </div>

            <div>
              <div className="overflow-hidden rounded-[6px] border border-slate-300 text-sm">
                <TotalRow label="Sous-total HT" value={formatCurrency(subtotalExcludingTax)} />
                <TotalRow label={`TVA (${taxRate}%)`} value={formatCurrency(taxAmount)} />
                <TotalRow label="Couts directs" value={formatCurrency(baseCost)} />
                <TotalRow label="Profit estime" value={formatCurrency(netProfit)} />
                <div className="flex items-center justify-between bg-brand-700 px-5 py-4 text-xl font-black text-white">
                  <span>Total TTC</span>
                  <span>{formatCurrency(finalPrice)}</span>
                </div>
              </div>

              <DocumentBlock className="mt-8" icon={<PenLine size={20} />} title="Signature & cachet">
                <p className="text-sm leading-6 text-slate-700">Bon pour accord, date et signature.</p>
                <div className="mt-4 h-24 rounded-[6px] border border-slate-300 bg-white" />
              </DocumentBlock>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function DocumentBlock({
  icon,
  title,
  children,
  className = '',
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-center gap-3 border-b-2 border-brand-700 pb-2 text-brand-700">
        {icon}
        <h3 className="text-lg font-black uppercase">{title}</h3>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function HeaderMeta({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 text-left">
      <span className="font-black uppercase text-slate-950">{label}</span>
      <span className={`text-right font-bold ${accent ? 'text-brand-700' : 'text-slate-950'}`}>{value}</span>
    </div>
  );
}

function InfoLines({ lines, className = '' }: { lines: Array<string | null | undefined | false>; className?: string }) {
  const visibleLines = lines.filter((line): line is string => Boolean(line));
  return (
    <div className={`space-y-2 text-sm leading-6 text-slate-700 ${className}`}>
      {visibleLines.map((line, index) => (
        <p key={`${line}-${index}`} className="whitespace-pre-line">
          {line}
        </p>
      ))}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
      <span className="font-semibold uppercase text-slate-700">{label}</span>
      <span className="font-bold text-slate-950">{value}</span>
    </div>
  );
}

function buildServiceLine(row: CalculationRow, input: PricingInput, finalPrice: number) {
  const quantity = input.billingMode === 'fixed' ? 1 : Math.max(1, Number(input.workHours || 1));
  const unitPriceIncludingTax = input.billingMode === 'fixed' ? finalPrice : Number(input.hourlyRate || 0);
  const taxRate = Math.max(0, input.taxPercent || 0) / 100;
  const unitPriceExcludingTax = taxRate >= 1 ? unitPriceIncludingTax : unitPriceIncludingTax / (1 + taxRate);

  return {
    title: row.title || 'Prestation',
    description: getBillingModeLabel(input.billingMode),
    quantity: formatQuantity(quantity),
    unitPriceExcludingTax,
  };
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

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value)) : 'Date indisponible';
}

function formatValidityDate(value: string | null) {
  if (!value) return 'Date indisponible';
  const date = new Date(value);
  date.setDate(date.getDate() + 30);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace('.', ',');
}
