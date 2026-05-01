import { useState } from 'react';
import {
  ChevronLeft, Pencil, Trash2, Plus, Loader2, FileDown,
  Ruler, BarChart3, Image as ImageIcon, TrendingUp,
} from 'lucide-react';
import AddPhotoModal from './AddPhotoModal';
import Lightbox from './Lightbox';
import { getScoreTier } from '../lib/helpers';
import { labelOfCategory, labelOfBasketCategory, labelOfSex } from '../constants/scouting';
import type { Prospect, MeasurementPhoto } from '../types';

interface ProspectDetailProps {
  prospect: Prospect;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddPhoto: (payload: any) => Promise<void>;
  onDeletePhoto: (photo: MeasurementPhoto) => void;
  onExportPDF: () => void;
  addingPhoto: boolean;
  exporting: boolean;
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950/50">
        <span className="f-mono text-[10px] tracking-widest uppercase text-lime-400">{title}</span>
      </div>
      <div className="divide-y divide-neutral-800">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, unit }: { label: string; value: any; unit?: string }) {
  const display = value === null || value === undefined || value === '' || value === 0 ? '—' : value;
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <span className="f-body text-sm text-neutral-400">{label}</span>
      <span className="f-mono text-sm text-white">
        {display}
        {display !== '—' && unit ? <span className="text-neutral-500 ml-1 text-xs">{unit}</span> : ''}
      </span>
    </div>
  );
}

