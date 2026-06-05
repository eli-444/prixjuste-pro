'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';

export type ClientPortfolioItem = {
  id?: string;
  name: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  total: number;
  count: number;
  accepted: number;
};

export type ClientFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

type Props = {
  clients: ClientPortfolioItem[];
  totalValue: number;
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
};

const initialState: ClientFormState = {
  status: 'idle',
  message: '',
};

export function ClientPortfolioPanel({ clients, totalValue, action }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== 'success') {
      return;
    }

    formRef.current?.reset();
    setIsOpen(false);
  }, [state.status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-500">
          {clients.length} client{clients.length > 1 ? 's' : ''} dans le portefeuille
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Ajouter un client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="grid min-h-40 place-items-center rounded-2xl bg-slate-50 p-6 text-sm font-semibold text-slate-500">
          Aucun client renseigné pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const width = totalValue > 0 ? Math.max(7, (client.total / totalValue) * 100) : client.count > 0 ? 12 : 0;

            return (
              <div key={`${client.id ?? client.name}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{client.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {client.email || client.phone || client.address || 'Informations client à compléter'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-black text-slate-700">{formatCurrency(client.total)}</span>
                    {client.id ? (
                      <Link
                        href={`/outil?client=${client.id}`}
                        className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-black text-brand-700 transition hover:border-brand-200 hover:bg-brand-100"
                      >
                        Nouveau calcul
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#0878f2,#11cfc2)]" style={{ width: `${width}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {client.count} dossier{client.count > 1 ? 's' : ''} · {client.accepted} accepté
                  {client.accepted > 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">Ajouter un client</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Nom du client
                <input
                  name="name"
                  required
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  placeholder="Ex : Studio Martin"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Adresse
                <textarea
                  name="address"
                  rows={3}
                  className="resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  placeholder="Adresse complète du client"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-800">
                  Email
                  <input
                    name="email"
                    type="email"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                    placeholder="client@email.fr"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-800">
                  Téléphone
                  <input
                    name="phone"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                    placeholder="06 00 00 00 00"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Notes internes
                <textarea
                  name="notes"
                  rows={3}
                  className="resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  placeholder="Contexte, contact principal, préférence de suivi..."
                />
              </label>

              {state.status === 'error' ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{state.message}</p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? 'Enregistrement...' : 'Enregistrer le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
