import Link from 'next/link';

export default function CancelPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Paiement annulé</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Aucun paiement n’a été effectué. Vous pouvez relancer l’achat depuis la page de facturation.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard/facturation" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">
            Retour à la facturation
          </Link>
          <Link href="/" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950">
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
