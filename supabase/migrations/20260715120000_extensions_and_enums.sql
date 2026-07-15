-- Archivo STEAM — Fase 1 (cimentación)
-- 0001 · Extensiones base y tipos enumerados
--
-- Decisión de modelado:
--   Se usan ENUM de Postgres para `app_role` y `archive_status` porque son
--   conjuntos estables, pequeños y referenciados por lógica/RLS/tipos.
--   Los catálogos de contenido (ciudades, instituciones, disciplinas, temas,
--   colecciones) se modelan como TABLAS por ser datos editoriales variables.

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "uuid-ossp";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('MEMBER','EDITOR','ADMIN','OWNER');
  end if;

  if not exists (select 1 from pg_type where typname = 'archive_status') then
    create type public.archive_status as enum (
      'DRAFT','RESEARCH','VERIFICATION','LEGAL_REVIEW','READY',
      'SCHEDULED','PUBLISHED','CORRECTION','ARCHIVED'
    );
  end if;
end$$;

-- Utilidad: mantener updated_at en cada UPDATE. SECURITY INVOKER + search_path vacío.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
