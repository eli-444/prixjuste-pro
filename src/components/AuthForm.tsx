'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';

type AuthMode = 'login' | 'signup';

export function AuthForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { isConfigured } = getSupabaseConfig();
  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const nextUrl = mode === 'signup' ? '/auth/verifie' : redirectTo;

    return `${appUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`;
  }, [mode, redirectTo]);

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
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: callbackUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          throw error;
        }

        setMessage('Compte cree. Ouvrez le lien recu par email pour verifier votre compte.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

      if (error) {
        throw error;
      }

      window.location.href = redirectTo;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <LogIn size={16} />
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <UserPlus size={16} />
          Inscription
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {mode === 'signup' ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Nom complet</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Votre nom"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            placeholder="vous@exemple.fr"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Mot de passe</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            placeholder="6 caracteres minimum"
          />
        </label>
      </div>

      {message ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}

      {mode === 'login' ? (
        <div className="mt-4 text-right">
          <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Mot de passe oublie ?
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Veuillez patienter...' : mode === 'login' ? 'Se connecter' : 'Creer mon compte'}
      </button>
    </form>
  );
}
