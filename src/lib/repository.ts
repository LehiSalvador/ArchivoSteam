// Capa de acceso a datos (seam) — Fase 2: consultas reales a Supabase.
// SOLO servidor. Las páginas públicas son Server Components que consumen estas
// funciones async. El sitio público muestra ÚNICAMENTE contenido PUBLISHED:
// el filtro de estado es EXPLÍCITO (no depende solo de RLS), de modo que un
// miembro del staff con sesión tampoco ve borradores al navegar el sitio.
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { formatArchiveNumber } from "@/lib/slug";
import type { Archive, City, Collection, DisciplineKey, Chapter, TranscriptTurn, Source } from "@/types/domain";

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : (v ?? undefined);
}

const LIST_SELECT =
  "id, archive_number, slug, title, short_description, card_description, summary, " +
  "duration_seconds, published_at, video_published_at, youtube_thumbnail_url, youtube_stats, " +
  "is_featured, is_trending, chapters, " +
  "person:people(display_name, full_name, headline, bio), " +
  "city:cities(id, name), discipline:disciplines(slug, name), institution:institutions(name), " +
  "archive_topics(topic:topics(name)), archive_collections(collection_id)";

type Row = Record<string, unknown>;

function mapRow(r: Row): Archive {
  const person = one(r.person as Row | Row[]);
  const city = one(r.city as Row | Row[]);
  const disc = one(r.discipline as Row | Row[]);
  const inst = one(r.institution as Row | Row[]);
  const n = (r.archive_number as number) ?? 0;
  const durSec = (r.duration_seconds as number) ?? 0;
  const stats = (r.youtube_stats as { viewCount?: number } | null) ?? null;
  const topics = ((r.archive_topics as { topic: Row | Row[] }[]) ?? [])
    .map((t) => one(t.topic)?.name as string)
    .filter(Boolean);
  const cols = ((r.archive_collections as { collection_id: string }[]) ?? []).map((c) => c.collection_id);
  const discSlug = (disc?.slug as string) ?? "";

  return {
    n,
    slug: (r.slug as string) ?? "",
    numStr: formatArchiveNumber(n),
    name: (person?.display_name as string) || (person?.full_name as string) || "—",
    role: (person?.headline as string) ?? "",
    inst: (inst?.name as string) ?? "",
    city: (city?.id as string) ?? "",
    cityName: (city?.name as string) ?? "",
    disc: (discSlug ? [discSlug] : []) as DisciplineKey[],
    discLabel: (disc?.name as string) ?? "",
    topics,
    cols,
    title: (r.title as string) ?? "",
    summary: (r.card_description as string) || (r.short_description as string) || (r.summary as string) || "",
    durMin: Math.max(0, Math.round(durSec / 60)),
    rec: (r.video_published_at as string) ?? "",
    pub: (r.published_at as string) ?? "",
    views: stats?.viewCount ?? 0,
    listens: 0,
    saves: 0,
    trend: r.is_trending ? 1 : 0,
    audio: "NOT_REQUESTED",
    thumb: (r.youtube_thumbnail_url as string) ?? "",
    persona: (person?.bio as string) ?? "",
    investig: "",
    aplic: "",
    chapters: ((r.chapters as Chapter[]) ?? []) as Chapter[],
    transcript: [],
    fuentes: [],
  };
}

export async function getArchives(): Promise<Archive[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archives")
    .select(LIST_SELECT)
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .order("archive_number", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as unknown as Row));
}

export async function getNewArchives(limit = 6): Promise<Archive[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archives")
    .select(LIST_SELECT)
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []).map((r) => mapRow(r as unknown as Row));
}

export async function getTrending(limit = 4): Promise<Archive[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archives")
    .select(LIST_SELECT)
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .order("is_trending", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []).map((r) => mapRow(r as unknown as Row));
}

