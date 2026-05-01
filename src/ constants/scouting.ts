// =========================================================
// CONSTANTES DEL SISTEMA — Scout Ball
// =========================================================

export const POSITIONS = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];

export const SEX_OPTIONS = [
  { id: 'M', label: 'Masculino' },
  { id: 'F', label: 'Femenino' },
];

// Categorías oficiales de baloncesto formativo
export const CATEGORIES = [
  { id: 'mini',   label: 'Mini Basket', short: 'MINI'  },
  { id: 'u13',    label: 'Sub-13',       short: 'U13'   },
  { id: 'u14',    label: 'Sub-14',       short: 'U14'   },
  { id: 'u15',    label: 'Sub-15',       short: 'U15'   },
  { id: 'u16',    label: 'Sub-16',       short: 'U16'   },
  { id: 'u17',    label: 'Sub-17',       short: 'U17'   },
  { id: 'u18',    label: 'Sub-18',       short: 'U18'   },
  { id: 'u19',    label: 'Sub-19',       short: 'U19'   },
  { id: 'u20',    label: 'Sub-20',       short: 'U20'   },
  { id: 'mayor',  label: 'Mayor',        short: 'MAYOR' },
];

export const PHOTO_CATEGORIES = [
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

export const labelOfCategory = (id: string) =>
  PHOTO_CATEGORIES.find((c) => c.id === id)?.label || 'Sin categoría';

export const labelOfBasketCategory = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.label || '—';

export const labelOfSex = (id: string) =>
  SEX_OPTIONS.find((s) => s.id === id)?.label || '—';