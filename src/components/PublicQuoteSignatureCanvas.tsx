'use client';

import { useEffect, useRef, useState } from 'react';

export const quoteSignatureEventName = 'tarifly:quote-signature';

export function getQuoteSignatureStorageKey(token: string) {
  return `tarifly_quote_signature_${token}`;
}

export function PublicQuoteSignatureCanvas({ token, disabled }: { token: string; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.scale(scale, scale);
    context.lineWidth = 2.4;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#07122f';
  }, []);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function persistSignature() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const signature = canvas.toDataURL('image/png');
    window.sessionStorage.setItem(getQuoteSignatureStorageKey(token), signature);
    window.dispatchEvent(new CustomEvent(quoteSignatureEventName, { detail: { token, signature } }));
    setHasSignature(true);
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!context) {
      return;
    }

    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || disabled) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!context) {
      return;
    }

    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);
    persistSignature();
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    window.sessionStorage.removeItem(getQuoteSignatureStorageKey(token));
    window.dispatchEvent(new CustomEvent(quoteSignatureEventName, { detail: { token, signature: '' } }));
    setHasSignature(false);
  }

  return (
    <div className="print:break-inside-avoid">
      <canvas
        ref={canvasRef}
        aria-label="Zone de signature électronique"
        className="h-28 w-full touch-none rounded-xl border border-slate-300 bg-white"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      {!disabled ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs print:hidden">
          <span className={hasSignature ? 'font-semibold text-emerald-700' : 'text-slate-500'}>
            {hasSignature ? 'Signature enregistrée.' : 'Signez dans la zone ci-dessus.'}
          </span>
          <button type="button" onClick={clearSignature} className="font-bold text-slate-500 transition hover:text-slate-950">
            Effacer
          </button>
        </div>
      ) : null}
    </div>
  );
}