async function hydrateDetail(supabase: Awaited<ReturnType<typeof createClient>>, data: Row): Promise<Archive> {
  const base = mapRow(data);
  const id = data.id as string;

  // Detalle: documentos (investigación/aplicaciones/persona) + fuentes.
  const [{ data: docs }, { data: srcRows }] = await Promise.all([
    supabase.from("documents").select("kind, document_versions(content, is_current)").eq("archive_id", id).eq("is_public", true),
    supabase
      .from("document_sources")
      .select("source:sources(title, url, author, publisher, source_type), document:documents(archive_id)")
      .limit(50),
  ]);

  const contentFor = (kind: string): string => {
    const d = (docs ?? []).find((x) => (x as Row).kind === kind) as Row | undefined;
    if (!d) return "";
    const versions = ((d.document_versions as { content: string; is_current: boolean }[]) ?? []).filter((v) => v.is_current);
    return versions[0]?.content ?? "";
  };

  const fuentes: Source[] = ((srcRows ?? []) as Row[])
    .filter((rw) => one(rw.document as Row | Row[])?.archive_id === id)
    .map((rw) => {
      const s = one(rw.source as Row | Row[]);
      return {
        kind: (s?.source_type as string) ?? "Fuente",
        title: (s?.title as string) ?? "",
        meta: [s?.author, s?.publisher].filter(Boolean).join(" · "),
      };
    });

  return {
    ...base,
    investig: (data.research as string) || contentFor("RESEARCH"),
    aplic: (data.applications as string) || contentFor("APPLICATIONS"),
    persona: base.persona || contentFor("PERSON"),
    transcript: parseTranscript(data.transcript as string | null),
    fuentes,
  };
}

export async function getArchiveBySlug(slug: string): Promise<Archive | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archives")
    .select(`${LIST_SELECT}, research, applications, transcript`)
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return undefined;
  return hydrateDetail(supabase, data as unknown as Row);
}

/** Vista previa de staff: carga por id SIN filtrar estado. La página exige staff. */
export async function getArchiveByIdPreview(id: string): Promise<Archive | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archives")
    .select(`${LIST_SELECT}, research, applications, transcript`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return undefined;
  return hydrateDetail(supabase, data as unknown as Row);
}

function parseTranscript(text: string | null): TranscriptTurn[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => ({ time: "", sp: "", text: para }));
}

export async function getCities(): Promise<City[]> {
  const supabase = await createClient();
  const [{ data: cities }, { data: counts }] = await Promise.all([
    supabase.from("cities").select("id, name, region").order("name"),
    supabase.from("archives").select("city_id").eq("status", "PUBLISHED").is("deleted_at", null),
  ]);
  const countBy = new Map<string, number>();
  for (const c of counts ?? []) {
    const cid = (c as Row).city_id as string | null;
    if (cid) countBy.set(cid, (countBy.get(cid) ?? 0) + 1);
  }
  return (cities ?? []).map((c) => {
    const row = c as Row;
    return {
      id: row.id as string,
      name: row.name as string,
      tag: (row.region as string) ?? "",
      intro: "",
      count: countBy.get(row.id as string) ?? 0,
    };
  });
}

export async function getCityById(id: string): Promise<City | undefined> {
  return (await getCities()).find((c) => c.id === id);
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const [{ data: collections }, { data: links }] = await Promise.all([
    supabase.from("collections").select("id, title, description, cover_url").eq("is_public", true).order("sort_order"),
    supabase.from("archive_collections").select("collection_id"),
  ]);
  const countBy = new Map<string, number>();
  for (const l of links ?? []) {
    const cid = (l as Row).collection_id as string;
    countBy.set(cid, (countBy.get(cid) ?? 0) + 1);
  }
  return (collections ?? []).map((c) => {
    const row = c as Row;
    return {
      id: row.id as string,
      title: row.title as string,
      desc: (row.description as string) ?? "",
      bg: (row.cover_url as string) ? `center/cover url(${row.cover_url})` : "linear-gradient(160deg,#221d15,#120f09)",
      count: countBy.get(row.id as string) ?? 0,
    };
  });
}

export async function getCollectionById(id: string): Promise<Collection | undefined> {
  return (await getCollections()).find((c) => c.id === id);
}

export async function getDisciplines(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("disciplines").select("slug, name").order("name");
  const out: Record<string, string> = {};
  for (const d of data ?? []) out[(d as Row).slug as string] = (d as Row).name as string;
  return out;
}

export async function getRelated(a: Archive, limit = 3): Promise<Archive[]> {
  const all = await getArchives();
  return all
    .filter((x) => x.n !== a.n && (x.city === a.city || x.disc.some((d) => a.disc.includes(d))))
    .slice(0, limit);
}
