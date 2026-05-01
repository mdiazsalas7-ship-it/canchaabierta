import { ChevronRight } from 'lucide-react';
import { getScoreTier } from '../lib/helpers';
import { labelOfBasketCategory } from '../constants/scouting';
import type { Prospect } from '../types';

interface ProspectCardProps {
  prospect: Prospect;
  index: number;
  onClick: () => void;
}

// =========================================================
// COMPONENT — ProspectCard (tarjeta clickable en dashboard)
// =========================================================
export default function ProspectCard({ prospect, index, onClick }: ProspectCardProps) {
  const tier = getScoreTier(prospect.score);
  const categoryLabel = prospect.basketCategory ? labelOfBasketCategory(prospect.basketCategory) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative bg-neutral-900 border border-neutral-800 rounded-2xl p-4 active:scale-[0.98] transition-transform animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${tier.bar}`}></div>

      <div className="flex items-start gap-4 pl-2">
        <div className="relative flex-shrink-0">
          {prospect.photoURL ? (
            <img src={prospect.photoURL} alt={prospect.name} className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center f-display text-2xl text-white">
              {prospect.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${tier.dot} ring-2 ring-neutral-900`}></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="f-body font-bold text-white text-base truncate leading-tight">{prospect.name}</h3>
              <p className="f-body text-xs text-neutral-500 truncate mt-0.5">{prospect.club}</p>
            </div>
            <ChevronRight className="text-neutral-600 flex-shrink-0 mt-1" size={18} />
          </div>

          <div className="flex items-center gap-2 mt-3 f-body text-xs text-neutral-400 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
              {prospect.position}
            </span>
            {categoryLabel && (
              <span className="inline-flex items-center gap-1 bg-neutral-800 px-1.5 py-0.5 rounded f-mono text-[10px] text-lime-400">
                {prospect.basketCategory.toUpperCase()}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
              {prospect.age} años
            </span>
            <span className="inline-flex items-center gap-1 f-mono">
              <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
              {prospect.height}m
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between pl-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${tier.dot}`}></span>
          <span className={`f-display text-xs tracking-widest ${tier.text}`}>{tier.label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`f-display text-3xl leading-none ${tier.text}`}>{prospect.score}</span>
          <span className="f-mono text-[10px] text-neutral-600">/100</span>
        </div>
      </div>
    </button>
  );
}

// Skeleton de carga (export adicional)
export function CardSkeleton() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl skeleton"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded skeleton"></div>
          <div className="h-3 w-1/2 rounded skeleton"></div>
          <div className="h-3 w-3/4 rounded skeleton mt-3"></div>
        </div>
      </div>
    </div>
  );
}