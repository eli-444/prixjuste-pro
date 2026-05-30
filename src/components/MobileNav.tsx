'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function MobileNav({ isPremium, isSignedIn }: { isPremium: boolean; isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-950"
        aria-label="Ouvrir le menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open ? (
        <div className="absolute left-4 right-4 top-[88px] rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="grid gap-2 text-sm font-semibold text-slate-700">
            <Link href="/outil" className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Calculateur
            </Link>
            <Link href="/#tarifs" className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Tarifs
            </Link>
            <Link href="/opportunites" className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Opportunites
            </Link>
            <Link href={isSignedIn ? '/mon-compte' : '/connexion'} className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              {isSignedIn ? 'Mon compte' : 'Connexion'}
            </Link>
          </div>
          {isPremium ? (
            <div className="mt-3 rounded-xl bg-brand-50 px-3 py-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              Membre Premium
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
