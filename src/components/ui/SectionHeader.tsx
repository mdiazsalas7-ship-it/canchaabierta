import type { ReactNode } from 'react';

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  step: number;
  total: number;
}

// =========================================================
// COMPONENT — SectionHeader (cabecera de cada paso del form)
// =========================================================
export default function SectionHeader({ icon, title, subtitle, step, total }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-lime-400 text-neutral-950 flex items-center justify-center">
          {icon}
        </div>
        <span className="f-mono text-[10px] text-neutral-500 tracking-widest">
          PASO {step} / {total}
        </span>
      </div>
      <h2 className="f-display text-3xl text-white leading-tight">{title}</h2>
      <p className="f-body text-sm text-neutral-500 mt-1">{subtitle}</p>
    </div>
  );
}