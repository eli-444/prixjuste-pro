import Link from 'next/link';
import { requireActivePremium } from '@/lib/premium/server';

export default async function DashboardQuotesPage() {
  const { supabase, user } = await requireActivePremium({ loginRedirect: '/dashboard/devis' });

  const { data } = await supabase
    .from('quotes')
    .select('id, public_token, quote_number, status, total_including_tax, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <DashboardPageShell title="Devis">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {data && data.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {data.map((quote) => (
              <div key={quote.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_140px_120px_auto] md:items-center">
                <div>
                  <p className="font-bold text-slate-950">Devis {quote.quote_number}</p>
                  <p className="mt-1 text-slate-500">{formatDate(quote.created_at)}</p>
                </div>
                <p className="font-bold text-slate-950">{formatEuro(Number(quote.total_including_tax ?? 0))}</p>
                <p className="font-semibold text-slate-700">{quote.status}</p>
                <Link href={`/devis/${quote.public_token}`} target="_blank" className="font-bold text-brand-600">
                  Ouvrir
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">Aucun devis généré.</div>
        )}
      </div>
    </DashboardPageShell>
  );
}

function DashboardPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden p-4 md:p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </header>
      {children}
    </div>
  );
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value)) : 'Date indisponible';
}

