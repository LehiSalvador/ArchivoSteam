"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRoleLevel, getUser, atLeast, logAudit, type RoleLevel } from "@/lib/auth";
import { slugify, archiveSlug } from "@/lib/slug";
import { fetchYoutubeMeta } from "@/lib/youtube";
import type { CatalogKind } from "@/lib/admin/queries";

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };
type Res<T = object> = Ok<T> | Err;
type ManagedRole = "MEMBER" | "EDITOR" | "ADMIN" | "OWNER";

async function guard(
  min: RoleLevel,
): Promise<{ ok: true; userId: string; level: RoleLevel } | Err> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };
  const level = await getRoleLevel();
  if (!atLeast(level, min)) return { ok: false, error: "No tienes permisos para esta acción." };
  return { ok: true, userId: user.id, level };
}

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/biblioteca");
  revalidatePath("/recorridos");
  if (slug) revalidatePath(`/archivo/${slug}`);
}

// ── YouTube ───────────────────────────────────────────────────────────────────
export async function importYoutubeAction(urlOrId: string): Promise<Res<{ meta: unknown }>> {
  const g = await guard("EDITOR");
  if (!g.ok) return g;
  const r = await fetchYoutubeMeta(urlOrId);
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, meta: r.meta };
}

// ── Archivos ────────────────────────────────────────────────────────────────
const ARCHIVE_FIELDS = new Set([
  "title", "subtitle", "short_description", "card_description", "highlight_phrase",
  "summary", "research", "applications", "transcript",
  "youtube_video_id", "youtube_url", "youtube_channel", "youtube_thumbnail_url",
  "video_published_at", "duration_seconds", "chapters",
  "person_id", "city_id", "institution_id", "primary_discipline_id",
  "is_featured", "is_trending", "visibility", "scheduled_at",
  "youtube_raw", "youtube_stats", "youtube_synced_at",
]);

