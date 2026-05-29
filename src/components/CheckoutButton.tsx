'use client';

import { useState } from 'react';

type CheckoutButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function CheckoutButton({ className, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      if (response.status === 401) {
        window.location.href = '/connexion?redirect=/outil';
        return;
      }

      if (!response.ok) {
        throw new Error('Impossible de preparer le paiement pour le moment.');
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        throw new Error("Impossible d'ouvrir la page de paiement.");
      }

      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ??
        'rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {loading ? 'Redirection...' : children ?? 'Debloquer Premium'}
    </button>
  );
}
