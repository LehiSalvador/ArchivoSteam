// Capa de acceso a datos (seam).
// FASE 1: lee de los mocks centralizados en src/mocks.
// FASE 3: sustituir el cuerpo de estas funciones por consultas tipadas a
// Supabase (src/lib/supabase) SIN modificar los componentes que las consumen.

import {
  ARCHIVES,
  CITIES,
  COLLECTIONS,
  DISCIPLINES,
  archiveBySlug,
  cityById,
  collectionById,
} from "@/mocks/data";
import type { Archive, City, Collection } from "@/types/domain";

export function getArchives(): Archive[] {
  return ARCHIVES;
}

export function getArchiveBySlug(slug: string): Archive | undefined {
  return archiveBySlug.get(slug);
}

export function getCities(): City[] {
  return CITIES;
}

export function getCityById(id: string): City | undefined {
  return cityById.get(id);
}

export function getCollections(): Collection[] {
  return COLLECTIONS;
}

export function getCollectionById(id: string): Collection | undefined {
  return collectionById.get(id);
}

export function getDisciplines(): Record<string, string> {
  return DISCIPLINES;
}

export function getNewArchives(limit = 6): Archive[] {
  return [...ARCHIVES].sort((a, b) => (b.pub || "").localeCompare(a.pub || "")).slice(0, limit);
}

export function getTrending(limit = 4): Archive[] {
  return [...ARCHIVES].sort((a, b) => b.trend - a.trend).slice(0, limit);
}

export function getRelated(a: Archive, limit = 3): Archive[] {
  return ARCHIVES.filter(
    (x) => x.n !== a.n && (x.city === a.city || x.disc.some((d) => a.disc.includes(d))),
  ).slice(0, limit);
}