export async function createArchiveAction(input: {
  title: string;
  personId?: string | null;
  youtube?: {
    videoId: string; url?: string; channel?: string; thumbnailUrl?: string;
    publishedAt?: string | null; durationSeconds?: number; chapters?: unknown; raw?: unknown;
  } | null;
}): Promise<Res<{ id: string; slug: string }>> {
  const g = await guard("EDITOR");
  if (!g.ok) return g;
  const supabase = await createClient();

  const title = input.title.trim();
  if (!title) return { ok: false, error: "El título es obligatorio." };

  const { data: maxRow } = await supabase
    .from("archives")
    .select("archive_number")
    .order("archive_number", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  const nextNumber = (maxRow?.archive_number ?? 0) + 1;

  let slug = archiveSlug(nextNumber, title);
  const { data: clash } = await supabase.from("archives").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const yt = input.youtube;
  const { data, error } = await supabase
    .from("archives")
    .insert({
      archive_number: nextNumber,
      slug,
      title,
      status: "DRAFT",
      person_id: input.personId ?? null,
      created_by: g.userId,
      updated_by: g.userId,
      youtube_video_id: yt?.videoId ?? null,
      youtube_url: yt?.url ?? (yt?.videoId ? `https://youtu.be/${yt.videoId}` : null),
      youtube_channel: yt?.channel ?? null,
      youtube_thumbnail_url: yt?.thumbnailUrl ?? null,
      video_published_at: yt?.publishedAt ?? null,
      duration_seconds: yt?.durationSeconds ?? null,
      chapters: (yt?.chapters ?? []) as never,
      youtube_raw: (yt?.raw ?? null) as never,
      youtube_synced_at: yt ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error) return { ok: false, error: error.message };
  await logAudit({ action: "CREATE", entityType: "archives", entityId: data.id, newValues: { title, slug } });
  revalidatePath("/admin/archivos");
  return { ok: true, id: data.id, slug: data.slug };
}

export async function updateArchiveAction(
  id: string,
  patch: Record<string, unknown>,
): Promise<Res> {
  const g = await guard("EDITOR");
  if (!g.ok) return g;
  const clean: Record<string, unknown> = { updated_by: g.userId };
  for (const [k, v] of Object.entries(patch)) if (ARCHIVE_FIELDS.has(k)) clean[k] = v;

  const supabase = await createClient();
  const { error } = await supabase.from("archives").update(clean as never).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setClassificationAction(
  id: string,
  sel: { topicIds?: string[]; collectionIds?: string[]; tourIds?: string[] },
): Promise<Res> {
  const g = await guard("EDITOR");
  if (!g.ok) return g;
  const supabase = await createClient();

  if (sel.topicIds) {
    await supabase.from("archive_topics").delete().eq("archive_id", id);
    if (sel.topicIds.length)
      await supabase.from("archive_topics").insert(sel.topicIds.map((t) => ({ archive_id: id, topic_id: t })));
  }
  if (sel.collectionIds) {
    await supabase.from("archive_collections").delete().eq("archive_id", id);
    if (sel.collectionIds.length)
      await supabase
        .from("archive_collections")
        .insert(sel.collectionIds.map((c, i) => ({ archive_id: id, collection_id: c, sort_order: i })));
  }
  if (sel.tourIds) {
    await supabase.from("archive_tours").delete().eq("archive_id", id);
    if (sel.tourIds.length)
      await supabase
        .from("archive_tours")
        .insert(sel.tourIds.map((t, i) => ({ archive_id: id, tour_id: t, sort_order: i })));
  }
  return { ok: true };
}

export type ArchiveTransition =
  | "ready" | "publish" | "unpublish" | "schedule" | "archive" | "restore" | "soft_delete";

export async function transitionArchiveAction(
  id: string,
  action: ArchiveTransition,
  opts?: { scheduledAt?: string; reason?: string },
): Promise<Res<{ status: string }>> {
  // Publicar / programar / archivar / borrar => ADMIN. Otras => staff.
  const needsAdmin = ["publish", "unpublish", "schedule", "archive", "soft_delete"].includes(action);
  const g = await guard(needsAdmin ? "ADMIN" : "EDITOR");
  if (!g.ok) return g;

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("archives")
    .select("slug, status, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Archivo no encontrado." };

  const patch: Record<string, unknown> = { updated_by: g.userId };
  let status = current.status;
  switch (action) {
    case "ready": status = "READY"; break;
    case "publish":
      status = "PUBLISHED";
      patch.published_at = current.published_at ?? new Date().toISOString();
      patch.archived_at = null; patch.deleted_at = null;
      break;
    case "unpublish": status = "DRAFT"; break;
    case "schedule":
      status = "SCHEDULED";
      patch.scheduled_at = opts?.scheduledAt ?? null;
      break;
    case "archive": status = "ARCHIVED"; patch.archived_at = new Date().toISOString(); break;
    case "restore": status = "DRAFT"; patch.archived_at = null; patch.deleted_at = null; break;
    case "soft_delete": patch.deleted_at = new Date().toISOString(); break;
  }
  patch.status = status;

  const { error } = await supabase.from("archives").update(patch as never).eq("id", id);
  if (error) return { ok: false, error: error.message };

  const actionMap: Record<ArchiveTransition, string> = {
    ready: "UPDATE", publish: "PUBLISH", unpublish: "UNPUBLISH", schedule: "UPDATE",
    archive: "ARCHIVE", restore: "RESTORE", soft_delete: "SOFT_DELETE",
  };
  await logAudit({
    action: actionMap[action],
    entityType: "archives",
    entityId: id,
    oldValues: { status: current.status },
    newValues: { status },
    reason: opts?.reason ?? null,
  });
  revalidatePublic(current.slug);
  revalidatePath("/admin/archivos");
  return { ok: true, status };
}

// ── Personas ──────────────────────────────────────────────────────────────
export async function upsertPersonAction(input: {
  id?: string; full_name: string; display_name?: string; headline?: string;
  bio?: string; short_bio?: string; photo_url?: string; city_id?: string | null;
  institution_id?: string | null; primary_discipline_id?: string | null; is_public?: boolean;
}): Promise<Res<{ id: string }>> {
  const g = await guard("EDITOR");
  if (!g.ok) return g;
  const supabase = await createClient();
  const full = input.full_name.trim();
  if (!full) return { ok: false, error: "El nombre es obligatorio." };

  const row = {
    full_name: full,
    display_name: input.display_name?.trim() || full,
    headline: input.headline ?? null,
    bio: input.bio ?? null,
    short_bio: input.short_bio ?? null,
    photo_url: input.photo_url ?? null,
    city_id: input.city_id ?? null,
    institution_id: input.institution_id ?? null,
    primary_discipline_id: input.primary_discipline_id ?? null,
    is_public: input.is_public ?? true,
    updated_by: g.userId,
  };

  if (input.id) {
    const { error } = await supabase.from("people").update(row).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ action: "UPDATE", entityType: "people", entityId: input.id });
    return { ok: true, id: input.id };
  }
  const { data, error } = await supabase
    .from("people")
    .insert({ ...row, slug: `${slugify(full)}-${Date.now().toString(36).slice(-4)}`, created_by: g.userId })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: "CREATE", entityType: "people", entityId: data.id, newValues: { full } });
  return { ok: true, id: data.id };
}

export async function softDeletePersonAction(id: string): Promise<Res> {
  const g = await guard("ADMIN");
  if (!g.ok) return g;
  const supabase = await createClient();
  const { error } = await supabase
    .from("people")
    .update({ deleted_at: new Date().toISOString(), is_public: false })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: "SOFT_DELETE", entityType: "people", entityId: id });
  return { ok: true };
}

