'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';
import { showToast } from '@/lib/toast';

type AuthMode = 'login' | 'signup';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
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

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
  }

  function validateSignup() {
    const normalizedSiret = siret.replace(/\D/g, '');

    if (!firstName.trim() || !lastName.trim()) {
      return 'Renseignez votre prénom et votre nom.';
    }

    if (!companyName.trim() || !companyAddress.trim()) {
      return "Renseignez le nom et l'adresse de l'entreprise.";
    }

    if (normalizedSiret.length !== 14) {
      return 'Le SIRET doit contenir 14 chiffres.';
    }

    if (!emailPattern.test(email.trim())) {
      return 'Renseignez une adresse email valide.';
    }

    if (password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    if (password !== passwordConfirm) {
      return 'Les deux mots de passe ne correspondent pas.';
    }

    return '';
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      showToast("L'espace compte est momentanément indisponible. Merci de réessayer plus tard.", 'error');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === 'signup') {
        const validationError = validateSignup();

        if (validationError) {
          showToast(validationError, 'error');
          return;
        }

        const normalizedSiret = siret.replace(/\D/g, '');
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: callbackUrl,
            data: {
              account_type: 'business',
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: fullName,
              company_name: companyName.trim(),
              siret: normalizedSiret,
              company_address: companyAddress.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        showToast('Votre compte a été créé. Confirmez votre adresse email depuis le lien reçu dans votre boîte mail.', 'success');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

      if (error) {
        throw error;
      }

      window.location.href = redirectTo;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Une erreur est survenue.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <LogIn size={16} />
          Connexion
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
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
          <>
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <TextField label="Nom de l'entreprise" value={companyName} onChange={setCompanyName} required />
              <TextField label="Numéro de SIRET" value={siret} onChange={setSiret} inputMode="numeric" required />
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Adresse de l'entreprise</span>
                <textarea
                  value={companyAddress}
                  onChange={(event) => setCompanyAddress(event.target.value)}
                  rows={3}
                  required
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Prénom" value={firstName} onChange={setFirstName} required />
              <TextField label="Nom" value={lastName} onChange={setLastName} required />
            </div>
          </>
        ) : null}

        <TextField label="Email" type="email" value={email} onChange={setEmail} required />
        <TextField label="Mot de passe" type="password" value={password} onChange={setPassword} minLength={6} required />
        {mode === 'signup' ? (
          <TextField
            label="Confirmation du mot de passe"
            type="password"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            minLength={6}
            required
          />
        ) : null}
      </div>

      {mode === 'login' ? (
        <div className="mt-4 text-right">
          <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Mot de passe oublié ?
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Veuillez patienter...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
      </button>
    </form>
  );
}

function TextField({
  label,
  type = 'text',
  value,
  onChange,
  minLength,
  inputMode,
  required = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        minLength={minLength}
        inputMode={inputMode}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}
