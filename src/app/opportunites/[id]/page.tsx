import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarClock, Target } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SavedCalculationActions } from '@/components/SavedCalculationActions';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  getOpportunityScore,
  getQuoteHealthLabel,
  getQuoteHealthScore,
  statusLabels,
  type OpportunityStatus,
} from '@/lib/opportunities';
import { compareToMarket, marketUnitLabels, type MarketRate, type MarketUnit } from '@/lib/market';
import type { PricingInput, PricingResult } from '@/lib/pricing';

type CalculationDetail = {
  id: string;
  title: string | null;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  probability: number | null;
  deadline: string | null;
  client_budget: number | null;
  next_action: string | null;
  quote_validated: boolean | null;
  quote_validated_at: string | null;
  market_profession_slug: string | null;
  market_city: string | null;
  market_unit: MarketUnit | null;
  market_reference_price: number | null;
  market_snapshot: MarketRate | null;
  activity_type: PricingInput['activityType'];
  input: PricingInput;
  result: PricingResult;
  recommended_price: number | null;
  created_at: string;
};

type QuoteRow = {
  id: string;
  public_token: string;
  quote_number: string;
  status: string;
  deposit_status: string;
  total_including_tax: number | null;
  created_at: string;
};

type ClientHistoryRow = {
  id: string;
  title: string | null;
  opportunity_status: OpportunityStatus | null;
  recommended_price: number | null;
  created_at: string;
};

