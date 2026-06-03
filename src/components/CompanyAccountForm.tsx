'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

type CompanyAccountValues = {
  companyName: string;
  siret: string;
  companyAddress: string;
};

export function CompanyAccountForm({
  userId,
  initialValues,
}: {
  userId: string;
  initialValues: CompanyAccountValues;
}) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updateField(name: keyof CompanyAccountValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setStatus('');
    setError('');
  }

  async function save() {
    setIsSaving(true);
    setStatus('');
    setError('');

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: values.companyName.trim() || null,
          siret: values.siret.trim() || null,
          company_address: values.companyAddress.trim() || null,
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setStatus('Informations enregistrées.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Enregistrement impossible.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4">
        <TextField
          label="Nom de l'entreprise"
          value={values.companyName}
          onChange={(value) => updateField('companyName', value)}
        />
        <TextField
          label="Numero de SIRET"
          value={values.siret}
          onChange={(value) => updateField('siret', value)}
        />
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-950">Adresse de l'entreprise</span>
          <textarea
            value={values.companyAddress}
            onChange={(event) => updateField('companyAddress', event.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-950">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}
