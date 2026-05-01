import { useState } from 'react';
import {
  ChevronLeft, X, ArrowRight, Save, Loader2,
  User, Ruler, Wind, Zap, Target, Brain, TrendingUp, Activity,
} from 'lucide-react';
import Logo from './ui/Logo';
import SectionHeader from './ui/SectionHeader';
import { TextField, FieldLabel, PillSelector } from './ui/TextField';
import PhotoUploader from './ui/PhotoUploader';
import MultiAttemptField from './ui/MultiAttemptField';
import RatingScale from './ui/RatingScale';
import { POSITIONS, SEX_OPTIONS, CATEGORIES } from '../constants/scouting';
import { EMPTY_FORM, bestOf } from '../lib/helpers';
import type { FormData } from '../types';

const TOTAL_STEPS = 6;

// Helpers de display
function RatioRow({ label, value, note }: { label: string; value: string; note: string }) {
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

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 last:border-0">
      <span className="text-neutral-500 f-mono text-[11px] uppercase tracking-wider">{k}</span>
      <span className="text-white f-body font-semibold text-sm">{v}</span>
    </div>
  );
}

interface EvaluationFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
  saving: boolean;
  initialData: FormData | null;
  isEditing: boolean;
}

// Posiciones como objects para el PillSelector
const POSITION_OPTIONS = POSITIONS.map((p) => ({ id: p, label: p }));

