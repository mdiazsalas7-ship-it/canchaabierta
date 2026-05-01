interface RatingScaleProps {
    value: number;
    onChange: (n: number) => void;
    labels?: string[];
  }
  
  // =========================================================
  // COMPONENT — RatingScale (1 a 5)
  // =========================================================
  export default function RatingScale({
    value,
    onChange,
    labels = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Élite'],
  }: RatingScaleProps) {
    return (
      <div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex-1 h-12 rounded-lg border f-display text-xl transition-all active:scale-95 ${
                value >= n
                  ? 'bg-lime-400 border-lime-400 text-neutral-950'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-0.5">
          <span className="f-mono text-[9px] text-neutral-600 uppercase tracking-wider">{labels[0]}</span>
          <span className="f-mono text-[9px] text-lime-400 uppercase tracking-wider">
            {value > 0 ? labels[value - 1] : '—'}
          </span>
          <span className="f-mono text-[9px] text-neutral-600 uppercase tracking-wider">{labels[4]}</span>
        </div>
      </div>
    );
  }