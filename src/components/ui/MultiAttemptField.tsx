import { Award } from 'lucide-react';
import { FieldLabel } from './TextField';

interface MultiAttemptFieldProps {
  label: string;
  hint?: string;
  attempts: string[];
  onChange: (next: string[]) => void;
  suffix?: string;
  lowerIsBetter?: boolean;
}

// =========================================================
// COMPONENT — MultiAttemptField (varias entradas + best)
// =========================================================
export default function MultiAttemptField({
  label, hint, attempts, onChange, suffix, lowerIsBetter = false,
}: MultiAttemptFieldProps) {
  const numericVals = attempts.map((a) => parseFloat(a)).filter((v) => !isNaN(v));
  const best =
    numericVals.length > 0
      ? lowerIsBetter ? Math.min(...numericVals) : Math.max(...numericVals)
      : null;

  const handleChange = (i: number, val: string) => {
    const next = [...attempts];
    next[i] = val;
    onChange(next);
  };

  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {attempts.map((val, i) => (
          <div key={i} className="relative">
            <span className="absolute -top-1.5 left-3 z-10 bg-neutral-950 px-1.5 f-mono text-[9px] text-neutral-500 uppercase tracking-wider">
              Int. {i + 1}
            </span>
            <input
              type="number"
              step="0.01"
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder="0"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3.5 f-body text-white placeholder-neutral-600 focus:border-lime-400 focus:outline-none transition-colors"
            />
            {suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 f-mono text-[10px] text-neutral-500 pointer-events-none">
                {suffix}
              </span>
            )}
          </div>
        ))}
      </div>
      {best !== null && (
        <div className="mt-2 flex items-center gap-1.5">
          <Award size={11} className="text-lime-400" strokeWidth={2.5} />
          <span className="f-mono text-[10px] tracking-widest uppercase text-lime-400">
            Mejor registro: {best}{suffix ? ` ${suffix}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}