// =========================================================
// COMPONENT — EvaluationForm (multi-paso 6 secciones)
// =========================================================
export default function EvaluationForm({ onClose, onSave, saving, initialData, isEditing }: EvaluationFormProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData || EMPTY_FORM);

  const update = (field: keyof FormData) => (value: any) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => { if (step < TOTAL_STEPS) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); else onClose(); };

  const handleSubmit = () => {
    const consolidated = {
      ...data,
      bestSprint20m: bestOf(data.sprint20m, true),
      bestFlexibility: bestOf(data.flexibility),
      bestVerticalJump: bestOf(data.verticalJump),
      bestAgility: bestOf(data.agility, true),
      generalScore: Math.round(
        ((data.shooting + data.ballHandling + data.decisionMaking + data.defense +
          data.leadership + data.workEthic + data.frustrationTolerance) / 7) * 20
      ),
    };
    onSave(consolidated);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col" style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Top bar */}
      <div className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-neutral-900">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} disabled={saving}
            className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="f-display text-sm tracking-widest text-neutral-400">
              {isEditing ? 'EDITAR' : 'NUEVA EVAL.'}
            </span>
          </div>
          <button onClick={onClose} disabled={saving}
            className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < step ? 'bg-lime-400' : 'bg-neutral-800'}`} />
          ))}
        </div>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-hide">
        {/* Paso 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            <SectionHeader icon={<User size={22} strokeWidth={2.5} />} title="DATOS GENERALES" subtitle="Información básica del prospecto." step={1} total={TOTAL_STEPS} />
            <PhotoUploader value={data.photo} onChange={update('photo')} />
            <TextField label="Nombre y Apellidos" value={data.name} onChange={update('name')} placeholder="Ej. Juan Pérez García" />
            <TextField label="Fecha de Nacimiento" type="date" value={data.birthDate} onChange={update('birthDate')} />
            <TextField label="Club" value={data.club} onChange={update('club')} placeholder="Ej. Halcones SUB-18" />
            <PillSelector label="Sexo" options={SEX_OPTIONS} value={data.sex} onChange={update('sex')} cols={2} />
            <PillSelector label="Categoría" options={CATEGORIES} value={data.basketCategory} onChange={update('basketCategory')} cols={5} useShort />
            <PillSelector label="Posición" options={POSITION_OPTIONS} value={data.position} onChange={update('position')} cols={3} />
          </div>
        )}

        {/* Paso 2 */}
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
                {data.height && data.wingspan && (
                  <RatioRow label="Envergadura / Altura" value={(parseFloat(data.wingspan) / parseFloat(data.height)).toFixed(2)} note="> 1.05 ventaja" />
                )}
                {data.waist && data.hips && (
                  <RatioRow label="Cintura / Cadera" value={(parseFloat(data.waist) / parseFloat(data.hips)).toFixed(2)} note="ICC" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Paso 3 */}
        {step === 3 && (
          <div className="space-y-5 animate-slide-up">
            <SectionHeader icon={<Wind size={22} strokeWidth={2.5} />} title="RESISTENCIA & VELOCIDAD" subtitle="Capacidad aeróbica y aceleración." step={3} total={TOTAL_STEPS} />
            <TextField label="Test de 6 minutos" hint="distancia recorrida" type="number" value={data.enduranceTest} onChange={update('enduranceTest')} placeholder="0" suffix="m" />
            <MultiAttemptField label="Velocidad 20 metros" hint="cronometrado" attempts={data.sprint20m} onChange={update('sprint20m')} suffix="seg" lowerIsBetter />
            <MultiAttemptField label="Flexibilidad" hint="sit & reach" attempts={data.flexibility} onChange={update('flexibility')} suffix="cm" />
          </div>
        )}

        {/* Paso 4 */}
        {step === 4 && (
          <div className="space-y-5 animate-slide-up">
            <SectionHeader icon={<Zap size={22} strokeWidth={2.5} />} title="POTENCIA & AGILIDAD" subtitle="Salto, fuerza y cambio de dirección." step={4} total={TOTAL_STEPS} />
            <TextField label="Alcance Vertical" hint="brazo extendido" type="number" value={data.verticalReach} onChange={update('verticalReach')} placeholder="0" suffix="cm" />
            <MultiAttemptField label="Saltabilidad" hint="salto vertical" attempts={data.verticalJump} onChange={update('verticalJump')} suffix="cm" />
            <TextField label="Fuerza Resistencia" hint="flex. ext. de codo" type="number" value={data.pushups} onChange={update('pushups')} placeholder="0" suffix="reps" />
            <MultiAttemptField label="Agilidad" hint="circuito cronometrado" attempts={data.agility} onChange={update('agility')} suffix="seg" lowerIsBetter />
          </div>
        )}

        {/* Paso 5 */}
        {step === 5 && (
          <div className="space-y-6 animate-slide-up">
            <SectionHeader icon={<Target size={22} strokeWidth={2.5} />} title="TÉCNICA & TÁCTICA" subtitle="Evaluación cualitativa en juego." step={5} total={TOTAL_STEPS} />
            <div><FieldLabel>Mecánica de Tiro</FieldLabel><RatingScale value={data.shooting} onChange={update('shooting')} /></div>
            <div><FieldLabel>Manejo de Balón</FieldLabel><RatingScale value={data.ballHandling} onChange={update('ballHandling')} /></div>
            <div><FieldLabel>Toma de Decisiones</FieldLabel><RatingScale value={data.decisionMaking} onChange={update('decisionMaking')} /></div>
            <div><FieldLabel>Defensa</FieldLabel><RatingScale value={data.defense} onChange={update('defense')} /></div>
          </div>
        )}

        {/* Paso 6 */}
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
                <SummaryRow k="Categoría" v={data.basketCategory ? data.basketCategory.toUpperCase() : '—'} />
                <SummaryRow k="Posición" v={data.position || '—'} />
                <SummaryRow k="Estatura" v={data.height ? `${data.height} cm` : '—'} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-neutral-900 bg-neutral-950">
        {step < TOTAL_STEPS ? (
          <button onClick={handleNext}
            className="w-full bg-white text-neutral-950 rounded-xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <span className="f-display text-lg tracking-wide">CONTINUAR</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="w-full bg-lime-400 text-neutral-950 rounded-xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? (
              <>
                <Loader2 size={18} strokeWidth={2.5} className="spin" />
                <span className="f-display text-lg tracking-wide">{isEditing ? 'ACTUALIZANDO...' : 'GUARDANDO...'}</span>
              </>
            ) : (
              <>
                <Save size={18} strokeWidth={2.5} />
                <span className="f-display text-lg tracking-wide">{isEditing ? 'ACTUALIZAR' : 'GUARDAR EVALUACIÓN'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}