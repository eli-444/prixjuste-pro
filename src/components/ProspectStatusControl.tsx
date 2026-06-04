'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { showToast } from '@/lib/toast';

type ProspectDecision = 'accepted' | 'refused';

export function ProspectStatusControl({ calculationId }: { calculationId: string }) {
  const router = useRouter();
  const [selectedDecision, setSelectedDecision] = useState<ProspectDecision | ''>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const decisionLabel = selectedDecision === 'accepted' ? 'Accepté' : 'Refusé';

  function handleSelect(value: string) {
    if (value !== 'accepted' && value !== 'refused') {
      setSelectedDecision('');
      return;
    }

    setSelectedDecision(value);
    setIsConfirmOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setSelectedDecision('');
    setIsConfirmOpen(false);
  }

  async function confirmDecision() {
    if (!selectedDecision) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/prospects/${calculationId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedDecision }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de modifier le statut.');
      }

      showToast(selectedDecision === 'accepted' ? 'Devis accepté. Prix ajouté aux données marché.' : 'Devis refusé. Prix non ajouté aux données marché.', 'success');
      setIsConfirmOpen(false);
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible de modifier le statut.', 'error');
      setSelectedDecision('');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <select
        value={selectedDecision}
        onChange={(event) => handleSelect(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      >
        <option value="">En attente</option>
        <option value="accepted">Accepté</option>
        <option value="refused">Refusé</option>
      </select>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <p className="text-lg font-black text-slate-950">Modifier le statut du devis ?</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Êtes-vous sûr de vouloir passer ce devis en statut {decisionLabel.toLowerCase()} ? Cette action est irréversible.
            </p>
            <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {selectedDecision === 'accepted'
                ? 'Le prix sera envoyé aux statistiques de marché Tarifly.'
                : 'Le prix ne sera pas envoyé aux statistiques de marché Tarifly.'}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDecision}
                disabled={isSaving}
                className="rounded-xl bg-brand-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Modification...' : 'Oui, modifier le statut'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

