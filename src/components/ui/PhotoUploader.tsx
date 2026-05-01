import { Camera } from 'lucide-react';
import { FieldLabel } from './TextField';

interface PhotoUploaderProps {
  value: string | null;
  onChange: (base64: string) => void;
}

// =========================================================
// COMPONENT — PhotoUploader (preview en base64)
// =========================================================
export default function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt: any) => onChange(evt.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <FieldLabel hint="opcional">Foto Principal</FieldLabel>
      <label className="block relative cursor-pointer">
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="aspect-[4/3] bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden hover:border-lime-400 transition-colors">
          {value ? (
            <div className="relative w-full h-full">
              <img src={value} alt="Prospecto" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-neutral-950/80 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Camera size={12} className="text-lime-400" />
                <span className="f-mono text-[9px] text-white uppercase tracking-wider">Cambiar</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                <Camera size={22} className="text-neutral-400" />
              </div>
              <p className="f-body text-xs text-neutral-400">Toca para subir foto</p>
              <p className="f-mono text-[9px] text-neutral-600 mt-1 tracking-wider">JPG / PNG · MAX 5MB</p>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}