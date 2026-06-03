export type ToastVariant = 'success' | 'error' | 'info';

export type ToastPayload = {
  message: string;
  variant?: ToastVariant;
};

export function showToast(message: string, variant: ToastVariant = 'info') {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ToastPayload>('tarifly:toast', {
      detail: {
        message,
        variant,
      },
    }),
  );
}
