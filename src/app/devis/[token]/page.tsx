import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, CreditCard, FileText } from 'lucide-react';
import { PublicQuoteActions } from '@/components/PublicQuoteActions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils';

type QuoteItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPriceExcludingTax: number;
  totalExcludingTax: number;
};

type QuoteParty = {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
};

type PublicQuote = {
  id: string;
  quote_number: string;
  status: string;
  company_snapshot: QuoteParty;
  client_snapshot: QuoteParty;
  items: QuoteItem[];
  subtotal_excluding_tax: number;
  tax_amount: number;
  total_including_tax: number;
  validity_days: number;
  deposit_percent: number;
  deposit_amount: number;
  deposit_status: string;
  generated_at: string;
  accepted_at: string | null;
};

export default async function PublicQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ payment?: string }>;
}) {
  const { token } = await params;
  const payment = (await searchParams)?.payment;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    notFound();
  }

  const { data } = await supabase
    .from('quotes')
    .select(
      'id, quote_number, status, company_snapshot, client_snapshot, items, subtotal_excluding_tax, tax_amount, total_including_tax, validity_days, deposit_percent, deposit_amount, deposit_status, generated_at, accepted_at',
    )
    .eq('public_token', token)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const quote = data as PublicQuote;
  const company = quote.company_snapshot ?? {};
  const client = quote.client_snapshot ?? {};
  const items = Array.isArray(quote.items) ? quote.items : [];
  const generatedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(quote.generated_at));

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:py-12">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo-nav.png" alt="Tarifly" width={128} height={42} className="h-auto w-32" />
          </Link>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            Devis {quote.quote_number}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            {payment === 'success' ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                Paiement recu. Le statut peut prendre quelques secondes a se mettre a jour.
              </div>
            ) : null}
            {payment === 'cancel' ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700">
                Paiement interrompu. Vous pouvez relancer l'acompte depuis cette page.
              </div>
            ) : null}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Devis client</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Proposition commerciale</h1>
                <p className="mt-3 text-slate-600">Emis le {generatedAt}. Valable {quote.validity_days || 30} jours.</p>
              </div>
              <QuoteStatus status={quote.status} />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <PartyBlock title="Emetteur" party={company} />
              <PartyBlock title="Client" party={client} />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1fr_90px_90px_140px] gap-3 bg-slate-950 px-5 py-4 text-sm font-bold text-white">
                <span>Description</span>
                <span>Quantite</span>
                <span>Unite</span>
                <span className="text-right">Total HT</span>
              </div>
              <div className="divide-y divide-slate-200">
                {items.map((item, index) => (
                  <div key={`${item.description}-${index}`} className="grid grid-cols-[1fr_90px_90px_140px] gap-3 px-5 py-4 text-sm">
                    <span className="font-semibold text-slate-950">{item.description}</span>
                    <span className="text-slate-600">{formatQuantity(item.quantity)}</span>
                    <span className="text-slate-600">{item.unit}</span>
                    <span className="text-right font-semibold text-slate-950">{formatCurrency(Number(item.totalExcludingTax ?? 0))}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm space-y-3 rounded-2xl bg-slate-50 p-5">
                <TotalRow label="Total HT" value={formatCurrency(Number(quote.subtotal_excluding_tax ?? 0))} />
                <TotalRow label="TVA" value={formatCurrency(Number(quote.tax_amount ?? 0))} />
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-950">
                  <span>Total TTC</span>
                  <span>{formatCurrency(Number(quote.total_including_tax ?? 0))}</span>
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <CreditCard size={18} />
                </span>
                <h2 className="font-bold text-slate-950">Acompte</h2>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{formatCurrency(Number(quote.deposit_amount ?? 0))}</p>
              <p className="mt-2 text-sm text-slate-600">{quote.deposit_percent || 30} % du total TTC.</p>
              <p className="mt-3 text-sm font-semibold text-slate-500">Statut : {getDepositStatusLabel(quote.deposit_status)}</p>
            </section>

            <PublicQuoteActions token={token} status={quote.status} depositStatus={quote.deposit_status} />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText size={18} />
                </span>
                <h2 className="font-bold text-slate-950">Suivi</h2>
              </div>
              {quote.accepted_at ? (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Devis accepte le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(quote.accepted_at))}.
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">Le devis est en attente de validation client.</p>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function PartyBlock({ title, party }: { title: string; party: QuoteParty }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-3 text-xl font-bold text-slate-950">{party.name || 'Non renseigne'}</p>
      {party.address ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{party.address}</p> : null}
      {party.email ? <p className="mt-3 text-sm font-semibold text-slate-700">{party.email}</p> : null}
      {party.phone ? <p className="mt-1 text-sm text-slate-600">{party.phone}</p> : null}
    </div>
  );
}

function QuoteStatus({ status }: { status: string }) {
  const accepted = status === 'accepted';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
        accepted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {accepted ? <CheckCircle2 size={16} /> : null}
      {accepted ? 'Accepte' : 'En attente'}
    </span>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(value || 0));
}

function getDepositStatusLabel(status: string) {
  const labels: Record<string, string> = {
    not_requested: 'non paye',
    pending: 'en attente',
    paid: 'paye',
    failed: 'echec',
  };

  return labels[status] ?? status;
}
