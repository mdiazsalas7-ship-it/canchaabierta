// =========================================================
// TYPES — Scout Ball
// =========================================================

export interface MeasurementPhoto {
    url: string;
    category: string;
    notes: string;
    uploadedAt: number;
  }
  
  export interface FormData {
    photo: string | null;
    name: string;
    birthDate: string;
    club: string;
    position: string;
    sex: string;
    basketCategory: string;
    height: string;
    weight: string;
    bodyFat: string;
    wingspan: string;
    waist: string;
    hips: string;
    enduranceTest: string;
    sprint20m: string[];
    flexibility: string[];
    verticalReach: string;
    verticalJump: string[];
    pushups: string;
    agility: string[];
    shooting: number;
    ballHandling: number;
    decisionMaking: number;
    defense: number;
    leadership: number;
    workEthic: number;
    frustrationTolerance: number;
  }
  
  export interface Prospect extends FormData {
    id: string;
    age: number;
    score: number;
    height: string;
    heightCm: string;
    photoURL: string | null;
    measurementPhotos: MeasurementPhoto[];
    date: string;
    bestSprint20m?: number | null;
    bestFlexibility?: number | null;
    bestVerticalJump?: number | null;
    bestAgility?: number | null;
    generalScore?: number;
    createdAt?: any;
    updatedAt?: any;
  }
  
  export interface ScoreTier {
    tier: 'high' | 'medium' | 'low';
    label: string;
    dot: string;
    text: string;
    bar: string;
    color: string;
  }
  
  export interface ToastState {
    type: 'success' | 'error';
    message: string;
  }
  
  export type View = 'dashboard' | 'detail' | 'form';