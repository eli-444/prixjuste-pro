'use client';

import Link from 'next/link';
import { Printer } from 'lucide-react';

export function OpportunityPrintActions() {
  return (
    <div className="print:hidden flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
      >
        <Printer size={16} />
        Imprimer
      </button>
      <Link
        href="/dashboard/opportunites"
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        Retourner sur le Dashboard
      </Link>
    </div>
  );
}
