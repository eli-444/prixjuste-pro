'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { showToast } from '@/lib/toast';

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);

    try {
      const response = await fetch('/api/billing-portal', { method: 'POST' });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Impossible d'ouvrir la gestion d'abonnement.");
      }

      window.location.href = data.url;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Une erreur est survenue.', 'error');
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CreditCard size={16} />
      {loading ? 'Ouverture...' : "Gérer / résilier l'abonnement"}
    </button>
  );
}
