'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CONSENT_STORAGE_KEY = 'tarifly_cookie_consent';

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const rejectedPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const acceptedPreferences: CookiePreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
};

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(rejectedPreferences);

  useEffect(() => {
    const consent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    setIsVisible(!consent);

    function openPreferences() {
      const savedConsent = window.localStorage.getItem(CONSENT_STORAGE_KEY);

      if (savedConsent) {
        try {
          setPreferences({ ...rejectedPreferences, ...JSON.parse(savedConsent), necessary: true });
        } catch {
          setPreferences(rejectedPreferences);
        }
      }

      setIsCustomizing(true);
      setIsVisible(true);
    }

    window.addEventListener('tarifly:open-cookie-preferences', openPreferences);

    return () => {
      window.removeEventListener('tarifly:open-cookie-preferences', openPreferences);
    };
  }, []);

  function saveConsent(value: CookiePreferences) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
    setIsVisible(false);
    setIsCustomizing(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="font-bold text-slate-950">Gestion des cookies</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tarifly utilise des cookies nécessaires au fonctionnement du service. Les cookies non essentiels ne sont
            utilisés qu’avec votre accord.
          </p>
          <Link href="/confidentialite" className="mt-2 inline-flex text-sm font-semibold text-brand-700 hover:underline">
            Politique de confidentialité et cookies
          </Link>

          {isCustomizing ? (
            <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <label className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="flex items-center gap-2 font-semibold text-slate-950">
                  <input type="checkbox" checked disabled className="h-4 w-4 rounded border-slate-300" />
                  Cookies nécessaires
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Connexion, sécurité et fonctionnement du service.
                </span>
              </label>
              <label className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="flex items-center gap-2 font-semibold text-slate-950">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Mesure d’audience
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Statistiques d’usage et amélioration du produit.
                </span>
              </label>
              <label className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2">
                <span className="flex items-center gap-2 font-semibold text-slate-950">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Cookies marketing
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Suivi marketing facultatif si ce type d’outil est activé.
                </span>
              </label>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => saveConsent(rejectedPreferences)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => (isCustomizing ? saveConsent(preferences) : setIsCustomizing(true))}
            className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
          >
            {isCustomizing ? 'Enregistrer' : 'Personnaliser'}
          </button>
          <button
            type="button"
            onClick={() => saveConsent(acceptedPreferences)}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

