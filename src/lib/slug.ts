// Utilidades de slug y número consecutivo de archivo.

const COMBINING = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(COMBINING, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Número de archivo formateado a 3 dígitos (001, 042, 128). */
export function formatArchiveNumber(n: number): string {
  return String(n).padStart(3, "0");
}

/** Slug de archivo: "042-nombre-persona". */
export function archiveSlug(n: number, name: string): string {
  const base = slugify(name);
  return `${formatArchiveNumber(n)}${base ? `-${base}` : ""}`;
}
