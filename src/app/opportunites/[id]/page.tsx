import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarClock, Target } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SavedCalculationActions } from '@/components/SavedCalculationActions';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { getOpportunityScore, statusLabels, type OpportunityStatus } from '@/lib/opportunities';
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
  activity_type: PricingInput['activityType'];
  input: PricingInput;
  result: PricingResult;
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
    .select('id, title, client_name, opportunity_status, probability, deadline, client_budget, next_action, activity_type, input, result, recommended_price, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const calculation = data as CalculationDetail;
  const title = calculation.title || 'Calcul sans titre';
  const score = getOpportunityScore({
    marginRate: calculation.result.marginRate,
    probability: calculation.probability ?? 0,
    clientBudget: calculation.client_budget ?? 0,
    recommendedPrice: Number(calculation.recommended_price ?? 0),
  });

  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-12 md:py-16">
        <section className="mx-auto max-w-6xl">
          <Link href="/opportunites" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
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
                <Metric label="Marge reelle" value={formatPercent(calculation.result.marginRate)} />
                <Metric label="Score opportunite" value={`${score}/100`} />
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Diagnostic</h2>
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
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Target size={18} />
                  </span>
                  <h2 className="font-bold text-slate-950">Pilotage commercial</h2>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <InfoRow label="Budget client" value={calculation.client_budget ? formatCurrency(calculation.client_budget) : 'Non renseigne'} />
                  <InfoRow label="Probabilite" value={`${calculation.probability ?? 0} %`} />
                  <InfoRow label="Prochaine action" value={calculation.next_action || 'Non renseignee'} />
                  <InfoRow label="Deadline" value={calculation.deadline ? formatDate(calculation.deadline) : 'Non renseignee'} />
                </div>
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
