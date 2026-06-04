'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { getQuoteSignatureStorageKey, quoteSignatureEventName } from '@/components/PublicQuoteSignatureCanvas';
import { showToast } from '@/lib/toast';

export function PublicQuoteActions({
  token,
  status,
  isExpired,
}: {
  token: string;
  status: string;
  isExpired: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isRefusalOpen, setIsRefusalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isAccepted = status === 'accepted';
  const isRefused = status === 'refused';
  const isLocked = isAccepted || isRefused || isExpired || status === 'expired';

  useEffect(() => {
    setSignature(window.sessionStorage.getItem(getQuoteSignatureStorageKey(token)) ?? '');

    function handleSignature(event: Event) {
      const customEvent = event as CustomEvent<{ token: string; signature: string }>;

      if (customEvent.detail?.token === token) {
        setSignature(customEvent.detail.signature);
      }
    }

    window.addEventListener(quoteSignatureEventName, handleSignature);

    return () => window.removeEventListener(quoteSignatureEventName, handleSignature);
  }, [token]);

  async function acceptQuote() {
    if (!signature) {
      showToast('Signez le devis dans la case de signature avant de l’accepter.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/quotes/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, signature, message }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Acceptation impossible pour le moment.');
      }

      showToast('Devis signé et accepté. Merci, votre réponse a bien été enregistrée.', 'success');
      window.location.reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Acceptation impossible pour le moment.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function refuseQuote() {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/quotes/${token}/refuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Refus impossible pour le moment.');
      }

      showToast('Refus enregistré. Merci, votre réponse a bien été transmise.', 'success');
      window.location.reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Refus impossible pour le moment.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="print:hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-50"
          >
            <Download size={16} />
            Télécharger PDF
          </button>
          <button
            type="button"
            onClick={acceptQuote}
            disabled={isLocked || isSaving}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isAccepted ? 'Devis accepté' : isSaving ? 'Enregistrement...' : 'Accepter'}
          </button>
          <button
            type="button"
            onClick={() => setIsRefusalOpen(true)}
            disabled={isLocked || isSaving}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isRefused ? 'Devis refusé' : 'Refuser'}
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Ce devis vous a été envoyé via l’application Tarifly.{' '}
          <Link href="/" className="font-black text-brand-600 hover:text-brand-700">
            En savoir plus sur nous
          </Link>
        </p>
      </div>

      {isExpired || status === 'expired' ? (
        <p className="print:hidden mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Ce devis n'est plus dans sa période de validité.
        </p>
      ) : null}

      {isRefusalOpen ? (
        <DecisionModal
          title="Refuser le devis"
          submitLabel={isSaving ? 'Enregistrement...' : 'Confirmer le refus'}
          disabled={isSaving}
          onClose={() => setIsRefusalOpen(false)}
          onSubmit={refuseQuote}
        >
          <ClientFields name={name} email={email} message={message} onName={setName} onEmail={setEmail} onMessage={setMessage} />
        </DecisionModal>
      ) : null}
    </>
  );
}

function ClientFields({
  name,
  email,
  message,
  onName,
  onEmail,
  onMessage,
}: {
  name: string;
  email: string;
  message: string;
  onName: (value: string) => void;
  onEmail: (value: string) => void;
  onMessage: (value: string) => void;
}) {
  return (
    <>
      <input
        value={name}
        onChange={(event) => onName(event.target.value)}
        placeholder="Votre nom"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
      <input
        value={email}
        onChange={(event) => onEmail(event.target.value)}
        placeholder="Votre email"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
      <textarea
        value={message}
        onChange={(event) => onMessage(event.target.value)}
        placeholder="Message optionnel"
        rows={3}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
    </>
  );
}

function DecisionModal({
  title,
  submitLabel,
  disabled,
  children,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  disabled: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <div className="mt-5 grid gap-3">{children}</div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
