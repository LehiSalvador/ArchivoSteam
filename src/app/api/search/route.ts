// Búsqueda global del sitio público. Devuelve solo contenido PUBLISHED (filtro
// explícito, no solo RLS). Sirve sugerencias cuando no hay término.
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SResult {
  kind: string;
  title: string;
  sub: string;
  href: string;
}

type Row = Record<string, unknown>;

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const supabase = await createClient();

  if (!q) {
    const { data } = await supabase
      .from("collections")
      .select("id, title")
      .eq("is_public", true)
      .order("sort_order")
      .limit(5);
    return NextResponse.json({
      results: [],
      suggestions: (data ?? []).map((c) => ({ label: (c as Row).title as string, href: `/biblioteca?col=${(c as Row).id}` })),
    });
  }

  const like = `%${q}%`;
  const numeric = /^\d+$/.test(q) ? Number(q) : null;

  const archQuery = supabase
    .from("archives")
    .select("slug, archive_number, title, person:people(display_name, full_name)")
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .limit(6);

  const [arch, archByNum, cities, cols] = await Promise.all([
    archQuery.ilike("title", like),
    numeric ? supabase.from("archives").select("slug, archive_number, title, person:people(display_name, full_name)").eq("status", "PUBLISHED").is("deleted_at", null).eq("archive_number", numeric).limit(3) : Promise.resolve({ data: [] }),
    supabase.from("cities").select("id, name, region").ilike("name", like).limit(4),
    supabase.from("collections").select("id, title").eq("is_public", true).ilike("title", like).limit(4),
  ]);

  const results: SResult[] = [];
  const seen = new Set<string>();
  const pushArchive = (r: Row) => {
    if (seen.has(r.slug as string)) return;
    seen.add(r.slug as string);
    const p = r.person as Row | Row[] | null;
    const person = Array.isArray(p) ? p[0] : p;
    const num = r.archive_number ? String(r.archive_number).padStart(3, "0") : "—";
    const name = (person?.display_name as string) || (person?.full_name as string) || "";
    results.push({ kind: "Archivo", title: `${num} · ${name || (r.title as string)}`, sub: r.title as string, href: `/archivo/${r.slug}` });
  };
  ((archByNum.data ?? []) as Row[]).forEach(pushArchive);
  ((arch.data ?? []) as Row[]).forEach(pushArchive);
  ((cities.data ?? []) as Row[]).forEach((c) =>
    results.push({ kind: "Ciudad", title: c.name as string, sub: (c.region as string) ?? "", href: `/recorridos/${c.id}` }),
  );
  ((cols.data ?? []) as Row[]).forEach((c) =>
    results.push({ kind: "Colección", title: c.title as string, sub: "Colección", href: `/biblioteca?col=${c.id}` }),
  );

  return NextResponse.json({ results: results.slice(0, 8), suggestions: [] });
}
