'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

type AccountType = 'personal' | 'business';

type AccountValues = {
  firstName: string;
  lastName: string;
  companyName: string;
  siret: string;
  companyAddress: string;
};

export function CompanyAccountForm({
  userId,
  accountType,
  initialValues,
}: {
  userId: string;
  accountType: AccountType;
  initialValues: AccountValues;
}) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isBusiness = accountType === 'business';

  function updateField(name: keyof AccountValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setStatus('');
    setError('');
  }

  function validate() {
    if (!values.firstName.trim() || !values.lastName.trim()) {
      return 'Renseignez votre prenom et votre nom.';
    }

    if (isBusiness) {
      const normalizedSiret = values.siret.replace(/\D/g, '');

      if (!values.companyName.trim() || !values.companyAddress.trim()) {
        return "Renseignez le nom et l'adresse de l'entreprise.";
      }

      if (normalizedSiret.length !== 14) {
        return 'Le SIRET doit contenir 14 chiffres.';
      }
    }

    return '';
  }

  async function save() {
    setIsSaving(true);
    setStatus('');
    setError('');

    try {
      const validationError = validate();

      if (validationError) {
        setError(validationError);
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();
      const normalizedSiret = values.siret.replace(/\D/g, '');
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          company_name: isBusiness ? values.companyName.trim() : null,
          siret: isBusiness ? normalizedSiret : null,
          company_address: isBusiness ? values.companyAddress.trim() : null,
          onboarding_completed: true,
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setValues((current) => ({ ...current, siret: isBusiness ? normalizedSiret : '' }));
      setStatus('Informations enregistrees.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Enregistrement impossible.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
        {isBusiness ? 'Compte entreprise' : 'Compte personnel'}
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Prenom" value={values.firstName} onChange={(value) => updateField('firstName', value)} />
          <TextField label="Nom" value={values.lastName} onChange={(value) => updateField('lastName', value)} />
        </div>

        {isBusiness ? (
          <>
            <TextField label="Nom de l'entreprise" value={values.companyName} onChange={(value) => updateField('companyName', value)} />
            <TextField label="Numero de SIRET" value={values.siret} onChange={(value) => updateField('siret', value)} inputMode="numeric" />
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-950">Adresse de l'entreprise</span>
              <textarea
                value={values.companyAddress}
                onChange={(event) => updateField('companyAddress', event.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          </>
        ) : null}
      </div>

      {status ? <p className="mt-4 rounded-xl bg-aqua-50 px-4 py-3 text-sm font-semibold text-aqua-600">{status}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}

      <button
        type="button"
        onClick={save}
        disabled={isSaving}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save size={16} />
        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-950">{label}</span>
      <input
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}