// =========================================================
// COMPONENT — ProspectDetail (tabs: Medidas / Pruebas / Galería)
// =========================================================
export default function ProspectDetail({
  prospect, onBack, onEdit, onDelete, onAddPhoto, onDeletePhoto,
  onExportPDF, addingPhoto, exporting,
}: ProspectDetailProps) {
  const [tab, setTab] = useState<'medidas' | 'pruebas' | 'galeria'>('medidas');
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<MeasurementPhoto | null>(null);
  const tier = getScoreTier(prospect.score);

  // Agrupar fotos por categoría
  const photosByCategory: Record<string, MeasurementPhoto[]> = {};
  (prospect.measurementPhotos || []).forEach((p) => {
    if (!photosByCategory[p.category]) photosByCategory[p.category] = [];
    photosByCategory[p.category].push(p);
  });
  Object.keys(photosByCategory).forEach((cat) => {
    photosByCategory[cat].sort((a, b) => b.uploadedAt - a.uploadedAt);
  });

  return (
    <div className="min-h-full pb-32 bg-neutral-950">
      {/* Hero */}
      <div className="relative">
        {prospect.photoURL ? (
          <div className="aspect-[4/3] relative overflow-hidden">
            <img src={prospect.photoURL} alt={prospect.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"></div>
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
            <span className="f-display text-7xl text-neutral-700">
              {prospect.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
        )}

        <div className="absolute top-5 left-5 right-5 flex justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-950/70 backdrop-blur border border-neutral-800 flex items-center justify-center text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm(`¿Borrar a ${prospect.name}?`)) onDelete();
              }}
              className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur border border-red-500/40 flex items-center justify-center text-red-400"
            >
              <Trash2 size={16} />
            </button>
            <button onClick={onEdit} className="bg-lime-400 text-neutral-950 rounded-full px-4 py-2 flex items-center gap-1.5 f-display text-sm tracking-widest">
              <Pencil size={14} strokeWidth={2.5} />
              EDITAR
            </button>
          </div>
        </div>

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
          <p className="f-body text-sm text-neutral-400 mt-1">
            {prospect.club} · {prospect.position} · {prospect.age} años
          </p>
        </div>
      </div>

      {/* Card de identificación con categoría/sexo */}
      {(prospect.basketCategory || prospect.sex) && (
        <div className="px-5 pt-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid grid-cols-2 gap-3">
            <div>
              <div className="f-mono text-[9px] tracking-widest uppercase text-neutral-500 mb-1">Categoría</div>
              <div className="f-display text-2xl text-white leading-none">
                {prospect.basketCategory ? prospect.basketCategory.toUpperCase() : '—'}
              </div>
              <div className="f-body text-[11px] text-neutral-500 mt-0.5">
                {prospect.basketCategory ? labelOfBasketCategory(prospect.basketCategory) : ''}
              </div>
            </div>
            <div>
              <div className="f-mono text-[9px] tracking-widest uppercase text-neutral-500 mb-1">Sexo</div>
              <div className="f-display text-2xl text-white leading-none">
                {prospect.sex || '—'}
              </div>
              <div className="f-body text-[11px] text-neutral-500 mt-0.5">
                {prospect.sex ? labelOfSex(prospect.sex) : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 pt-4 pb-2 sticky top-0 bg-neutral-950 z-10 border-b border-neutral-900">
        <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-full p-1">
          {[
            { key: 'medidas', label: 'Medidas', icon: Ruler },
            { key: 'pruebas', label: 'Pruebas', icon: BarChart3 },
            { key: 'galeria', label: 'Galería', icon: ImageIcon },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex-1 py-2 rounded-full f-body text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  tab === t.key ? 'bg-lime-400 text-neutral-950' : 'text-neutral-400'
                }`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido tabs */}
      <div className="px-5 pt-5">
        {tab === 'medidas' && (
          <div className="space-y-3 animate-slide-up">
            <DetailGroup title="Antropometría">
              <DetailRow label="Estatura" value={prospect.heightCm} unit="cm" />
              <DetailRow label="Peso" value={prospect.weight} unit="kg" />
              <DetailRow label="% Grasa" value={prospect.bodyFat} unit="%" />
              <DetailRow label="Envergadura" value={prospect.wingspan} unit="cm" />
              <DetailRow label="Cintura" value={prospect.waist} unit="cm" />
              <DetailRow label="Caderas" value={prospect.hips} unit="cm" />
            </DetailGroup>
            {prospect.heightCm && prospect.wingspan && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                  <TrendingUp size={14} />
                  <span className="f-mono text-[10px] tracking-widest uppercase">Ratio Wingspan</span>
                </div>
                <div className="f-display text-2xl text-lime-400">
                  {(parseFloat(prospect.wingspan) / parseFloat(prospect.heightCm)).toFixed(2)}
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
              <DetailRow label="Tolerancia Frustración" value={prospect.frustrationTolerance} unit="/5" />
            </DetailGroup>
          </div>
        )}

        {tab === 'galeria' && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <p className="f-body text-xs text-neutral-500">
                {(prospect.measurementPhotos || []).length} fotos · agrupadas por ángulo
              </p>
              <button
                onClick={() => setShowAddPhoto(true)}
                className="bg-lime-400 text-neutral-950 rounded-full px-3 py-1.5 flex items-center gap-1 f-display text-xs tracking-widest"
              >
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
                  Añade fotos por ángulo para comparar evolución.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(photosByCategory).map(([cat, photos]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="f-display text-lg text-white tracking-wide">{labelOfCategory(cat)}</h4>
                      <span className="f-mono text-[10px] text-neutral-500">
                        {photos.length} foto{photos.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLightboxPhoto(p)}
                          className="aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 active:scale-95 transition-transform relative"
                        >
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

      {/* FAB Exportar PDF */}
      <button
        onClick={onExportPDF}
        disabled={exporting}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white text-neutral-950 rounded-full pl-5 pr-6 py-4 flex items-center gap-2 shadow-2xl active:scale-95 transition-transform disabled:opacity-70"
        style={{ maxWidth: 'calc(100% - 40px)' }}
      >
        {exporting ? (
          <>
            <Loader2 size={18} strokeWidth={2.5} className="spin" />
            <span className="f-display text-lg tracking-wide">GENERANDO PDF...</span>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-lime-400 flex items-center justify-center">
              <FileDown size={16} className="text-neutral-950" strokeWidth={3} />
            </div>
            <span className="f-display text-lg tracking-wide">EXPORTAR PDF</span>
          </>
        )}
      </button>

      {/* Modales */}
      {showAddPhoto && (
        <AddPhotoModal
          uploading={addingPhoto}
          onClose={() => setShowAddPhoto(false)}
          onSubmit={async (payload) => {
            await onAddPhoto(payload);
            setShowAddPhoto(false);
          }}
        />
      )}
      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          onDelete={() => {
            onDeletePhoto(lightboxPhoto);
            setLightboxPhoto(null);
          }}
        />
      )}
    </div>
  );
}