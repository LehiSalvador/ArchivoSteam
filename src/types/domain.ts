// Contratos de dominio de Archivo STEAM.
// Alineados con el esquema de Supabase (Fase 1) para que la Fase 3 sustituya
// los mocks por consultas reales sin rediseñar componentes.

export type DisciplineKey =
  | "sci" | "tec" | "ing" | "art" | "mat" | "med"
  | "sal" | "edu" | "ind" | "emp" | "cul" | "com";

export type AudioState =
  | "NOT_REQUESTED" | "QUEUED" | "PROCESSING" | "READY" | "FAILED" | "OUTDATED";

export interface City {
  id: string;
  name: string;
  tag: string;
  intro: string;
  count: number;
}

export interface Collection {
  id: string;
  title: string;
  desc: string;
  bg: string;
  count: number;
}

export interface Chapter {
  t: number;
  label: string;
}

export interface TranscriptTurn {
  time: string;
  sp: string;
  text: string;
}

export interface Source {
  kind: string;
  title: string;
  meta: string;
}

export interface Archive {
  n: number;
  slug: string;
  numStr: string;
  name: string;
  role: string;
  inst: string;
  city: string;
  cityName: string;
  disc: DisciplineKey[];
  discLabel: string;
  topics: string[];
  cols: string[];
  title: string;
  summary: string;
  durMin: number;
  rec: string;
  pub: string;
  views: number;
  listens: number;
  saves: number;
  trend: number;
  audio: AudioState;
  thumb: string;
  persona: string;
  investig: string;
  aplic: string;
  chapters: Chapter[];
  transcript: TranscriptTurn[];
  fuentes: Source[];
}
