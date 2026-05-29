'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  useEffect(() => {
    window.localStorage.setItem('tarifly_premium', 'true');
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">Paiement valide</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Votre acces premium est active. Vous pouvez maintenant utiliser le diagnostic complet et l'export
          professionnel.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/outil" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">
            Acceder au calculateur
          </Link>
          <Link href="/mon-compte" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950">
            Mon compte
          </Link>
        </div>
      </div>
    </main>
  );
}
