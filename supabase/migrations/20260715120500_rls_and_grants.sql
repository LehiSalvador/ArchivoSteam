-- Archivo STEAM — Fase 1 (cimentación)
-- 0006 · RLS + GRANTs (modelo de acceso base)
--
-- Modelo Fase 1:
--   anon           -> SOLO lectura de lo público (archivos PUBLISHED y datos ligados).
--   authenticated  -> lectura pública + su propio perfil + sus propios roles (lectura).
--   escritura editorial/administrativa -> CERRADA (solo service_role) hasta Fase 2.
--   service_role   -> bypass RLS (uso exclusivo de servidor; jamás en el navegador).
--
-- Nota (cambio Supabase 2026-04-28): las tablas nuevas del esquema public NO se
-- exponen a la Data API automáticamente. Por eso se otorga SELECT explícito a
-- anon/authenticated en las tablas de lectura pública.

-- ── Habilitar RLS en todas las tablas ─────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.user_roles          enable row level security;
alter table public.cities              enable row level security;
alter table public.institutions        enable row level security;
alter table public.disciplines         enable row level security;
alter table public.topics              enable row level security;
alter table public.collections         enable row level security;
alter table public.people              enable row level security;
alter table public.archives            enable row level security;
alter table public.archive_topics      enable row level security;
alter table public.archive_collections enable row level security;
alter table public.documents           enable row level security;
alter table public.document_versions   enable row level security;
alter table public.sources             enable row level security;
alter table public.document_sources    enable row level security;
alter table public.site_settings       enable row level security;
alter table public.audit_logs          enable row level security;

-- ── GRANTs mínimos (exposición explícita a la Data API) ───────────────────────
grant usage on schema public to anon, authenticated;

grant select on
  public.cities, public.institutions, public.disciplines, public.topics,
  public.collections, public.people, public.archives, public.archive_topics,
  public.archive_collections, public.documents, public.document_versions,
  public.sources, public.document_sources, public.site_settings
  to anon, authenticated;

grant select on public.user_roles to authenticated;
grant select, insert, update on public.profiles to authenticated;
-- audit_logs: sin GRANT a anon/authenticated (cerrada).

-- ── Políticas: identidad ──────────────────────────────────────────────────────
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated using ((select auth.uid()) = user_id);
-- Sin políticas de escritura en user_roles: no modificable desde el cliente.

-- ── Políticas: catálogos (lectura pública) ────────────────────────────────────
drop policy if exists cities_public_read on public.cities;
create policy cities_public_read on public.cities
  for select to anon, authenticated using (true);

drop policy if exists institutions_public_read on public.institutions;
create policy institutions_public_read on public.institutions
  for select to anon, authenticated using (true);

drop policy if exists disciplines_public_read on public.disciplines;
create policy disciplines_public_read on public.disciplines
  for select to anon, authenticated using (true);

drop policy if exists topics_public_read on public.topics;
create policy topics_public_read on public.topics
  for select to anon, authenticated using (true);

drop policy if exists collections_public_read on public.collections;
create policy collections_public_read on public.collections
  for select to anon, authenticated using (is_public);

-- ── Políticas: núcleo editorial (solo lo publicado) ───────────────────────────
drop policy if exists people_public_read on public.people;
create policy people_public_read on public.people
  for select to anon, authenticated using (is_public);

drop policy if exists archives_public_read on public.archives;
create policy archives_public_read on public.archives
  for select to anon, authenticated
  using (status = 'PUBLISHED' and deleted_at is null);

drop policy if exists archive_topics_public_read on public.archive_topics;
create policy archive_topics_public_read on public.archive_topics
  for select to anon, authenticated
  using (exists (
    select 1 from public.archives a
    where a.id = archive_id and a.status = 'PUBLISHED' and a.deleted_at is null));

drop policy if exists archive_collections_public_read on public.archive_collections;
create policy archive_collections_public_read on public.archive_collections
  for select to anon, authenticated
  using (
    exists (select 1 from public.archives a
            where a.id = archive_id and a.status = 'PUBLISHED' and a.deleted_at is null)
    and exists (select 1 from public.collections c
                where c.id = collection_id and c.is_public));

drop policy if exists documents_public_read on public.documents;
create policy documents_public_read on public.documents
  for select to anon, authenticated
  using (is_public and exists (
    select 1 from public.archives a
    where a.id = archive_id and a.status = 'PUBLISHED' and a.deleted_at is null));

drop policy if exists document_versions_public_read on public.document_versions;
create policy document_versions_public_read on public.document_versions
  for select to anon, authenticated
  using (is_current and exists (
    select 1 from public.documents d
    join public.archives a on a.id = d.archive_id
    where d.id = document_id and d.is_public
      and a.status = 'PUBLISHED' and a.deleted_at is null));

drop policy if exists sources_public_read on public.sources;
create policy sources_public_read on public.sources
  for select to anon, authenticated
  using (exists (
    select 1 from public.document_sources ds
    join public.documents d on d.id = ds.document_id
    join public.archives a on a.id = d.archive_id
    where ds.source_id = sources.id and d.is_public
      and a.status = 'PUBLISHED' and a.deleted_at is null));

drop policy if exists document_sources_public_read on public.document_sources;
create policy document_sources_public_read on public.document_sources
  for select to anon, authenticated
  using (exists (
    select 1 from public.documents d
    join public.archives a on a.id = d.archive_id
    where d.id = document_id and d.is_public
      and a.status = 'PUBLISHED' and a.deleted_at is null));

-- ── Políticas: sistema ────────────────────────────────────────────────────────
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select to anon, authenticated using (is_public);

-- audit_logs: RLS habilitado y SIN políticas -> negación por defecto (solo service_role).
