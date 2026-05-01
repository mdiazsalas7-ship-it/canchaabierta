import type { ReactNode } from 'react';

// =========================================================
// COMPONENT — Inputs reutilizables
// =========================================================

interface FieldLabelProps {
  children: ReactNode;
  hint?: string;
}

export function FieldLabel({ children, hint }: FieldLabelProps) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <label className="f-body text-xs font-semibold text-neutral-300 uppercase tracking-wider">{children}</label>
      {hint && <span className="f-mono text-[10px] text-neutral-600">{hint}</span>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  hint?: string;
  value: any;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
}

export function TextField({ label, hint, value, onChange, type = 'text', placeholder, suffix }: TextFieldProps) {
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3.5 f-body text-white placeholder-neutral-600 focus:border-lime-400 focus:outline-none transition-colors"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 f-mono text-xs text-neutral-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Selector genérico de píldoras (chips). Útil para Posición / Sexo / Categoría.
interface PillSelectorProps {
  label: string;
  hint?: string;
  options: { id: string; label: string; short?: string }[];
  value: string;
  onChange: (id: string) => void;
  cols?: number;
  useShort?: boolean;
}

export function PillSelector({ label, hint, options, value, onChange, cols = 3, useShort = false }: PillSelectorProps) {
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`py-2.5 rounded-lg text-xs f-body font-semibold transition-all active:scale-95 ${
              value === o.id
                ? 'bg-lime-400 text-neutral-950 border border-lime-400'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}
          >
            {useShort && o.short ? o.short : o.label}
          </button>
        ))}
      </div>
    </div>
  );
}