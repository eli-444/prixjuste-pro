'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  const [status, setStatus] = useState('Activation de votre acces premium...');

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    if (!sessionId) {
      setStatus('Paiement valide. Rechargez votre compte si votre acces premium ne s affiche pas encore.');
      return;
    }

    fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? 'Activation impossible.');
        }

        window.localStorage.setItem('tarifly_premium', 'true');
        setStatus('Votre acces premium est active.');
      })
      .catch((error) => {
        setStatus(
          error instanceof Error
            ? `Paiement valide, mais activation en attente : ${error.message}`
            : 'Paiement valide, mais activation en attente. Rechargez la page dans quelques secondes.',
        );
      });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">Paiement valide</h1>
        <p className="mt-3 leading-7 text-slate-600">
          {status} Vous pouvez ensuite utiliser le diagnostic complet et l'export professionnel.
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
