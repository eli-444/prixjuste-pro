'use client';

import { useMemo, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';
import { showToast } from '@/lib/toast';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { isConfigured } = getSupabaseConfig();

  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    return `${appUrl}/modifier-mot-de-passe`;
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      showToast("L'espace compte est momentanément indisponible. Merci de réessayer plus tard.", 'error');
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

      showToast("Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.", 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Une erreur est survenue.', 'error');
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

