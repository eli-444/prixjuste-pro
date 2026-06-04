'use client';

import { useState } from 'react';
import { showToast } from '@/lib/toast';

export function PublicQuoteActions({
  token,
  status,
  depositStatus,
}: {
  token: string;
  status: string;
  depositStatus: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const isAccepted = status === 'accepted';

  async function acceptQuote() {
    setIsAccepting(true);

    try {
      const response = await fetch(`/api/quotes/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Acceptation impossible pour le moment.');
      }

      showToast('Devis accepté. Merci, votre accord a bien été enregistré.', 'success');
      window.location.reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Acceptation impossible pour le moment.', 'error');
    } finally {
      setIsAccepting(false);
    }
  }

  async function payDeposit() {
    setIsPaying(true);

    try {
      const response = await fetch(`/api/quotes/${token}/deposit`, { method: 'POST' });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; url?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Paiement impossible pour le moment.');
      }

      window.location.href = payload.url;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Paiement impossible pour le moment.', 'error');
      setIsPaying(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold tracking-tight text-slate-950">Validation client</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Vous pouvez accepter ce devis en ligne. L'entreprise recevra automatiquement le statut accepté dans Tarifly.
      </p>

      {isAccepted ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          Devis déjà accepté.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Votre nom"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Votre email"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Message optionnel"
            rows={3}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={acceptQuote}
            disabled={isAccepting}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAccepting ? 'Acceptation...' : 'Accepter le devis'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={payDeposit}
        disabled={isPaying || depositStatus === 'paid'}
        className="mt-4 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {depositStatus === 'paid' ? 'Acompte déjà payé' : isPaying ? 'Ouverture du paiement...' : "Payer l'acompte"}
      </button>
    </section>
  );
}

