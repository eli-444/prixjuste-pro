'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function SuccessPage() {
  const [status, setStatus] = useState('Activation de votre acces premium...');
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    if (!sessionId) {
      setStatus('Paiement valide. Votre acces sera verifie automatiquement dans votre espace compte.');
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
        setIsActivated(true);
        setStatus('Votre abonnement Tarifly Premium est actif.');
      })
      .catch((error) => {
        setStatus(
          error instanceof Error
            ? `Paiement valide, activation en verification : ${error.message}`
            : 'Paiement valide, activation en verification.',
        );
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-soft md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <CheckCircle2 size={30} />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Paiement confirme</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Bienvenue dans Tarifly Premium.
            </h1>
            <p className="mt-5 max-w-xl leading-8 text-slate-600">{status}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/outil" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white">
                Ouvrir le calculateur
                <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-4 text-sm font-semibold text-slate-950">
                Voir mon compte
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Prochaines etapes</p>
            <div className="mt-5 grid gap-3">
              <Step icon={<ShieldCheck />} title={isActivated ? 'Acces active' : 'Acces en verification'} text="Votre statut premium est rattache a votre compte." />
              <Step icon={<LayoutDashboard />} title="Nouveau calcul" text="Renseignez vos hypotheses et consultez le diagnostic complet." />
              <Step icon={<FileText />} title="Exporter le rapport" text="Telechargez un PDF professionnel pour vos dossiers et propositions." />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
      <div>
        <p className="font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
