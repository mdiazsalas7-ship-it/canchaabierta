import { Check, AlertCircle } from 'lucide-react';
import type { ToastState } from '../../types';

interface ToastProps {
  toast: ToastState | null;
}

// =========================================================
// COMPONENT — Toast (success / error)
// =========================================================
export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;
  const isError = toast.type === 'error';

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] rounded-full px-5 py-3 flex items-center gap-2 shadow-2xl animate-slide-up f-body font-semibold text-sm ${
        isError ? 'bg-red-500 text-white' : 'bg-lime-400 text-neutral-950'
      }`}
    >
      {isError ? <AlertCircle size={16} strokeWidth={2.5} /> : <Check size={16} strokeWidth={3} />}
      {toast.message}
    </div>
  );
}