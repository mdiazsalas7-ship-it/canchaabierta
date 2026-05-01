import { useState, useEffect } from 'react';
import {
  collection, addDoc, getDocs, query, orderBy,
  serverTimestamp, doc, updateDoc, deleteDoc
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';
import {
  Plus, ChevronLeft, ChevronRight, User, Ruler, Zap,
  Target, Brain, Save, X, TrendingUp, Search,
  Activity, Award, Check, ArrowRight, Camera, Wind,
  Users, Loader2, AlertCircle, Pencil, Trash2,
  ImagePlus, Hand, Footprints, BarChart3, Image as ImageIcon
} from 'lucide-react';

/* =========================================================
   SCOUTING APP — v2: con edición + galería multi-foto
   ========================================================= */

const POSITIONS = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];

// Categorías de fotos comparativas
const PHOTO_CATEGORIES = [
  { id: 'frontal',     label: 'Frontal' },
  { id: 'posterior',   label: 'Posterior' },
  { id: 'lateral_d',   label: 'Lateral Der.' },
  { id: 'lateral_i',   label: 'Lateral Izq.' },
  { id: 'brazo_d',     label: 'Brazo Der.' },
  { id: 'brazo_i',     label: 'Brazo Izq.' },
  { id: 'pierna_d',    label: 'Pierna Der.' },
  { id: 'pierna_i',    label: 'Pierna Izq.' },
  { id: 'mano',        label: 'Manos' },
  { id: 'pie',         label: 'Pies' },
  { id: 'otro',        label: 'Otro' },
];
const labelOfCategory = (id: string) =>
  PHOTO_CATEGORIES.find(c => c.id === id)?.label || 'Sin categoría';

// =========================================================
// HELPERS
// =========================================================
const getScoreTier = (score: number) => {
  if (score >= 80) return { tier: 'high',   label: 'ALTO POTENCIAL', dot: 'bg-lime-400',  text: 'text-lime-400',  bar: 'bg-lime-400' };
  if (score >= 65) return { tier: 'medium', label: 'EN OBSERVACIÓN', dot: 'bg-amber-400', text: 'text-amber-400', bar: 'bg-amber-400' };
  return                 { tier: 'low',    label: 'BAJO POTENCIAL', dot: 'bg-red-500',   text: 'text-red-500',   bar: 'bg-red-500' };
};

const mapFirestoreDoc = (d: any) => {
  const data = d.data();
  const today = new Date();
  return {
    id: d.id,
    ...data,
    name: data.name || 'Sin nombre',
    position: data.position || 'N/A',
    age: data.birthDate ? today.getFullYear() - new Date(data.birthDate).getFullYear() : 0,
    score: data.generalScore || 0,
    height: data.height ? (parseFloat(data.height) / 100).toFixed(2) : '—',
    club: data.club || 'Por asignar',
    photo: data.photoURL || null,
    measurementPhotos: data.measurementPhotos || [],
    date: data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()
      : '—',
  };
};

// Convierte un prospecto desde Firestore al shape que espera el form
const prospectToFormData = (p: any) => ({
  photo: p.photoURL || null,
  name: p.name || '',
  birthDate: p.birthDate || '',
  club: p.club || '',
  position: p.position || '',
  height: p.height || '',
  weight: p.weight || '',
  bodyFat: p.bodyFat || '',
  wingspan: p.wingspan || '',
  waist: p.waist || '',
  hips: p.hips || '',
  enduranceTest: p.enduranceTest || '',
  sprint20m: p.sprint20m || ['', ''],
  flexibility: p.flexibility || ['', ''],
  verticalReach: p.verticalReach || '',
  verticalJump: p.verticalJump || ['', ''],
  pushups: p.pushups || '',
  agility: p.agility || ['', ''],
  shooting: p.shooting || 0,
  ballHandling: p.ballHandling || 0,
  decisionMaking: p.decisionMaking || 0,
  defense: p.defense || 0,
  leadership: p.leadership || 0,
  workEthic: p.workEthic || 0,
  frustrationTolerance: p.frustrationTolerance || 0,
});

