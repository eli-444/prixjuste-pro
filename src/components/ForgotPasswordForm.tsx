'use client';

import { useMemo, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { isConfigured } = getSupabaseConfig();

  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    return `${appUrl}/auth/callback?next=${encodeURIComponent('/modifier-mot-de-passe')}`;
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!isConfigured) {
      setMessage("L'espace compte est momentanement indisponible. Merci de reessayer plus tard.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: callbackUrl,
      });

      if (error) {
        throw error;
      }

      setMessage('Si un compte existe avec cet email, un lien de reinitialisation vient d etre envoye.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <MailCheck size={22} />
      </div>

      <label className="mt-6 block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Email du compte</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          placeholder="vous@exemple.fr"
        />
      </label>

      {message ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Envoi en cours...' : 'Recevoir le lien'}
      </button>
    </form>
  );
}