export default async function OpportunityDetailPage({
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
    redirect(`/connexion?redirect=/opportunites/${id}`);
  }

  const { data } = await supabase
    .from('pricing_calculations')
    .select('id, title, client_name, opportunity_status, probability, deadline, client_budget, next_action, quote_validated, quote_validated_at, market_profession_slug, market_city, market_unit, market_reference_price, market_snapshot, activity_type, input, result, recommended_price, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const calculation = data as CalculationDetail;
  const title = calculation.title || 'Calcul sans titre';
  const marketComparison = compareToMarket(Number(calculation.market_reference_price ?? 0), calculation.market_snapshot);
  const score = getOpportunityScore({
    marginRate: calculation.result.marginRate,
    probability: calculation.probability ?? 0,
    clientBudget: calculation.client_budget ?? 0,
    recommendedPrice: Number(calculation.recommended_price ?? 0),
  });
  const quoteHealthScore = getQuoteHealthScore({
    marginRate: calculation.result.marginRate,
    marketGapToMedian: marketComparison?.gapToMedian ?? null,
    clientBudget: calculation.client_budget,
    recommendedPrice: Number(calculation.recommended_price ?? 0),
  });
  const [{ data: quotes }, { data: clientHistory }] = await Promise.all([
    supabase
      .from('quotes')
      .select('id, public_token, quote_number, status, deposit_status, total_including_tax, created_at')
      .eq('calculation_id', calculation.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    calculation.client_name
      ? supabase
          .from('pricing_calculations')
          .select('id, title, opportunity_status, recommended_price, created_at')
          .eq('user_id', user.id)
          .eq('client_name', calculation.client_name)
          .neq('id', calculation.id)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-12 md:py-16">
        <section className="mx-auto max-w-6xl">
          <Link href="/dashboard/opportunites" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
            <ArrowLeft size={16} />
            Retour aux opportunites
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
                {statusLabels[calculation.opportunity_status ?? 'to_price']}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-3 text-slate-600">{calculation.client_name || 'Client non renseigne'}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <Metric label="Prix recommande" value={formatCurrency(Number(calculation.recommended_price ?? 0))} />
                <Metric label="Marge réelle" value={formatPercent(calculation.result.marginRate)} />
                <Metric label="Score opportunité" value={`${score}/100`} />
                <Metric label="Score devis" value={`${quoteHealthScore}/100`} />
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Diagnostic</h2>
                <p className="mt-3 font-bold text-brand-600">{getQuoteHealthLabel(quoteHealthScore)}</p>
                <p className="mt-3 leading-7 text-slate-600">{calculation.result.diagnosis}</p>
                <h3 className="mt-6 font-bold text-slate-950">Justification client</h3>
                <p className="mt-2 leading-7 text-slate-600">{calculation.result.clientJustification}</p>
              </div>

              <div className="mt-8">
                <SavedCalculationActions calculationId={calculation.id} title={title} result={calculation.result} />
              </div>
            </article>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="font-bold text-slate-950">Devis rattaches</h2>
                {quotes && quotes.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {(quotes as QuoteRow[]).map((quote) => (
                      <div key={quote.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-950">Devis {quote.quote_number}</p>
                            <p className="mt-1 text-slate-500">{formatDate(quote.created_at)}</p>
                          </div>
                          <p className="font-semibold text-slate-950">{formatCurrency(Number(quote.total_including_tax ?? 0))}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em]">
                          <span className="rounded-full bg-white px-3 py-1 text-slate-600">{quote.status}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-slate-600">Acompte {quote.deposit_status}</span>
                        </div>
                        <Link
                          href={`/devis/${quote.public_token}`}
                          target="_blank"
                          className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Ouvrir le lien client
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">Aucun devis client n'est encore rattaché à cette opportunité.</p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Target size={18} />
                  </span>
                  <h2 className="font-bold text-slate-950">Pilotage commercial</h2>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <InfoRow label="Budget client" value={calculation.client_budget ? formatCurrency(calculation.client_budget) : 'Non renseigné'} />
                  <InfoRow label="Probabilite" value={`${calculation.probability ?? 0} %`} />
                  <InfoRow label="Devis valide" value={calculation.quote_validated ? 'Oui' : 'Non'} />
                  <InfoRow label="Prochaine action" value={calculation.next_action || 'Non renseignée'} />
                  <InfoRow label="Deadline" value={calculation.deadline ? formatDate(calculation.deadline) : 'Non renseignée'} />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="font-bold text-slate-950">Historique client</h2>
                {clientHistory && clientHistory.length > 0 ? (
                  <div className="mt-5 space-y-3 text-sm">
                    {(clientHistory as ClientHistoryRow[]).map((item) => (
                      <Link key={item.id} href={`/opportunites/${item.id}`} className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">
                        <p className="font-bold text-slate-950">{item.title || 'Calcul sans titre'}</p>
                        <div className="mt-2 flex items-center justify-between gap-3 text-slate-500">
                          <span>{statusLabels[item.opportunity_status ?? 'to_price']}</span>
                          <span className="font-semibold text-slate-950">{formatCurrency(Number(item.recommended_price ?? 0))}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">Aucun autre dossier pour ce client.</p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="font-bold text-slate-950">Benchmark marche</h2>
                {calculation.market_snapshot ? (
                  <div className="mt-5 space-y-4 text-sm">
                    <InfoRow label="Zone" value={calculation.market_city || calculation.market_snapshot.city || 'France'} />
                    <InfoRow label="Unite" value={marketUnitLabels[calculation.market_unit ?? calculation.market_snapshot.unit]} />
                    <InfoRow label="Votre prix" value={formatCurrency(Number(calculation.market_reference_price ?? 0))} />
                    <InfoRow label="Median indicatif" value={formatCurrency(calculation.market_snapshot.price_median)} />
                    <InfoRow label="Fourchette" value={`${formatCurrency(calculation.market_snapshot.price_low)} - ${formatCurrency(calculation.market_snapshot.price_high)}`} />
                    {marketComparison ? (
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="font-bold text-slate-950">{marketComparison.title}</p>
                        <p className="mt-2 leading-6 text-slate-600">{marketComparison.message}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">Aucun benchmark marche n'etait disponible lors de la sauvegarde.</p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                    <CalendarClock size={18} />
                  </span>
                  <h2 className="font-bold text-slate-950">Hypotheses sauvegardees</h2>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <InfoRow label="Activite" value={calculation.activity_type} />
                  <InfoRow label="Cout direct" value={formatCurrency(calculation.input.productCost)} />
                  <InfoRow label="Temps" value={`${calculation.input.workHours} h`} />
                  <InfoRow label="Taux horaire" value={formatCurrency(calculation.input.hourlyRate)} />
                  <InfoRow label="Frais fixes" value={formatCurrency(calculation.input.fixedFees)} />
                  <InfoRow label="Marge cible" value={`${calculation.input.desiredMarginPercent} %`} />
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}
