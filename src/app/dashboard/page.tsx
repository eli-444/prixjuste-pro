import { BarChart3, CheckCircle2, Send, TrendingUp, Users, XCircle } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';
import { getSupabaseConfig } from '@/lib/supabase/env';
import { formatCurrency } from '@/lib/utils';
import type { OpportunityStatus } from '@/lib/opportunities';
import { requireActivePremium } from '@/lib/premium/server';

type QuoteStatus = 'draft' | 'generated' | 'sent' | 'accepted' | 'refused' | 'expired';

type QuoteRow = {
  id: string;
  calculation_id: string | null;
  status: QuoteStatus | null;
  total_including_tax: number | null;
  created_at: string;
};

type CalculationRow = {
  id: string;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  recommended_price: number | null;
  created_at: string;
};

type ClientPortfolioRow = {
  name: string;
  total: number;
  count: number;
  accepted: number;
};

type MonthStat = {
  key: string;
  label: string;
  total: number;
  accepted: number;
  value: number;
};

const sentQuoteStatuses: QuoteStatus[] = ['generated', 'sent', 'accepted', 'refused', 'expired'];

export default async function DashboardPage() {
  const { isConfigured } = getSupabaseConfig();
  const { supabase, user } = await requireActivePremium({ loginRedirect: '/dashboard' });

  if (!isConfigured || !supabase) {
    return (
      <div className="grid h-full place-items-center p-5">
        <section className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Tableau de bord indisponible</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Merci de réessayer plus tard.</p>
        </section>
      </div>
    );
  }

  const [{ data: quotesData }, { data: calculationsData }] = await Promise.all([
    supabase
      .from('quotes')
      .select('id, calculation_id, status, total_including_tax, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('pricing_calculations')
      .select('id, client_name, opportunity_status, recommended_price, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  const quotes = (quotesData ?? []) as QuoteRow[];
  const calculations = (calculationsData ?? []) as CalculationRow[];

  const successStats = buildSuccessStats(quotes, calculations);
  const clientStats = buildClientStats(calculations);
  const monthStats = buildMonthStats(calculations);
  const yearStats = buildYearStats(calculations);

  return (
    <div className="h-full overflow-auto p-3 md:p-4">
      <header className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950">Tableau de bord</h1>
        </div>
        <SignOutButton className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" />
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <section className="grid gap-4">
          <StatPanel title="Performance de réussite" icon={<TrendingUp size={18} />}>
            <div className="grid gap-4 md:grid-cols-[150px_1fr] md:items-center">
              <DonutChart
                accepted={successStats.accepted}
                refused={successStats.refused}
                pending={successStats.pending}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <KpiCard icon={<Send size={17} />} label="Devis envoyés" value={`${successStats.sent}`} tone="blue" />
                <KpiCard icon={<CheckCircle2 size={17} />} label="Acceptés" value={`${successStats.accepted}`} tone="green" detail={`${successStats.successRate}% réussite`} />
                <KpiCard icon={<XCircle size={17} />} label="Refusés" value={`${successStats.refused}`} tone="red" />
              </div>
            </div>
          </StatPanel>

          <StatPanel title="Performance mois / année" icon={<BarChart3 size={18} />}>
            <div className="grid gap-4 lg:grid-cols-[1fr_210px]">
              <ColumnChart months={monthStats} />
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <MiniMetric label="Année en cours" value={`${yearStats.total}`} detail="opportunités" />
                <MiniMetric label="Signées" value={`${yearStats.accepted}`} detail={`${yearStats.acceptanceRate}% de réussite`} />
                <MiniMetric label="Potentiel annuel" value={formatCurrency(yearStats.value)} detail="prix proposés" />
              </div>
            </div>
          </StatPanel>
        </section>

        <section className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard icon={<Users size={17} />} label="Clients" value={`${clientStats.uniqueClients}`} tone="aqua" detail={`${clientStats.activeClients} actifs`} />
            <KpiCard icon={<CheckCircle2 size={17} />} label="Clients gagnés" value={`${clientStats.acceptedClients}`} tone="green" />
            <KpiCard icon={<TrendingUp size={17} />} label="Portefeuille" value={formatCurrency(clientStats.totalValue)} tone="blue" />
          </div>

          <StatPanel title="Portefeuille client" icon={<Users size={18} />}>
            <ClientPortfolioChart clients={clientStats.topClients} totalValue={clientStats.totalValue} />
          </StatPanel>
        </section>
      </div>
    </div>
  );
}

function buildSuccessStats(quotes: QuoteRow[], calculations: CalculationRow[]) {
  const sentQuotes = quotes.filter((quote) => sentQuoteStatuses.includes((quote.status ?? 'draft') as QuoteStatus));
  const acceptedQuoteCalculationIds = new Set(quotes.filter((quote) => quote.status === 'accepted' && quote.calculation_id).map((quote) => quote.calculation_id as string));
  const refusedQuoteCalculationIds = new Set(quotes.filter((quote) => quote.status === 'refused' && quote.calculation_id).map((quote) => quote.calculation_id as string));
  const accepted = quotes.filter((quote) => quote.status === 'accepted').length + calculations.filter((calculation) => calculation.opportunity_status === 'won' && !acceptedQuoteCalculationIds.has(calculation.id)).length;
  const refused = quotes.filter((quote) => quote.status === 'refused').length + calculations.filter((calculation) => calculation.opportunity_status === 'lost' && !refusedQuoteCalculationIds.has(calculation.id)).length;
  const sent = Math.max(sentQuotes.length, accepted + refused);
  const pending = Math.max(0, sent - accepted - refused);
  const successRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

  return { sent, accepted, refused, pending, successRate };
}

function buildClientStats(calculations: CalculationRow[]) {
  const portfolio = new Map<string, ClientPortfolioRow>();

  for (const calculation of calculations) {
    const clientName = (calculation.client_name ?? '').trim();

    if (!clientName) {
      continue;
    }

    const current = portfolio.get(clientName) ?? { name: clientName, total: 0, count: 0, accepted: 0 };
    current.total += Number(calculation.recommended_price ?? 0);
    current.count += 1;
    current.accepted += calculation.opportunity_status === 'won' ? 1 : 0;
    portfolio.set(clientName, current);
  }

  const clients = [...portfolio.values()].sort((a, b) => b.total - a.total);
  const activeClients = new Set(calculations.filter((calculation) => calculation.client_name && !['won', 'lost'].includes(calculation.opportunity_status ?? '')).map((calculation) => calculation.client_name)).size;
  const acceptedClients = new Set(calculations.filter((calculation) => calculation.client_name && calculation.opportunity_status === 'won').map((calculation) => calculation.client_name)).size;
  const totalValue = clients.reduce((total, client) => total + client.total, 0);

  return {
    uniqueClients: clients.length,
    activeClients,
    acceptedClients,
    totalValue,
    topClients: clients.slice(0, 5),
  };
}

function buildMonthStats(calculations: CalculationRow[]) {
  const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
  const now = new Date();
  const months: MonthStat[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatter.format(date).replace('.', ''),
      total: 0,
      accepted: 0,
      value: 0,
    });
  }

  const monthMap = new Map(months.map((month) => [month.key, month]));

  for (const calculation of calculations) {
    const createdAt = new Date(calculation.created_at);
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const month = monthMap.get(key);

    if (!month) {
      continue;
    }

    month.total += 1;
    month.accepted += calculation.opportunity_status === 'won' ? 1 : 0;
    month.value += Number(calculation.recommended_price ?? 0);
  }

  return months;
}

function buildYearStats(calculations: CalculationRow[]) {
  const currentYear = new Date().getFullYear();
  const yearlyCalculations = calculations.filter((calculation) => new Date(calculation.created_at).getFullYear() === currentYear);
  const accepted = yearlyCalculations.filter((calculation) => calculation.opportunity_status === 'won').length;
  const total = yearlyCalculations.length;
  const value = yearlyCalculations.reduce((sum, calculation) => sum + Number(calculation.recommended_price ?? 0), 0);
  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  return { total, accepted, value, acceptanceRate };
}

function StatPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
        <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function KpiCard({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail?: string; tone: 'blue' | 'green' | 'red' | 'aqua' }) {
  const tones = {
    blue: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    aqua: 'bg-aqua-50 text-aqua-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className={`grid h-8 w-8 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
        <span className="text-right text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      {detail ? <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p> : null}
    </div>
  );
}

function MiniMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function DonutChart({ accepted, refused, pending }: { accepted: number; refused: number; pending: number }) {
  const total = accepted + refused + pending;
  const acceptedPercent = total > 0 ? (accepted / total) * 100 : 0;
  const refusedPercent = total > 0 ? (refused / total) * 100 : 0;
  const pendingPercent = total > 0 ? (pending / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="grid h-32 w-32 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#10b981 0 ${acceptedPercent}%, #ef4444 ${acceptedPercent}% ${acceptedPercent + refusedPercent}%, #cbd5e1 ${acceptedPercent + refusedPercent}% ${acceptedPercent + refusedPercent + pendingPercent}%, #e2e8f0 0)`,
        }}
      >
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center shadow-inner">
          <span>
            <span className="block text-2xl font-black text-slate-950">{total}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">devis</span>
          </span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px] font-bold text-slate-600">
        <Legend color="bg-emerald-500" label="Acceptés" />
        <Legend color="bg-red-500" label="Refusés" />
        <Legend color="bg-slate-300" label="En attente" />
      </div>
    </div>
  );
}

