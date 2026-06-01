'use client';

import { Trash2 } from 'lucide-react';

export function DeleteOpportunityButton() {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Supprimer cette opportunite ?")) {
          event.preventDefault();
        }
      }}
      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
      aria-label="Supprimer l'opportunite"
      title="Supprimer"
    >
      <Trash2 size={16} />
    </button>
  );
}
