-- Archivo STEAM — Fase 2
-- 0011 · Acceso del personal (RLS por rol + GRANTs)
--
-- Modelo de acceso Fase 2 (defensa en profundidad; se prueba con tokens reales):
--   anon           -> SELECT de lo público (PUBLISHED). Sin escritura.
--   MEMBER (auth)   -> como anon + su perfil/roles. Sin acceso editorial.
--   EDITOR/ADMIN/OWNER (staff) -> lectura total + escritura editorial.
--   user_roles      -> ADMIN gestiona roles salvo OWNER; OWNER gestiona todo.
--   site_settings   -> escritura solo ADMIN/OWNER.
--   audit_logs      -> lectura staff; inserción propia (actor = usuario).
-- Las transiciones finas (publicar = ADMIN, no degradar al OWNER inicial) se
-- refuerzan además en las Server Actions.

-- Las políticas *_public_read de Fase 1 se conservan (PERMISSIVE => se combinan
-- con OR). Aquí se AÑADEN políticas de staff.

-- ── GRANTs de escritura para authenticated (RLS restringe filas) ──────────────
grant insert, update, delete on
  public.archives, public.people, public.documents, public.document_versions,
  public.sources, public.document_sources, public.collections, public.topics,
  public.cities, public.institutions, public.disciplines,
  public.archive_topics, public.archive_collections
  to authenticated;

grant select, insert, update, delete on public.tours, public.archive_tours to authenticated;
grant select on public.tours, public.archive_tours to anon;

grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- ── Helper: política de staff (lectura total + escritura) para una tabla ──────
-- Se escribe explícita por tabla para mantener claridad y auditabilidad.

-- archives
drop policy if exists archives_staff_read on public.archives;
create policy archives_staff_read on public.archives
  for select to authenticated using (public.is_staff());
drop policy if exists archives_staff_insert on public.archives;
create policy archives_staff_insert on public.archives
  for insert to authenticated with check (public.is_staff());
drop policy if exists archives_staff_update on public.archives;
create policy archives_staff_update on public.archives
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists archives_staff_delete on public.archives;
create policy archives_staff_delete on public.archives
  for delete to authenticated using (public.is_admin());

-- people
drop policy if exists people_staff_read on public.people;
create policy people_staff_read on public.people
  for select to authenticated using (public.is_staff());
drop policy if exists people_staff_write on public.people;
create policy people_staff_write on public.people
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- documents
drop policy if exists documents_staff_read on public.documents;
create policy documents_staff_read on public.documents
  for select to authenticated using (public.is_staff());
drop policy if exists documents_staff_write on public.documents;
create policy documents_staff_write on public.documents
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- document_versions
drop policy if exists docver_staff_read on public.document_versions;
create policy docver_staff_read on public.document_versions
  for select to authenticated using (public.is_staff());
drop policy if exists docver_staff_write on public.document_versions;
create policy docver_staff_write on public.document_versions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- sources / document_sources
drop policy if exists sources_staff_read on public.sources;
create policy sources_staff_read on public.sources
  for select to authenticated using (public.is_staff());
drop policy if exists sources_staff_write on public.sources;
create policy sources_staff_write on public.sources
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists docsrc_staff_write on public.document_sources;
create policy docsrc_staff_write on public.document_sources
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- catálogos: collections, topics, cities, institutions, disciplines
drop policy if exists collections_staff_write on public.collections;
create policy collections_staff_write on public.collections
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists topics_staff_write on public.topics;
create policy topics_staff_write on public.topics
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists cities_staff_write on public.cities;
create policy cities_staff_write on public.cities
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists institutions_staff_write on public.institutions;
create policy institutions_staff_write on public.institutions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists disciplines_staff_write on public.disciplines;
create policy disciplines_staff_write on public.disciplines
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- joins archive_topics / archive_collections
drop policy if exists archtopics_staff_write on public.archive_topics;
create policy archtopics_staff_write on public.archive_topics
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists archcol_staff_write on public.archive_collections;
create policy archcol_staff_write on public.archive_collections
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── Recorridos (tours) ────────────────────────────────────────────────────────
alter table public.tours         enable row level security;
alter table public.archive_tours enable row level security;

drop policy if exists tours_public_read on public.tours;
create policy tours_public_read on public.tours
  for select to anon, authenticated using (is_public);
drop policy if exists tours_staff_read on public.tours;
create policy tours_staff_read on public.tours
  for select to authenticated using (public.is_staff());
drop policy if exists tours_staff_write on public.tours;
create policy tours_staff_write on public.tours
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists archtours_public_read on public.archive_tours;
create policy archtours_public_read on public.archive_tours
  for select to anon, authenticated
  using (
    exists (select 1 from public.archives a
            where a.id = archive_id and a.status = 'PUBLISHED' and a.deleted_at is null)
    and exists (select 1 from public.tours t where t.id = tour_id and t.is_public));
drop policy if exists archtours_staff_write on public.archive_tours;
create policy archtours_staff_write on public.archive_tours
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── profiles: lectura del personal (gestión de usuarios) ──────────────────────
drop policy if exists profiles_staff_read on public.profiles;
create policy profiles_staff_read on public.profiles
  for select to authenticated using (public.is_staff());

-- ── user_roles: gestión por ADMIN (salvo OWNER) / OWNER (todo) ────────────────
drop policy if exists user_roles_staff_read on public.user_roles;
create policy user_roles_staff_read on public.user_roles
  for select to authenticated using (public.is_staff());
drop policy if exists user_roles_admin_insert on public.user_roles;
create policy user_roles_admin_insert on public.user_roles
  for insert to authenticated
  with check (public.is_owner() or (public.is_admin() and role <> 'OWNER'));
drop policy if exists user_roles_admin_update on public.user_roles;
create policy user_roles_admin_update on public.user_roles
  for update to authenticated
  using  (public.is_owner() or (public.is_admin() and role <> 'OWNER'))
  with check (public.is_owner() or (public.is_admin() and role <> 'OWNER'));
drop policy if exists user_roles_admin_delete on public.user_roles;
create policy user_roles_admin_delete on public.user_roles
  for delete to authenticated
  using (public.is_owner() or (public.is_admin() and role <> 'OWNER'));

-- ── audit_logs: lectura staff + inserción propia ──────────────────────────────
drop policy if exists audit_staff_read on public.audit_logs;
create policy audit_staff_read on public.audit_logs
  for select to authenticated using (public.is_staff());
drop policy if exists audit_insert_self on public.audit_logs;
create policy audit_insert_self on public.audit_logs
  for insert to authenticated
  with check (public.is_staff() and actor_id = (select auth.uid()));

-- ── site_settings: escritura ADMIN/OWNER + lectura staff (privadas incluidas) ─
drop policy if exists site_settings_staff_read on public.site_settings;
create policy site_settings_staff_read on public.site_settings
  for select to authenticated using (public.is_staff());
drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
