import { X, Trash2 } from 'lucide-react';
import { labelOfCategory } from '../constants/scouting';
import type { MeasurementPhoto } from '../types';

interface LightboxProps {
  photo: MeasurementPhoto | null;
  onClose: () => void;
  onDelete: () => void;
}

// =========================================================
// COMPONENT — Lightbox (visualizador a pantalla completa)
// =========================================================
export default function Lightbox({ photo, onClose, onDelete }: LightboxProps) {
  if (!photo) return null;
  const formattedDate = photo.uploadedAt
    ? new Date(photo.uploadedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="fixed inset-0 bg-neutral-950 z-[80] flex flex-col" onClick={onClose}>
      <div className="flex-shrink-0 px-5 pt-6 pb-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
          <X size={18} />
        </button>
        <button
          onClick={() => {
            if (confirm('¿Borrar esta foto?')) onDelete();
          }}
          className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-5">
        <img
          src={photo.url}
          alt={photo.category}
          className="max-w-full max-h-full object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="flex-shrink-0 px-5 py-5 border-t border-neutral-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-lime-400 text-neutral-950 f-display text-xs px-2.5 py-1 rounded-full tracking-widest">
            {labelOfCategory(photo.category)}
          </span>
          <span className="f-mono text-[10px] text-neutral-500">{formattedDate}</span>
        </div>
        {photo.notes && <p className="f-body text-sm text-neutral-300 mt-2">{photo.notes}</p>}
      </div>
    </div>
  );
}