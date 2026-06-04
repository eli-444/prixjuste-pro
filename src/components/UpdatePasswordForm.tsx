'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';
import { showToast } from '@/lib/toast';

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const { isConfigured } = getSupabaseConfig();

  useEffect(() => {
    if (!isConfigured) {
      setHasSession(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();

    async function prepareRecoverySession() {
      const code = new URLSearchParams(window.location.search).get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          showToast('Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.', 'error');
          setHasSession(false);
          return;
        }

        window.history.replaceState({}, '', '/modifier-mot-de-passe');
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(Boolean(user));
    }

    prepareRecoverySession();
  }, [isConfigured]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 6) {
      showToast('Le mot de passe doit contenir au moins 6 caractères.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Les deux mots de passe ne correspondent pas.', 'error');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setPassword('');
      setConfirmPassword('');
      showToast('Votre mot de passe a bien été modifié. Redirection vers la connexion...', 'success');
      await supabase.auth.signOut();
      window.location.href = '/connexion';
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Une erreur est survenue.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (hasSession === false) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Lien invalide ou expiré</h2>
        <p className="mt-4 leading-7 text-slate-600">
          Demandez un nouveau lien de réinitialisation pour modifier votre mot de passe.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Recevoir un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <KeyRound size={22} />
      </div>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Nouveau mot de passe</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            placeholder="6 caractères minimum"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Confirmer le mot de passe</span>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            placeholder="Répétez le mot de passe"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || hasSession === null}
        className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Modification...' : 'Modifier le mot de passe'}
      </button>
    </form>
  );
}

