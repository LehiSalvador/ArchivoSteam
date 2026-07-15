// Helpers puros de formato — portados del diseño aprobado.

// Rango de diacríticos combinantes (U+0300–U+036F). Se construye desde escapes
// ASCII para evitar caracteres combinantes literales en el fuente.
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export const pad3 = (n: number): string => String(n).padStart(3, "0");

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const mmss = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const fmtDate = (s: string): string => {
  const p = (s || "").split("-");
  return p.length >= 2 ? `${MONTHS[parseInt(p[1], 10) - 1] || ""} ${p[0]}` : s;
};

export const thumbBg = (n: number): string => {
  const base = ["#221d15", "#1f1b14", "#241c12"][n % 3];
  return `repeating-linear-gradient(135deg,rgba(201,154,68,.06) 0 2px,transparent 2px 12px),linear-gradient(160deg,${base},#120f09)`;
};

export const norm = (s: string): string =>
  (s || "").toLowerCase().normalize("NFD").replace(DIACRITICS, "");
