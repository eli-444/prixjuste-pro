'use client';

import { useEffect, useState } from 'react';
import type { ToastPayload, ToastVariant } from '@/lib/toast';

type ToastItem = Required<ToastPayload> & {
  id: number;
};

const toastDuration = 3000;

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      const id = Date.now() + Math.random();
      const nextToast: ToastItem = {
        id,
        message: detail.message,
        variant: detail.variant ?? 'info',
      };

      setToasts((current) => [...current, nextToast]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, toastDuration);
    }

    window.addEventListener('tarifly:toast', handleToast);

    return () => {
      window.removeEventListener('tarifly:toast', handleToast);
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[70] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: ToastItem }) {
  return (
    <div
      className={`toast-slide-in overflow-hidden rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur ${getToastClass(
        toast.variant,
      )}`}
    >
      <p className="pr-2 leading-6">{toast.message}</p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/25">
        <div className="toast-cooldown h-full rounded-full bg-white" />
      </div>
    </div>
  );
}

function getToastClass(variant: ToastVariant) {
  if (variant === 'success') {
    return 'border-emerald-400/30 bg-emerald-600 text-white';
  }

  if (variant === 'error') {
    return 'border-rose-400/30 bg-rose-600 text-white';
  }

  return 'border-brand-400/30 bg-slate-950 text-white';
}
