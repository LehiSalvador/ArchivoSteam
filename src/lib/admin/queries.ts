// Lecturas del panel administrativo. Usan la sesión del usuario (RLS: el staff
// ve todo). Requieren que el llamador ya haya validado el rol.
import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CatalogKind =
  | "cities"
  | "institutions"
  | "disciplines"
  | "topics"
  | "collections"
  | "tours";

export async function getDashboardStats() {
  const supabase = await createClient();
  const [archives, people, documents] = await Promise.all([
    supabase.from("archives").select("status, deleted_at"),
    supabase.from("people").select("id").is("deleted_at", null),
    supabase.from("documents").select("id, status").is("deleted_at", null),
  ]);

  const rows = archives.data ?? [];
  const live = rows.filter((r) => !r.deleted_at);
  const by = (s: string) => live.filter((r) => r.status === s).length;

  return {
    total: live.length,
    published: by("PUBLISHED"),
    drafts: by("DRAFT"),
    ready: by("READY"),
    scheduled: by("SCHEDULED"),
    correction: by("CORRECTION"),
    archived: rows.filter((r) => r.status === "ARCHIVED" || r.deleted_at).length,
    people: people.data?.length ?? 0,
    documents: documents.data?.length ?? 0,
  };
}

export interface AdminArchiveRow {
  id: string;
  archive_number: number | null;
  slug: string;
  title: string;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  published_at: string | null;
  updated_at: string;
  deleted_at: string | null;
  person_name: string | null;
  city_name: string | null;
}

export async function listArchives(opts?: {
  status?: string;
  q?: string;
  includeDeleted?: boolean;
}): Promise<AdminArchiveRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("archives")
    .select(
      "id, archive_number, slug, title, status, is_featured, is_trending, published_at, updated_at, deleted_at, person:people(full_name), city:cities(name)",
    )
    .order("archive_number", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (opts?.status) query = query.eq("status", opts.status as never);
  if (!opts?.includeDeleted) query = query.is("deleted_at", null);
  if (opts?.q) query = query.ilike("title", `%${opts.q}%`);

  const { data } = await query;
  return (data ?? []).map((r) => {
    const person = r.person as { full_name: string } | { full_name: string }[] | null;
    const city = r.city as { name: string } | { name: string }[] | null;
    const pn = Array.isArray(person) ? person[0]?.full_name : person?.full_name;
    const cn = Array.isArray(city) ? city[0]?.name : city?.name;
    return {
      id: r.id,
      archive_number: r.archive_number,
      slug: r.slug,
      title: r.title,
      status: r.status,
      is_featured: r.is_featured,
      is_trending: r.is_trending,
      published_at: r.published_at,
      updated_at: r.updated_at,
      deleted_at: r.deleted_at,
      person_name: pn ?? null,
      city_name: cn ?? null,
    };
  });
}

export async function getArchiveEditor(id: string) {
  const supabase = await createClient();
  const { data: archive } = await supabase.from("archives").select("*").eq("id", id).maybeSingle();
  if (!archive) return null;

  const [documents, topics, collections, tours] = await Promise.all([
    supabase
      .from("documents")
      .select("id, kind, title, slug, sort_order, status, is_public")
      .eq("archive_id", id)
      .is("deleted_at", null)
      .order("sort_order"),
    supabase.from("archive_topics").select("topic_id").eq("archive_id", id),
    supabase.from("archive_collections").select("collection_id").eq("archive_id", id),
    supabase.from("archive_tours").select("tour_id").eq("archive_id", id),
  ]);

  return {
    archive,
    documents: documents.data ?? [],
    topicIds: (topics.data ?? []).map((t) => t.topic_id),
    collectionIds: (collections.data ?? []).map((c) => c.collection_id),
    tourIds: (tours.data ?? []).map((t) => t.tour_id),
  };
}

export async function listPeople(q?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("people")
    .select("id, slug, full_name, headline, photo_url, is_public, city_id")
    .is("deleted_at", null)
    .order("full_name");
  if (q) query = query.ilike("full_name", `%${q}%`);
  const { data } = await query;
  return data ?? [];
}

export async function listCatalog(kind: CatalogKind) {
  const supabase = await createClient();
  const nameCol = kind === "collections" ? "title" : "name";
  const { data } = await supabase.from(kind).select("*").order(nameCol, { ascending: true });
  return { rows: data ?? [], nameCol };
}

export async function listUsers() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, created_at"),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  const roleMap = new Map<string, string[]>();
  for (const r of roles ?? []) {
    const arr = roleMap.get(r.user_id) ?? [];
    arr.push(r.role);
    roleMap.set(r.user_id, arr);
  }
  return (profiles ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    created_at: p.created_at,
    roles: roleMap.get(p.id) ?? ["MEMBER"],
  }));
}

export async function listAudit(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, actor_id, action, entity_type, entity_id, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
