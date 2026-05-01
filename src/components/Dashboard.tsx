import { useState } from 'react';
import { Plus, Search, Users, Award, TrendingUp } from 'lucide-react';
import ProspectCard, { CardSkeleton } from './ProspectCard';
import Logo from './ui/Logo';
import type { Prospect } from '../types';

interface DashboardProps {
  prospects: Prospect[];
  loading: boolean;
  onAddNew: () => void;
  onSelect: (p: Prospect) => void;
}

interface StatBlockProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}

function StatBlock({ label, value, icon, accent }: StatBlockProps) {
  return (
    <div className={`rounded-xl p-3 border ${accent ? 'bg-lime-400 border-lime-400 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'}`}>
      <div className={`flex items-center gap-1 mb-1.5 ${accent ? 'text-neutral-950' : 'text-neutral-500'}`}>
        {icon}
        <span className="f-mono text-[9px] tracking-widest uppercase">{label}</span>
      </div>
      <div className="f-display text-3xl leading-none">{value}</div>
    </div>
  );
}

// =========================================================
// COMPONENT — Dashboard (vista principal)
// =========================================================
export default function Dashboard({ prospects, loading, onAddNew, onSelect }: DashboardProps) {
  const [filter, setFilter] = useState('all');

  const filtered = prospects.filter((p) => {
    if (filter === 'high') return p.score >= 80;
    if (filter === 'medium') return p.score >= 65 && p.score < 80;
    return true;
  });

  const stats = {
    total: prospects.length,
    high: prospects.filter((p) => p.score >= 80).length,
    avg: prospects.length > 0
      ? Math.round(prospects.reduce((a, b) => a + b.score, 0) / prospects.length)
      : 0,
  };

  return (
    <div className="min-h-full pb-32">
      {/* Header con logo */}
      <header className="px-5 pt-8 pb-6">
        <div className="flex items-center justify-between mb-5">
          <Logo size={40} withText />
          <button className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Search size={18} />
          </button>
        </div>
        <div>
          <p className="f-mono text-[10px] tracking-[0.2em] text-lime-400 uppercase mb-2">// Scouting Module</p>
          <h1 className="f-display text-5xl text-white leading-[0.9]">Cancha<br />Abierta.</h1>
        </div>
      </header>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-2">
          <StatBlock label="Prospectos" value={stats.total} icon={<Users size={14} />} />
          <StatBlock label="Top Tier" value={stats.high} icon={<Award size={14} />} accent />
          <StatBlock label="Media" value={stats.avg} icon={<TrendingUp size={14} />} />
        </div>
      </div>

      {/* Filtros */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'high', label: 'Alto Potencial' },
            { key: 'medium', label: 'En Observación' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs f-body font-semibold transition-colors ${
                filter === f.key
                  ? 'bg-lime-400 text-neutral-950'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="f-display text-2xl text-white">EVALUADOS RECIENTES</h2>
          <span className="f-mono text-xs text-neutral-500">
            {loading ? '···' : `${filtered.length} items`}
          </span>
        </div>

        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
              <Users size={20} className="text-neutral-500" />
            </div>
            <p className="f-display text-xl text-white mb-1">SIN PROSPECTOS</p>
            <p className="f-body text-xs text-neutral-500">
              {prospects.length === 0
                ? 'Toca el botón para crear tu primera evaluación.'
                : 'No hay resultados en esta categoría.'}
            </p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <ProspectCard key={p.id} prospect={p} index={i} onClick={() => onSelect(p)} />
          ))
        )}
      </div>

      {/* FAB Nuevo Prospecto */}
      <button
        onClick={onAddNew}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pulse-fab bg-lime-400 text-neutral-950 rounded-full pl-5 pr-6 py-4 flex items-center gap-2 shadow-2xl active:scale-95 transition-transform"
        style={{ maxWidth: 'calc(100% - 40px)' }}
      >
        <div className="w-7 h-7 rounded-full bg-neutral-950 flex items-center justify-center">
          <Plus size={18} className="text-lime-400" strokeWidth={3} />
        </div>
        <span className="f-display text-lg tracking-wide">NUEVO PROSPECTO</span>
      </button>
    </div>
  );
}