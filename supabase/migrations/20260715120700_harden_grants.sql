-- Archivo STEAM — Fase 1 (cimentación)
-- 0008 · Endurecer privilegios (defensa en profundidad / mínimo privilegio)
--
-- Hallazgo: el esquema public de este proyecto conservaba privilegios por
-- defecto amplios; las tablas nuevas recibían GRANT ALL para anon/authenticated.
-- RLS ya bloquea las filas (las escrituras no tienen política => denegadas),
-- pero se revoca todo y se re-otorga únicamente lo intencional, y se evita que
-- futuras tablas hereden privilegios amplios.

revoke all on all tables in schema public from anon, authenticated;

-- Futuras tablas (Fase 2) NO heredan privilegios: deberán otorgarse de forma explícita.
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- Re-otorgar el mínimo intencional (idéntico a 0006_rls_and_grants)
grant usage on schema public to anon, authenticated;

grant select on
  public.cities, public.institutions, public.disciplines, public.topics,
  public.collections, public.people, public.archives, public.archive_topics,
  public.archive_collections, public.documents, public.document_versions,
  public.sources, public.document_sources, public.site_settings
  to anon, authenticated;

grant select on public.user_roles to authenticated;
grant select, insert, update on public.profiles to authenticated;
-- profiles/user_roles: sin acceso anon.  audit_logs: sin acceso anon/authenticated.
