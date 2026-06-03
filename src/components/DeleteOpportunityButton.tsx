'use client';

import { useState } from 'react';
import { Trash2, X } from 'lucide-react';

export function DeleteOpportunityButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        aria-label="Supprimer l'opportunité"
        title="Supprimer"
      >
        <Trash2 size={16} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/30 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-950">Supprimer cette opportunité ?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cette action supprimera le calcul sauvegarde de votre tableau commercial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