// =========================================================
// FONT INJECTOR
// =========================================================
function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
      .f-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
      .f-body    { font-family: 'Manrope', sans-serif; }
      .f-mono    { font-family: 'JetBrains Mono', monospace; font-feature-settings: 'tnum'; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(163,230,53, 0.5);} 70% { box-shadow: 0 0 0 12px rgba(163,230,53, 0);} 100% { box-shadow: 0 0 0 0 rgba(163,230,53, 0);} }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
      .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
      .pulse-fab { animation: pulse-ring 2s infinite; }
      .spin { animation: spin 1s linear infinite; }
      .skeleton { background: linear-gradient(90deg, #1a1a1a 0%, #232323 50%, #1a1a1a 100%); background-size: 400px 100%; animation: shimmer 1.5s infinite; }
    `}</style>
  );
}

// =========================================================
// COMPONENT — ProspectCard (clickable)
// =========================================================
function ProspectCard({ prospect, index, onClick }: any) {
  const tier = getScoreTier(prospect.score);
  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative bg-neutral-900 border border-neutral-800 rounded-2xl p-4 active:scale-[0.98] transition-transform animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${tier.bar}`}></div>
      <div className="flex items-start gap-4 pl-2">
        <div className="relative flex-shrink-0">
          {prospect.photo ? (
            <img src={prospect.photo} alt={prospect.name} className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center f-display text-2xl text-white">
              {prospect.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
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
          <div className="flex items-center gap-3 mt-3 f-body text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-neutral-600"></span>{prospect.position}</span>
            <span className="inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-neutral-600"></span>{prospect.age} años</span>
            <span className="inline-flex items-center gap-1 f-mono"><span className="w-1 h-1 rounded-full bg-neutral-600"></span>{prospect.height}m</span>
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

// =========================================================
// COMPONENT — Skeleton
// =========================================================
function CardSkeleton() {
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

// =========================================================
// COMPONENT — Dashboard
// =========================================================
function Dashboard({ prospects, loading, onAddNew, onSelect }: any) {
  const [filter, setFilter] = useState('all');
  const filtered = prospects.filter((p: any) => {
    if (filter === 'high')   return p.score >= 80;
    if (filter === 'medium') return p.score >= 65 && p.score < 80;
    return true;
  });
  const stats = {
    total: prospects.length,
    high: prospects.filter((p: any) => p.score >= 80).length,
    avg: prospects.length > 0 ? Math.round(prospects.reduce((a: number, b: any) => a + b.score, 0) / prospects.length) : 0,
  };

  return (
    <div className="min-h-full pb-32">
      <header className="px-5 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="f-mono text-[10px] tracking-[0.2em] text-lime-400 uppercase mb-2">// Scouting Module</p>
            <h1 className="f-display text-5xl text-white leading-[0.9]">Cancha<br/>Abierta.</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Search size={18} />
          </button>
        </div>
      </header>

      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-2">
          <StatBlock label="Prospectos" value={stats.total} icon={<Users size={14} />} />
          <StatBlock label="Top Tier"   value={stats.high}  icon={<Award size={14} />} accent />
          <StatBlock label="Media"      value={stats.avg}   icon={<TrendingUp size={14} />} />
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {[
            { key: 'all',    label: 'Todos' },
            { key: 'high',   label: 'Alto Potencial' },
            { key: 'medium', label: 'En Observación' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs f-body font-semibold transition-colors ${
                filter === f.key ? 'bg-lime-400 text-neutral-950' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="f-display text-2xl text-white">EVALUADOS RECIENTES</h2>
          <span className="f-mono text-xs text-neutral-500">{loading ? '···' : `${filtered.length} items`}</span>
        </div>
        {loading ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
              <Users size={20} className="text-neutral-500" />
            </div>
            <p className="f-display text-xl text-white mb-1">SIN PROSPECTOS</p>
            <p className="f-body text-xs text-neutral-500">
              {prospects.length === 0 ? 'Toca el botón para crear tu primera evaluación.' : 'No hay resultados en esta categoría.'}
            </p>
          </div>
        ) : (
          filtered.map((p: any, i: number) => <ProspectCard key={p.id} prospect={p} index={i} onClick={() => onSelect(p)} />)
        )}
      </div>

      <button onClick={onAddNew}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pulse-fab bg-lime-400 text-neutral-950 rounded-full pl-5 pr-6 py-4 flex items-center gap-2 shadow-2xl active:scale-95 transition-transform"
        style={{ maxWidth: 'calc(100% - 40px)' }}>
        <div className="w-7 h-7 rounded-full bg-neutral-950 flex items-center justify-center">
          <Plus size={18} className="text-lime-400" strokeWidth={3} />
        </div>
        <span className="f-display text-lg tracking-wide">NUEVO PROSPECTO</span>
      </button>
    </div>
  );
}

function StatBlock({ label, value, icon, accent }: any) {
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
// Inputs reutilizables
// =========================================================
function FieldLabel({ children, hint }: any) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <label className="f-body text-xs font-semibold text-neutral-300 uppercase tracking-wider">{children}</label>
      {hint && <span className="f-mono text-[10px] text-neutral-600">{hint}</span>}
    </div>
  );
}

function TextField({ label, hint, value, onChange, type = 'text', placeholder, suffix }: any) {
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="relative">
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3.5 f-body text-white placeholder-neutral-600 focus:border-lime-400 focus:outline-none transition-colors" />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 f-mono text-xs text-neutral-500 pointer-events-none">{suffix}</span>}
      </div>
    </div>
  );
}

function PositionSelector({ value, onChange }: any) {
  return (
    <div>
      <FieldLabel>Posición</FieldLabel>
      <div className="grid grid-cols-3 gap-2">
        {POSITIONS.map(p => (
          <button key={p} type="button" onClick={() => onChange(p)}
            className={`py-2.5 rounded-lg text-xs f-body font-semibold transition-all active:scale-95 ${
              value === p ? 'bg-lime-400 text-neutral-950 border border-lime-400' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoUploader({ value, onChange }: any) {
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

function MultiAttemptField({ label, hint, attempts, onChange, suffix, lowerIsBetter = false }: any) {
  const numericVals = attempts.map((a: any) => parseFloat(a)).filter((v: number) => !isNaN(v));
  const best = numericVals.length > 0 ? (lowerIsBetter ? Math.min(...numericVals) : Math.max(...numericVals)) : null;
  const handleChange = (i: number, val: string) => {
    const next = [...attempts];
    next[i] = val;
    onChange(next);
  };
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {attempts.map((val: any, i: number) => (
          <div key={i} className="relative">
            <span className="absolute -top-1.5 left-3 z-10 bg-neutral-950 px-1.5 f-mono text-[9px] text-neutral-500 uppercase tracking-wider">Int. {i + 1}</span>
            <input type="number" step="0.01" value={val} onChange={e => handleChange(i, e.target.value)} placeholder="0"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3.5 f-body text-white placeholder-neutral-600 focus:border-lime-400 focus:outline-none transition-colors" />
            {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 f-mono text-[10px] text-neutral-500 pointer-events-none">{suffix}</span>}
          </div>
        ))}
      </div>
      {best !== null && (
        <div className="mt-2 flex items-center gap-1.5">
          <Award size={11} className="text-lime-400" strokeWidth={2.5} />
          <span className="f-mono text-[10px] tracking-widest uppercase text-lime-400">Mejor registro: {best}{suffix ? ` ${suffix}` : ''}</span>
        </div>
      )}
    </div>
  );
}

function RatingScale({ value, onChange, labels = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Élite'] }: any) {
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-12 rounded-lg border f-display text-xl transition-all active:scale-95 ${
              value >= n ? 'bg-lime-400 border-lime-400 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-neutral-600'
            }`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-0.5">
        <span className="f-mono text-[9px] text-neutral-600 uppercase tracking-wider">{labels[0]}</span>
        <span className="f-mono text-[9px] text-lime-400 uppercase tracking-wider">{value > 0 ? labels[value - 1] : '—'}</span>
        <span className="f-mono text-[9px] text-neutral-600 uppercase tracking-wider">{labels[4]}</span>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, step, total }: any) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-lime-400 text-neutral-950 flex items-center justify-center">{icon}</div>
        <span className="f-mono text-[10px] text-neutral-500 tracking-widest">PASO {step} / {total}</span>
      </div>
      <h2 className="f-display text-3xl text-white leading-tight">{title}</h2>
      <p className="f-body text-sm text-neutral-500 mt-1">{subtitle}</p>
    </div>
  );
}

// =========================================================
// EvaluationForm — Multi-paso (creación + edición)
// =========================================================
const EMPTY_FORM = {
  photo: null, name: '', birthDate: '', club: '', position: '',
  height: '', weight: '', bodyFat: '', wingspan: '', waist: '', hips: '',
  enduranceTest: '', sprint20m: ['', ''], flexibility: ['', ''],
  verticalReach: '', verticalJump: ['', ''], pushups: '', agility: ['', ''],
  shooting: 0, ballHandling: 0, decisionMaking: 0, defense: 0,
  leadership: 0, workEthic: 0, frustrationTolerance: 0,
};
const TOTAL_STEPS = 6;

function EvaluationForm({ onClose, onSave, saving, initialData, isEditing }: any) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>(initialData || EMPTY_FORM);

  const update = (field: string) => (value: any) => setData((prev: any) => ({ ...prev, [field]: value }));

  const handleNext = () => { if (step < TOTAL_STEPS) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); else onClose(); };

  const bestOf = (arr: any[], lowerIsBetter = false) => {
    const nums = arr.map((v: any) => parseFloat(v)).filter((v: number) => !isNaN(v));
    if (nums.length === 0) return null;
    return lowerIsBetter ? Math.min(...nums) : Math.max(...nums);
  };

  const handleSubmit = () => {
    const consolidated = {
      ...data,
      bestSprint20m:    bestOf(data.sprint20m, true),
      bestFlexibility:  bestOf(data.flexibility),
      bestVerticalJump: bestOf(data.verticalJump),
      bestAgility:      bestOf(data.agility, true),
      generalScore: Math.round(
        ((data.shooting + data.ballHandling + data.decisionMaking + data.defense +
          data.leadership + data.workEthic + data.frustrationTolerance) / 7) * 20
      ),
    };
    onSave(consolidated);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-neutral-900">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} disabled={saving} className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          <span className="f-display text-sm tracking-widest text-neutral-400">
            {isEditing ? 'EDITAR EVALUACIÓN' : 'NUEVA EVALUACIÓN'}
          </span>
          <button onClick={onClose} disabled={saving} className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-50">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < step ? 'bg-lime-400' : 'bg-neutral-800'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-hide">
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            <SectionHeader icon={<User size={22} strokeWidth={2.5} />} title="DATOS GENERALES" subtitle="Información básica del prospecto." step={1} total={TOTAL_STEPS} />
            <PhotoUploader value={data.photo} onChange={update('photo')} />
            <TextField label="Nombre y Apellidos" value={data.name} onChange={update('name')} placeholder="Ej. Juan Pérez García" />
            <TextField label="Fecha de Nacimiento" type="date" value={data.birthDate} onChange={update('birthDate')} />
            <TextField label="Club" value={data.club} onChange={update('club')} placeholder="Ej. Halcones SUB-18" />
            <PositionSelector value={data.position} onChange={update('position')} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            <SectionHeader icon={<Ruler size={22} strokeWidth={2.5} />} title="ANTROPOMETRÍA" subtitle="Medidas físicas estructurales." step={2} total={TOTAL_STEPS} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Estatura" type="number" value={data.height} onChange={update('height')} placeholder="0" suffix="cm" />
              <TextField label="Peso" type="number" value={data.weight} onChange={update('weight')} placeholder="0" suffix="kg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="% Grasa" type="number" value={data.bodyFat} onChange={update('bodyFat')} placeholder="0" suffix="%" />
              <TextField label="Envergadura" type="number" value={data.wingspan} onChange={update('wingspan')} placeholder="0" suffix="cm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Cintura" type="number" value={data.waist} onChange={update('waist')} placeholder="0" suffix="cm" />
              <TextField label="Caderas" type="number" value={data.hips} onChange={update('hips')} placeholder="0" suffix="cm" />
            </div>
            {((data.height && data.wingspan) || (data.waist && data.hips)) && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-lime-400 mb-1">
                  <TrendingUp size={14} />
                  <span className="f-mono text-[10px] tracking-widest uppercase">Ratios Calculados</span>
                </div>
                {data.height && data.wingspan && <RatioRow label="Envergadura / Altura" value={(data.wingspan / data.height).toFixed(2)} note="> 1.05 ventaja" />}
                {data.waist && data.hips && <RatioRow label="Cintura / Cadera" value={(data.waist / data.hips).toFixed(2)} note="ICC" />}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-slide-up">
            <SectionHeader icon={<Wind size={22} strokeWidth={2.5} />} title="RESISTENCIA & VELOCIDAD" subtitle="Capacidad aeróbica y aceleración." step={3} total={TOTAL_STEPS} />
            <TextField label="Test de 6 minutos" hint="distancia recorrida" type="number" value={data.enduranceTest} onChange={update('enduranceTest')} placeholder="0" suffix="m" />
            <MultiAttemptField label="Velocidad 20 metros" hint="cronometrado" attempts={data.sprint20m} onChange={update('sprint20m')} suffix="seg" lowerIsBetter />
            <MultiAttemptField label="Flexibilidad" hint="sit & reach" attempts={data.flexibility} onChange={update('flexibility')} suffix="cm" />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-slide-up">
            <SectionHeader icon={<Zap size={22} strokeWidth={2.5} />} title="POTENCIA & AGILIDAD" subtitle="Salto, fuerza y cambio de dirección." step={4} total={TOTAL_STEPS} />
            <TextField label="Alcance Vertical" hint="brazo extendido" type="number" value={data.verticalReach} onChange={update('verticalReach')} placeholder="0" suffix="cm" />
            <MultiAttemptField label="Saltabilidad" hint="salto vertical" attempts={data.verticalJump} onChange={update('verticalJump')} suffix="cm" />
            <TextField label="Fuerza Resistencia" hint="flex. ext. de codo" type="number" value={data.pushups} onChange={update('pushups')} placeholder="0" suffix="reps" />
            <MultiAttemptField label="Agilidad" hint="circuito cronometrado" attempts={data.agility} onChange={update('agility')} suffix="seg" lowerIsBetter />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-slide-up">
            <SectionHeader icon={<Target size={22} strokeWidth={2.5} />} title="TÉCNICA & TÁCTICA" subtitle="Evaluación cualitativa en juego." step={5} total={TOTAL_STEPS} />
            <div><FieldLabel>Mecánica de Tiro</FieldLabel><RatingScale value={data.shooting} onChange={update('shooting')} /></div>
            <div><FieldLabel>Manejo de Balón</FieldLabel><RatingScale value={data.ballHandling} onChange={update('ballHandling')} /></div>
            <div><FieldLabel>Toma de Decisiones</FieldLabel><RatingScale value={data.decisionMaking} onChange={update('decisionMaking')} /></div>
            <div><FieldLabel>Defensa</FieldLabel><RatingScale value={data.defense} onChange={update('defense')} /></div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-slide-up">
            <SectionHeader icon={<Brain size={22} strokeWidth={2.5} />} title="PERFIL PSICOLÓGICO" subtitle="Atributos mentales y de carácter." step={6} total={TOTAL_STEPS} />
            <div><FieldLabel>Liderazgo</FieldLabel><RatingScale value={data.leadership} onChange={update('leadership')} /></div>
            <div><FieldLabel>Ética de Trabajo</FieldLabel><RatingScale value={data.workEthic} onChange={update('workEthic')} /></div>
            <div><FieldLabel>Tolerancia a la Frustración</FieldLabel><RatingScale value={data.frustrationTolerance} onChange={update('frustrationTolerance')} /></div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-lime-400 mb-3">
                <Activity size={14} />
                <span className="f-mono text-[10px] tracking-widest uppercase">Resumen Final</span>
              </div>
              <div className="space-y-1">
                <SummaryRow k="Prospecto" v={data.name || '—'} />
                <SummaryRow k="Club" v={data.club || '—'} />
                <SummaryRow k="Posición" v={data.position || '—'} />
                <SummaryRow k="Estatura" v={data.height ? `${data.height} cm` : '—'} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-5 py-4 border-t border-neutral-900 bg-neutral-950">
        {step < TOTAL_STEPS ? (
          <button onClick={handleNext} className="w-full bg-white text-neutral-950 rounded-xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <span className="f-display text-lg tracking-wide">CONTINUAR</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="w-full bg-lime-400 text-neutral-950 rounded-xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? (
              <><Loader2 size={18} strokeWidth={2.5} className="spin" />
                <span className="f-display text-lg tracking-wide">{isEditing ? 'ACTUALIZANDO...' : 'GUARDANDO...'}</span></>
            ) : (
              <><Save size={18} strokeWidth={2.5} />
                <span className="f-display text-lg tracking-wide">{isEditing ? 'ACTUALIZAR EVALUACIÓN' : 'GUARDAR EVALUACIÓN'}</span></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function RatioRow({ label, value, note }: any) {
  return (
    <div className="flex items-center justify-between f-body text-sm">
      <span className="text-neutral-400">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="f-mono text-lime-400 font-semibold">{value}</span>
        <span className="f-mono text-[9px] text-neutral-600 uppercase tracking-wider">{note}</span>
      </div>
    </div>
  );
}

function SummaryRow({ k, v }: any) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 last:border-0">
      <span className="text-neutral-500 f-mono text-[11px] uppercase tracking-wider">{k}</span>
      <span className="text-white f-body font-semibold text-sm">{v}</span>
    </div>
  );
}

// =========================================================
// COMPONENT — AddPhotoModal (subir foto comparativa)
// =========================================================
function AddPhotoModal({ onClose, onSubmit, uploading }: any) {
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
      <div className="bg-neutral-900 border-t border-neutral-800 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-slide-up" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
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
              {PHOTO_CATEGORIES.map(c => (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                  className={`py-2.5 rounded-lg text-[11px] f-body font-semibold transition-all active:scale-95 ${
                    category === c.id ? 'bg-lime-400 text-neutral-950 border border-lime-400' : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel hint="opcional">Notas</FieldLabel>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Ej. Antes de pretemporada, condición inicial..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 f-body text-sm text-white placeholder-neutral-600 focus:border-lime-400 focus:outline-none resize-none" />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-neutral-800 bg-neutral-900 sticky bottom-0">
          <button onClick={handleSubmit} disabled={!photo || uploading}
            className="w-full bg-lime-400 text-neutral-950 rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform">
            {uploading ? (
              <><Loader2 size={18} strokeWidth={2.5} className="spin" />
                <span className="f-display text-lg tracking-wide">SUBIENDO...</span></>
            ) : (
              <><Save size={18} strokeWidth={2.5} />
                <span className="f-display text-lg tracking-wide">AÑADIR FOTO</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// COMPONENT — Lightbox (visualizador de foto a pantalla completa)
// =========================================================
function Lightbox({ photo, onClose, onDelete }: any) {
  if (!photo) return null;
  const formattedDate = photo.uploadedAt
    ? new Date(photo.uploadedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  return (
    <div className="fixed inset-0 bg-neutral-950 z-[80] flex flex-col" onClick={onClose}>
      <div className="flex-shrink-0 px-5 pt-6 pb-4 flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
          <X size={18} />
        </button>
        <button onClick={() => { if (confirm('¿Borrar esta foto?')) onDelete(); }} className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-5">
        <img src={photo.url} alt={photo.category} className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
      </div>
      <div className="flex-shrink-0 px-5 py-5 border-t border-neutral-900" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-lime-400 text-neutral-950 f-display text-xs px-2.5 py-1 rounded-full tracking-widest">{labelOfCategory(photo.category)}</span>
          <span className="f-mono text-[10px] text-neutral-500">{formattedDate}</span>
        </div>
        {photo.notes && <p className="f-body text-sm text-neutral-300 mt-2">{photo.notes}</p>}
      </div>
    </div>
  );
}

// =========================================================
// COMPONENT — ProspectDetail (NUEVO)
// =========================================================
function ProspectDetail({ prospect, onBack, onEdit, onDelete, onAddPhoto, onDeletePhoto, addingPhoto }: any) {
  const [tab, setTab] = useState<'medidas' | 'pruebas' | 'galeria'>('medidas');
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<any>(null);
  const tier = getScoreTier(prospect.score);

  // Agrupar fotos por categoría
  const photosByCategory: Record<string, any[]> = {};
  (prospect.measurementPhotos || []).forEach((p: any) => {
    if (!photosByCategory[p.category]) photosByCategory[p.category] = [];
    photosByCategory[p.category].push(p);
  });
  Object.keys(photosByCategory).forEach(cat => {
    photosByCategory[cat].sort((a, b) => b.uploadedAt - a.uploadedAt);
  });

  const handleDeleteFromLightbox = () => {
    onDeletePhoto(lightboxPhoto);
    setLightboxPhoto(null);
  };

  return (
    <div className="min-h-full pb-24 bg-neutral-950">
      {/* Header */}
      <div className="relative">
        {prospect.photo ? (
          <div className="aspect-[4/3] relative overflow-hidden">
            <img src={prospect.photo} alt={prospect.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"></div>
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
            <span className="f-display text-7xl text-neutral-700">
              {prospect.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
        )}

        {/* Botones flotantes */}
        <div className="absolute top-5 left-5 right-5 flex justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-950/70 backdrop-blur border border-neutral-800 flex items-center justify-center text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => { if (confirm(`¿Borrar a ${prospect.name}?`)) onDelete(); }}
              className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur border border-red-500/40 flex items-center justify-center text-red-400">
              <Trash2 size={16} />
            </button>
            <button onClick={onEdit} className="bg-lime-400 text-neutral-950 rounded-full px-4 py-2 flex items-center gap-1.5 f-display text-sm tracking-widest">
              <Pencil size={14} strokeWidth={2.5} />
              EDITAR
            </button>
          </div>
        </div>

        {/* Info en bottom del header */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${tier.dot}`}></span>
            <span className={`f-display text-xs tracking-widest ${tier.text}`}>{tier.label}</span>
            <div className="ml-auto flex items-baseline gap-1">
              <span className={`f-display text-4xl leading-none ${tier.text}`}>{prospect.score}</span>
              <span className="f-mono text-xs text-neutral-500">/100</span>
            </div>
          </div>
          <h1 className="f-display text-4xl text-white leading-tight">{prospect.name}</h1>
          <p className="f-body text-sm text-neutral-400 mt-1">{prospect.club} · {prospect.position} · {prospect.age} años</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4 pb-2 sticky top-0 bg-neutral-950 z-10 border-b border-neutral-900">
        <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-full p-1">
          {[
            { key: 'medidas', label: 'Medidas', icon: Ruler },
            { key: 'pruebas', label: 'Pruebas', icon: BarChart3 },
            { key: 'galeria', label: 'Galería', icon: ImageIcon },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-1 py-2 rounded-full f-body text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  tab === t.key ? 'bg-lime-400 text-neutral-950' : 'text-neutral-400'
                }`}>
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5">
        {tab === 'medidas' && (
          <div className="space-y-3 animate-slide-up">
            <DetailGroup title="Antropometría">
              <DetailRow label="Estatura" value={prospect.heightRaw || prospect.height} unit="cm" raw={prospect.heightRaw} fallbackVal={prospect.height} />
              <DetailRow label="Peso" value={prospect.weight} unit="kg" />
              <DetailRow label="% Grasa" value={prospect.bodyFat} unit="%" />
              <DetailRow label="Envergadura" value={prospect.wingspan} unit="cm" />
              <DetailRow label="Cintura" value={prospect.waist} unit="cm" />
              <DetailRow label="Caderas" value={prospect.hips} unit="cm" />
            </DetailGroup>
            {prospect.height && prospect.wingspan && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                  <TrendingUp size={14} />
                  <span className="f-mono text-[10px] tracking-widest uppercase">Ratio Wingspan</span>
                </div>
                <div className="f-display text-2xl text-lime-400">
                  {(parseFloat(prospect.wingspan) / parseFloat(prospect.height)).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'pruebas' && (
          <div className="space-y-3 animate-slide-up">
            <DetailGroup title="Resistencia & Velocidad">
              <DetailRow label="Test 6 minutos" value={prospect.enduranceTest} unit="m" />
              <DetailRow label="Sprint 20m (mejor)" value={prospect.bestSprint20m} unit="seg" />
              <DetailRow label="Flexibilidad (mejor)" value={prospect.bestFlexibility} unit="cm" />
            </DetailGroup>
            <DetailGroup title="Potencia & Agilidad">
              <DetailRow label="Alcance Vertical" value={prospect.verticalReach} unit="cm" />
              <DetailRow label="Saltabilidad (mejor)" value={prospect.bestVerticalJump} unit="cm" />
              <DetailRow label="Flexiones" value={prospect.pushups} unit="reps" />
              <DetailRow label="Agilidad (mejor)" value={prospect.bestAgility} unit="seg" />
            </DetailGroup>
            <DetailGroup title="Técnica & Táctica">
              <DetailRow label="Mecánica de Tiro" value={prospect.shooting} unit="/5" />
              <DetailRow label="Manejo de Balón" value={prospect.ballHandling} unit="/5" />
              <DetailRow label="Toma de Decisiones" value={prospect.decisionMaking} unit="/5" />
              <DetailRow label="Defensa" value={prospect.defense} unit="/5" />
            </DetailGroup>
            <DetailGroup title="Psicológico">
              <DetailRow label="Liderazgo" value={prospect.leadership} unit="/5" />
              <DetailRow label="Ética de Trabajo" value={prospect.workEthic} unit="/5" />
              <DetailRow label="Tolerancia a Frustración" value={prospect.frustrationTolerance} unit="/5" />
            </DetailGroup>
          </div>
        )}

        {tab === 'galeria' && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <p className="f-body text-xs text-neutral-500">
                {(prospect.measurementPhotos || []).length} fotos · agrupadas por ángulo
              </p>
              <button onClick={() => setShowAddPhoto(true)}
                className="bg-lime-400 text-neutral-950 rounded-full px-3 py-1.5 flex items-center gap-1 f-display text-xs tracking-widest">
                <Plus size={14} strokeWidth={3} /> AÑADIR
              </button>
            </div>

            {Object.keys(photosByCategory).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                  <ImageIcon size={20} className="text-neutral-500" />
                </div>
                <p className="f-display text-xl text-white mb-1">SIN FOTOS</p>
                <p className="f-body text-xs text-neutral-500 px-6">
                  Añade fotos de extremidades por ángulo para comparar evolución entre evaluaciones.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(photosByCategory).map(([cat, photos]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="f-display text-lg text-white tracking-wide">{labelOfCategory(cat)}</h4>
                      <span className="f-mono text-[10px] text-neutral-500">{photos.length} foto{photos.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((p: any, idx: number) => (
                        <button key={idx} onClick={() => setLightboxPhoto(p)}
                          className="aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 active:scale-95 transition-transform relative group">
                          <img src={p.url} alt={cat} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-950/80 to-transparent p-1">
                            <p className="f-mono text-[8px] text-white text-left">
                              {new Date(p.uploadedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showAddPhoto && (
        <AddPhotoModal
          uploading={addingPhoto}
          onClose={() => setShowAddPhoto(false)}
          onSubmit={async (payload: any) => {
            await onAddPhoto(payload);
            setShowAddPhoto(false);
          }}
        />
      )}
      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} onDelete={handleDeleteFromLightbox} />
      )}
    </div>
  );
}

function DetailGroup({ title, children }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950/50">
        <span className="f-mono text-[10px] tracking-widest uppercase text-lime-400">{title}</span>
      </div>
      <div className="divide-y divide-neutral-800">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, unit }: any) {
  const display = (value === null || value === undefined || value === '' || value === 0) ? '—' : value;
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <span className="f-body text-sm text-neutral-400">{label}</span>
      <span className="f-mono text-sm text-white">
        {display}{display !== '—' && unit ? <span className="text-neutral-500 ml-1 text-xs">{unit}</span> : ''}
      </span>
    </div>
  );
}

// =========================================================
// COMPONENT — Toast
// =========================================================
function Toast({ toast }: any) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] rounded-full px-5 py-3 flex items-center gap-2 shadow-2xl animate-slide-up f-body font-semibold text-sm ${
      isError ? 'bg-red-500 text-white' : 'bg-lime-400 text-neutral-950'
    }`}>
      {isError ? <AlertCircle size={16} strokeWidth={2.5} /> : <Check size={16} strokeWidth={3} />}
      {toast.message}
    </div>
  );
}

// =========================================================
// MAIN — App
// =========================================================
type View = 'dashboard' | 'detail' | 'form';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [prospects, setProspects] = useState<any[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [toast, setToast] = useState<any>(null);

  const showToast = (type: string, message: string, duration = 3000) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  // Helper para subir base64 a Storage
  const uploadBase64Photo = async (base64: string, path: string) => {
    const blob = await (await fetch(base64)).blob();
    const photoRef = ref(storage, path);
    await uploadBytes(photoRef, blob);
    return await getDownloadURL(photoRef);
  };

  // ===========================================================
  // FETCH inicial
  // ===========================================================
  const fetchProspects = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'prospects'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setProspects(snap.docs.map(mapFirestoreDoc));
    } catch (err: any) {
      console.error('❌ Error cargando:', err);
      showToast('error', 'Error al cargar la lista', 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProspects(); }, []);

  // ===========================================================
  // CREATE / UPDATE prospecto
  // ===========================================================
  const handleSaveProspect = async (formData: any) => {
    setSaving(true);
    try {
      // Foto principal (si es base64, súbela; si es URL ya guardada, mantén)
      let photoURL = null;
      if (formData.photo && typeof formData.photo === 'string') {
        if (formData.photo.startsWith('data:')) {
          photoURL = await uploadBase64Photo(
            formData.photo,
            `prospect-photos/${Date.now()}-${(formData.name || 'prospect').replace(/\s+/g, '-')}.jpg`
          );
        } else {
          photoURL = formData.photo; // URL ya existente
        }
      }

      const { photo, ...rest } = formData;

      if (editingId) {
        // === UPDATE ===
        const payload = { ...rest, photoURL, updatedAt: serverTimestamp() };
        await updateDoc(doc(db, 'prospects', editingId), payload);
        showToast('success', 'Evaluación actualizada');
      } else {
        // === CREATE ===
        const payload = { ...rest, photoURL, measurementPhotos: [], createdAt: serverTimestamp() };
        await addDoc(collection(db, 'prospects'), payload);
        showToast('success', 'Evaluación guardada');
      }

      await fetchProspects();
      setView('dashboard');
      setEditingId(null);
      setSelectedProspect(null);
    } catch (err: any) {
      console.error('❌ Error guardando:', err);
      showToast('error', 'Error: ' + (err.message || 'desconocido'), 5000);
    } finally {
      setSaving(false);
    }
  };

  // ===========================================================
  // DELETE prospecto
  // ===========================================================
  const handleDeleteProspect = async () => {
    if (!selectedProspect) return;
    try {
      await deleteDoc(doc(db, 'prospects', selectedProspect.id));
      // (opcional: borrar fotos de Storage aquí)
      showToast('success', 'Prospecto eliminado');
      await fetchProspects();
      setView('dashboard');
      setSelectedProspect(null);
    } catch (err: any) {
      console.error('❌ Error borrando:', err);
      showToast('error', 'Error al eliminar', 5000);
    }
  };

  // ===========================================================
  // ADD foto comparativa
  // ===========================================================
  const handleAddPhoto = async ({ photo, category, notes }: any) => {
    if (!selectedProspect) return;
    setAddingPhoto(true);
    try {
      const url = await uploadBase64Photo(
        photo,
        `measurement-photos/${selectedProspect.id}/${Date.now()}.jpg`
      );
      const newPhoto = { url, category, notes: notes || '', uploadedAt: Date.now() };
      const updatedPhotos = [...(selectedProspect.measurementPhotos || []), newPhoto];

      await updateDoc(doc(db, 'prospects', selectedProspect.id), {
        measurementPhotos: updatedPhotos,
      });

      const updatedProspect = { ...selectedProspect, measurementPhotos: updatedPhotos };
      setSelectedProspect(updatedProspect);
      setProspects(prev => prev.map(p => p.id === selectedProspect.id ? updatedProspect : p));
      showToast('success', 'Foto añadida');
    } catch (err: any) {
      console.error('❌ Error subiendo foto:', err);
      showToast('error', 'Error al subir foto', 5000);
    } finally {
      setAddingPhoto(false);
    }
  };

  // ===========================================================
  // DELETE foto comparativa
  // ===========================================================
  const handleDeletePhoto = async (photoToDelete: any) => {
    if (!selectedProspect) return;
    try {
      // Borrar de Storage (ignoramos error si ya no existe)
      try {
        const photoPath = decodeURIComponent(
          new URL(photoToDelete.url).pathname.split('/o/')[1].split('?')[0]
        );
        await deleteObject(ref(storage, photoPath));
      } catch (e) { /* puede no existir, no es crítico */ }

      const updatedPhotos = selectedProspect.measurementPhotos.filter(
        (p: any) => p.url !== photoToDelete.url
      );

      await updateDoc(doc(db, 'prospects', selectedProspect.id), {
        measurementPhotos: updatedPhotos,
      });

      const updatedProspect = { ...selectedProspect, measurementPhotos: updatedPhotos };
      setSelectedProspect(updatedProspect);
      setProspects(prev => prev.map(p => p.id === selectedProspect.id ? updatedProspect : p));
      showToast('success', 'Foto eliminada');
    } catch (err: any) {
      console.error('❌ Error borrando foto:', err);
      showToast('error', 'Error al eliminar foto', 5000);
    }
  };

  // ===========================================================
  // Navegación
  // ===========================================================
  const handleSelectProspect = (p: any) => {
    setSelectedProspect(p);
    setView('detail');
  };

  const handleEditFromDetail = () => {
    if (!selectedProspect) return;
    setEditingId(selectedProspect.id);
    setView('form');
  };

  const handleAddNew = () => {
    setEditingId(null);
    setSelectedProspect(null);
    setView('form');
  };

  const handleCloseForm = () => {
    setEditingId(null);
    setView(selectedProspect ? 'detail' : 'dashboard');
  };

  return (
    <div className="bg-neutral-950 min-h-screen text-white f-body">
      <FontStyles />
      <div className="mx-auto bg-neutral-950 min-h-screen relative overflow-hidden" style={{ maxWidth: '480px' }}>
        {view === 'dashboard' && (
          <Dashboard prospects={prospects} loading={loading} onAddNew={handleAddNew} onSelect={handleSelectProspect} />
        )}
        {view === 'detail' && selectedProspect && (
          <ProspectDetail
            prospect={selectedProspect}
            onBack={() => { setView('dashboard'); setSelectedProspect(null); }}
            onEdit={handleEditFromDetail}
            onDelete={handleDeleteProspect}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            addingPhoto={addingPhoto}
          />
        )}
        {view === 'form' && (
          <EvaluationForm
            onClose={handleCloseForm}
            onSave={handleSaveProspect}
            saving={saving}
            isEditing={!!editingId}
            initialData={editingId && selectedProspect ? prospectToFormData(selectedProspect) : null}
          />
        )}
        <Toast toast={toast} />
      </div>
    </div>
  );
}