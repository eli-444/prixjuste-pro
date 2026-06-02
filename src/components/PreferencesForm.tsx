'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { franceRegions, type Profession } from '@/lib/market';

type PreferencesFormState = {
  fullName: string;
  activityType: 'service' | 'product' | 'mixed';
  professionSlug: string;
  region: string;
  city: string;
  defaultTaxPercent: string;
  defaultHourlyRate: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
};

export function PreferencesForm({
  userId,
  professions,
  initialValues,
}: {
  userId: string;
  professions: Profession[];
  initialValues: PreferencesFormState;
}) {
  const [form, setForm] = useState<PreferencesFormState>(initialValues);
  const [status, setStatus] = useState('');

  function updateField<K extends keyof PreferencesFormState>(name: K, value: PreferencesFormState[K]) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function savePreferences() {
    setStatus('');

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.fullName || null,
          activity_type: form.activityType,
          profession_slug: form.professionSlug || null,
          region: form.region || null,
          city: form.city || null,
          default_tax_percent: form.defaultTaxPercent === '' ? 0 : Number(form.defaultTaxPercent),
          default_hourly_rate: form.defaultHourlyRate === '' ? 0 : Number(form.defaultHourlyRate),
          company_name: form.companyName || null,
          company_address: form.companyAddress || null,
          company_email: form.companyEmail || null,
          company_phone: form.companyPhone || null,
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setStatus('Preferences enregistrees.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Enregistrement impossible pour le moment.');
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Preferences</h2>
          <p className="mt-2 text-sm text-slate-500">Ces informations pre-remplissent l'outil et les devis.</p>
        </div>
        <button
          type="button"
          onClick={savePreferences}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Enregistrer
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TextInput label="Nom / societe" value={form.fullName} onChange={(value) => updateField('fullName', value)} />
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Type d'activite</span>
          <select
            value={form.activityType}
            onChange={(event) => updateField('activityType', event.target.value as PreferencesFormState['activityType'])}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="service">Service</option>
            <option value="product">Produit</option>
            <option value="mixed">Mixte</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Metier principal</span>
          <select
            value={form.professionSlug}
            onChange={(event) => updateField('professionSlug', event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="">Selectionner</option>
            {professions.map((profession) => (
              <option key={profession.slug} value={profession.slug}>
                {profession.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Region</span>
          <select
            value={form.region}
            onChange={(event) => updateField('region', event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="">Selectionner</option>
            {franceRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
        <TextInput label="Ville" value={form.city} onChange={(value) => updateField('city', value)} />
        <NumberInput label="TVA par defaut (%)" value={form.defaultTaxPercent} onChange={(value) => updateField('defaultTaxPercent', value)} />
        <NumberInput label="Tarif horaire habituel (EUR)" value={form.defaultHourlyRate} onChange={(value) => updateField('defaultHourlyRate', value)} />
        <TextInput label="Nom entreprise devis" value={form.companyName} onChange={(value) => updateField('companyName', value)} />
        <TextArea label="Adresse entreprise devis" value={form.companyAddress} onChange={(value) => updateField('companyAddress', value)} />
        <TextInput label="Email entreprise devis" value={form.companyEmail} onChange={(value) => updateField('companyEmail', value)} />
        <TextInput label="Telephone entreprise devis" value={form.companyPhone} onChange={(value) => updateField('companyPhone', value)} />
      </div>

      {status ? <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{status}</p> : null}
    </section>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
    </label>
  );
}