function ColumnChart({ months }: { months: MonthStat[] }) {
  const maxTotal = Math.max(1, ...months.map((month) => month.total));

  return (
    <div className="flex min-h-44 items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 pb-3 pt-4">
      {months.map((month) => {
        const totalHeight = Math.max(8, (month.total / maxTotal) * 112);
        const acceptedHeight = month.total > 0 ? Math.max(0, (month.accepted / month.total) * totalHeight) : 0;

        return (
          <div key={month.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full max-w-10 items-end rounded-full bg-white px-1 py-1 shadow-inner">
              <div className="relative w-full overflow-hidden rounded-full bg-brand-200" style={{ height: `${totalHeight}px` }}>
                <div className="absolute bottom-0 left-0 right-0 rounded-full bg-brand-600" style={{ height: `${acceptedHeight}px` }} />
              </div>
            </div>
            <span className="truncate text-xs font-black uppercase text-slate-500">{month.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ClientPortfolioChart({ clients, totalValue }: { clients: ClientPortfolioRow[]; totalValue: number }) {
  if (clients.length === 0) {
    return <div className="grid min-h-40 place-items-center rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">Aucun client renseigné pour le moment.</div>;
  }

  return (
    <div className="space-y-3">
      {clients.map((client) => {
        const width = totalValue > 0 ? Math.max(7, (client.total / totalValue) * 100) : 0;

        return (
          <div key={client.name}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-black text-slate-950">{client.name}</span>
              <span className="shrink-0 font-bold text-slate-600">{formatCurrency(client.total)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#0878f2,#11cfc2)]" style={{ width: `${width}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {client.count} dossier{client.count > 1 ? 's' : ''} · {client.accepted} accepté{client.accepted > 1 ? 's' : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
