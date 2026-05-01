import { useState } from 'react';
import { X, Camera, ImagePlus, Save, Loader2 } from 'lucide-react';
import { FieldLabel } from './ui/TextField';
import { PHOTO_CATEGORIES } from '../constants/scouting';

interface AddPhotoModalProps {
  onClose: () => void;
  onSubmit: (payload: { photo: string; category: string; notes: string }) => void;
  uploading: boolean;
}

// =========================================================
// COMPONENT — AddPhotoModal (modal sheet desde abajo)
// =========================================================
export default function AddPhotoModal({ onClose, onSubmit, uploading }: AddPhotoModalProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState('frontal');
  const [notes, setNotes] = useState('');

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt: any) => setPhoto(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!photo) return;
    onSubmit({ photo, category, notes });
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur z-[70] flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-neutral-900 border-t border-neutral-800 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-slide-up"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
          <h3 className="f-display text-2xl text-white">NUEVA FOTO</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          <div>
            <FieldLabel hint="requerido">Foto</FieldLabel>
            <label className="block relative cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <div className="aspect-square bg-neutral-950 border-2 border-dashed border-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden hover:border-lime-400 transition-colors">
                {photo ? (
                  <div className="relative w-full h-full">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 bg-neutral-950/80 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                      <Camera size={12} className="text-lime-400" />
                      <span className="f-mono text-[9px] text-white uppercase tracking-wider">Cambiar</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImagePlus size={28} className="text-neutral-500 mx-auto mb-2" />
                    <p className="f-body text-xs text-neutral-400">Toca para seleccionar</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div>
            <FieldLabel>Categoría / Ángulo</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {PHOTO_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`py-2.5 rounded-lg text-[11px] f-body font-semibold transition-all active:scale-95 ${
                    category === c.id
                      ? 'bg-lime-400 text-neutral-950 border border-lime-400'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel hint="opcional">Notas</FieldLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej. Antes de pretemporada..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 f-body text-sm text-white placeholder-neutral-600 focus:border-lime-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-neutral-800 bg-neutral-900 sticky bottom-0">
          <button
            onClick={handleSubmit}
            disabled={!photo || uploading}
            className="w-full bg-lime-400 text-neutral-950 rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            {uploading ? (
              <>
                <Loader2 size={18} strokeWidth={2.5} className="spin" />
                <span className="f-display text-lg tracking-wide">SUBIENDO...</span>
              </>
            ) : (
              <>
                <Save size={18} strokeWidth={2.5} />
                <span className="f-display text-lg tracking-wide">AÑADIR FOTO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}