// ── Catálogos (cities/institutions/disciplines/topics/collections/tours) ──────
export async function upsertCatalogAction(
  kind: CatalogKind,
  input: { id?: string; name: string; description?: string; extra?: Record<string, unknown> },
): Promise<Res<{ id: string }>> {
  const g = await guard("EDITOR");
  if (!g.ok) return g;
  const supabase = await createClient();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  const nameField = kind === "collections" ? "title" : "name";
  const row: Record<string, unknown> = { [nameField]: name, ...(input.extra ?? {}) };
  if (kind === "collections" || kind === "tours" || kind === "topics") row.description = input.description ?? null;

  if (input.id) {
    const { error } = await supabase.from(kind).update(row as never).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: input.id };
  }
  row.slug = `${slugify(name)}-${Date.now().toString(36).slice(-4)}`;
  const { data, error } = await supabase.from(kind).insert(row as never).select("id").single();
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: "CREATE", entityType: kind, entityId: (data as { id: string }).id });
  return { ok: true, id: (data as { id: string }).id };
}

export async function deleteCatalogAction(kind: CatalogKind, id: string): Promise<Res> {
  const g = await guard("ADMIN");
  if (!g.ok) return g;
  const supabase = await createClient();
  const { error } = await supabase.from(kind).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: "SOFT_DELETE", entityType: kind, entityId: id });
  return { ok: true };
}

// ── Documentos (documento + versión de contenido) ────────────────────────────
export async function upsertDocumentAction(input: {
  id?: string; archive_id: string; kind: string; title: string; content: string; is_public?: boolean;
}): Promise<Res<{ id: string }>> {
  const g = await guard("EDITOR");
  if (!g.ok) return g;
  const supabase = await createClient();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "El título del documento es obligatorio." };

  let docId = input.id;
  if (docId) {
    await supabase.from("documents").update({ title, kind: input.kind, is_public: input.is_public ?? true, updated_by: g.userId }).eq("id", docId);
  } else {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        archive_id: input.archive_id, kind: input.kind, title,
        slug: slugify(title) || input.kind.toLowerCase(),
        is_public: input.is_public ?? true, created_by: g.userId, updated_by: g.userId,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    docId = data.id;
  }

  // Nueva versión actual (historial append-only).
  await supabase.from("document_versions").update({ is_current: false }).eq("document_id", docId).eq("is_current", true);
  const { data: last } = await supabase
    .from("document_versions").select("version_number").eq("document_id", docId)
    .order("version_number", { ascending: false }).limit(1).maybeSingle();
  const { error: vErr } = await supabase.from("document_versions").insert({
    document_id: docId, version_number: (last?.version_number ?? 0) + 1,
    content: input.content, content_format: "markdown", is_current: true, created_by: g.userId,
  });
  if (vErr) return { ok: false, error: vErr.message };
  await logAudit({ action: input.id ? "UPDATE" : "CREATE", entityType: "documents", entityId: docId });
  return { ok: true, id: docId };
}

// ── Usuarios y roles ─────────────────────────────────────────────────────────
export async function assignRoleAction(userId: string, role: ManagedRole): Promise<Res> {
  const g = await guard("ADMIN");
  if (!g.ok) return g;
  if (role === "OWNER" && g.level !== "OWNER")
    return { ok: false, error: "Solo el propietario puede asignar OWNER." };

  const supabase = await createClient();
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role, granted_by: g.userId });
  if (error && !/duplicate key/i.test(error.message)) return { ok: false, error: error.message };
  await logAudit({ action: "ROLE_CHANGE", entityType: "user_roles", entityId: userId, newValues: { grant: role } });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function revokeRoleAction(userId: string, role: ManagedRole): Promise<Res> {
  const g = await guard("ADMIN");
  if (!g.ok) return g;
  if (role === "OWNER") return { ok: false, error: "El rol OWNER no se revoca desde el panel." };
  if (role === "MEMBER") return { ok: false, error: "MEMBER es el rol base; no se revoca." };

  const supabase = await createClient();
  // No degradar al último ADMIN/OWNER accidentalmente: se permite pero auditado.
  const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: "ROLE_CHANGE", entityType: "user_roles", entityId: userId, newValues: { revoke: role } });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

// ── Configuración del sitio ──────────────────────────────────────────────────
export async function updateSettingAction(key: string, value: unknown, isPublic = true): Promise<Res> {
  const g = await guard("ADMIN");
  if (!g.ok) return g;
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: value as never, is_public: isPublic, updated_by: g.userId });
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: "SETTINGS_CHANGE", entityType: "site_settings", entityId: null, newValues: { key } });
  revalidatePublic();
  return { ok: true };
}
