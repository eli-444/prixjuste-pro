'use client';

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('tarifly:open-cookie-preferences'))}
      className="text-left hover:text-slate-950"
    >
      Préférences cookies
    </button>
  );
}
