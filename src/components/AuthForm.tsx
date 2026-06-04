'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, LogIn, User, UserPlus } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';
import { showToast } from '@/lib/toast';

type AuthMode = 'login' | 'signup';
type AccountType = 'personal' | 'business';
type SignupStep = 'type' | 'details';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('type');
  const [accountType, setAccountType] = useState<AccountType>('personal');
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
    if (nextMode === 'signup') {
      setSignupStep('type');
    }
  }

  function validateSignup() {
    const normalizedSiret = siret.replace(/\D/g, '');

    if (!firstName.trim() || !lastName.trim()) {
      return 'Renseignez votre prénom et votre nom.';
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

    if (accountType === 'business') {
      if (!companyName.trim() || !companyAddress.trim()) {
        return "Renseignez le nom et l'adresse de l'entreprise.";
      }

      if (normalizedSiret.length !== 14) {
        return 'Le SIRET doit contenir 14 chiffres.';
      }
    }

    return '';
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      showToast("L'espace compte est momentanément indisponible. Merci de réessayer plus tard.", 'error');
      return;
    }

    if (mode === 'signup' && signupStep === 'type') {
      setSignupStep('details');
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
              account_type: accountType,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: fullName,
              company_name: accountType === 'business' ? companyName.trim() : null,
              siret: accountType === 'business' ? normalizedSiret : null,
              company_address: accountType === 'business' ? companyAddress.trim() : null,
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

      {mode === 'signup' ? (
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          <span className={signupStep === 'type' ? 'text-brand-600' : 'text-slate-950'}>1. Type</span>
          <span className={signupStep === 'details' ? 'text-brand-600' : 'text-slate-400'}>2. Informations</span>
        </div>
      ) : null}

      {mode === 'signup' && signupStep === 'type' ? (
        <div className="mt-6 grid gap-3">
          <AccountTypeButton
            active={accountType === 'personal'}
            icon={<User size={18} />}
            title="Compte à usage personnel"
            onClick={() => setAccountType('personal')}
          />
          <AccountTypeButton
            active={accountType === 'business'}
            icon={<Building2 size={18} />}
            title="Compte entreprise"
            onClick={() => setAccountType('business')}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {mode === 'signup' && accountType === 'business' ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <TextField label="Nom de l'entreprise" value={companyName} onChange={setCompanyName} />
              <TextField label="Numéro de SIRET" value={siret} onChange={setSiret} inputMode="numeric" />
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Adresse de l'entreprise</span>
                <textarea
                  value={companyAddress}
                  onChange={(event) => setCompanyAddress(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </label>
            </div>
          ) : null}

          {mode === 'signup' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Prénom" value={firstName} onChange={setFirstName} />
              <TextField label="Nom" value={lastName} onChange={setLastName} />
            </div>
          ) : null}

          <TextField label="Email" type="email" value={email} onChange={setEmail} />
          <TextField label="Mot de passe" type="password" value={password} onChange={setPassword} minLength={6} />
          {mode === 'signup' ? (
            <TextField label="Confirmation du mot de passe" type="password" value={passwordConfirm} onChange={setPasswordConfirm} minLength={6} />
          ) : null}
        </div>
      )}

      {mode === 'login' ? (
        <div className="mt-4 text-right">
          <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Mot de passe oublié ?
          </Link>
        </div>
      ) : null}

      <div className="mt-6 flex gap-3">
        {mode === 'signup' && signupStep === 'details' ? (
          <button
            type="button"
            onClick={() => {
              setSignupStep('type');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Veuillez patienter...' : getSubmitLabel(mode, signupStep)}
        </button>
      </div>
    </form>
  );
}

function AccountTypeButton({
  active,
  icon,
  title,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
        active ? 'border-brand-500 bg-brand-50 text-slate-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-white text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
        {icon}
      </span>
      <span className="font-bold">{title}</span>
    </button>
  );
}

function TextField({
  label,
  type = 'text',
  value,
  onChange,
  minLength,
  inputMode,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        minLength={minLength}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function getSubmitLabel(mode: AuthMode, signupStep: SignupStep) {
  if (mode === 'login') {
    return 'Se connecter';
  }

  return signupStep === 'type' ? 'Continuer' : 'Créer mon compte';
}

