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
            <Link href="/#fonctionnement" className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Méthode
            </Link>
            <Link href="/#cibles" className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Pour qui ?
            </Link>
            <Link href={isSignedIn ? '/outil' : '/connexion?redirect=/outil'} className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Nouveau calcul
            </Link>
            <Link href="/#tarifs" className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Tarifs
            </Link>
            <Link href={isSignedIn ? '/dashboard' : '/connexion'} className="rounded-xl px-3 py-3 hover:bg-slate-100" onClick={() => setOpen(false)}>
              {isSignedIn ? 'Dashboard' : 'Connexion'}
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
