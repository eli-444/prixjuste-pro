'use client';

import Link from 'next/link';
import { useState } from 'react';
import { trackProductEvent } from '@/lib/product-analytics';
import { showToast } from '@/lib/toast';

type CheckoutButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function CheckoutButton({ className, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  async function handleCheckout() {
    if (!legalAccepted) {
      showToast('Vous devez accepter les conditions avant de continuer.', 'error');
      return;
    }

    setLoading(true);
    trackProductEvent('checkout_started', { source: 'pricing_card' });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ legalAccepted: true }),
      });

      if (response.status === 401) {
        window.location.href = '/connexion?redirect=/dashboard/facturation';
        return;
      }

      if (!response.ok) {
        throw new Error('Impossible de préparer le paiement pour le moment.');
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        throw new Error("Impossible d'ouvrir la page de paiement.");
      }

      trackProductEvent('checkout_redirected', { source: 'pricing_card' });
      window.location.href = data.url;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Une erreur est survenue.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm leading-6 text-slate-700">
        <input
          type="checkbox"
          checked={legalAccepted}
          onChange={(event) => setLegalAccepted(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <span>
          J’ai lu et j’accepte les{' '}
          <Link href="/conditions" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Conditions Générales d’Utilisation et de Vente
          </Link>{' '}
          ainsi que la{' '}
          <Link href="/confidentialite" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ??
          'rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
        }
      >
        {loading ? 'Redirection...' : children ?? 'Débloquer Premium'}
      </button>
    </div>
  );
}

