import type { Prospect, ScoreTier, FormData } from '../types';

// =========================================================
// LIB — Helpers compartidos
// =========================================================

export const getScoreTier = (score: number): ScoreTier => {
  if (score >= 80)
    return {
      tier: 'high',
      label: 'ALTO POTENCIAL',
      dot: 'bg-lime-400',
      text: 'text-lime-400',
      bar: 'bg-lime-400',
      color: '#84cc16',
    };
  if (score >= 65)
    return {
      tier: 'medium',
      label: 'EN OBSERVACIÓN',
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      bar: 'bg-amber-400',
      color: '#f59e0b',
    };
  return {
    tier: 'low',
    label: 'BAJO POTENCIAL',
    dot: 'bg-red-500',
    text: 'text-red-500',
    bar: 'bg-red-500',
    color: '#ef4444',
  };
};

// Mapea un documento de Firestore al shape que usa la UI
export const mapFirestoreDoc = (d: any): Prospect => {
  const data = d.data();
  const today = new Date();
  return {
    id: d.id,
    ...data,
    name: data.name || 'Sin nombre',
    position: data.position || 'N/A',
    sex: data.sex || '',
    basketCategory: data.basketCategory || '',
    age: data.birthDate ? today.getFullYear() - new Date(data.birthDate).getFullYear() : 0,
    score: data.generalScore || 0,
    height: data.height ? (parseFloat(data.height) / 100).toFixed(2) : '—',
    heightCm: data.height || '',
    club: data.club || 'Por asignar',
    photoURL: data.photoURL || null,
    measurementPhotos: data.measurementPhotos || [],
    date: data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()
      : '—',
  };
};

// Convierte Prospect → FormData (para edición)
export const prospectToFormData = (p: Prospect): FormData => ({
  photo: p.photoURL || null,
  name: p.name || '',
  birthDate: p.birthDate || '',
  club: p.club || '',
  position: p.position || '',
  sex: p.sex || '',
  basketCategory: p.basketCategory || '',
  height: p.heightCm || '',
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

// FormData inicial vacío
export const EMPTY_FORM: FormData = {
  photo: null,
  name: '',
  birthDate: '',
  club: '',
  position: '',
  sex: '',
  basketCategory: '',
  height: '',
  weight: '',
  bodyFat: '',
  wingspan: '',
  waist: '',
  hips: '',
  enduranceTest: '',
  sprint20m: ['', ''],
  flexibility: ['', ''],
  verticalReach: '',
  verticalJump: ['', ''],
  pushups: '',
  agility: ['', ''],
  shooting: 0,
  ballHandling: 0,
  decisionMaking: 0,
  defense: 0,
  leadership: 0,
  workEthic: 0,
  frustrationTolerance: 0,
};

// Calcula el mejor valor de un array (para multi-intentos)
export const bestOf = (arr: any[], lowerIsBetter = false): number | null => {
  const nums = arr.map((v: any) => parseFloat(v)).filter((v: number) => !isNaN(v));
  if (nums.length === 0) return null;
  return lowerIsBetter ? Math.min(...nums) : Math.max(...nums);
};