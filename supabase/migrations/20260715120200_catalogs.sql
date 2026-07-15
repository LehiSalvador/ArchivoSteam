-- Archivo STEAM — Fase 1 (cimentación)
-- 0003 · Catálogos de referencia (lectura pública; escritura cerrada)

create table if not exists public.cities (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  region     text,
  country    text not null default 'México',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cities_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.institutions (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  kind       text,
  city_id    uuid references public.cities(id) on delete set null,
  website    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint institutions_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
create index if not exists idx_institutions_city on public.institutions(city_id);

create table if not exists public.disciplines (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  area       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint disciplines_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.topics (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint topics_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text,
  cover_url   text,
  is_public   boolean not null default false,
  sort_order  int not null default 0,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint collections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
create index if not exists idx_collections_public on public.collections(is_public) where is_public;

-- Triggers updated_at
drop trigger if exists trg_cities_updated_at on public.cities;
create trigger trg_cities_updated_at before update on public.cities
  for each row execute function public.set_updated_at();

drop trigger if exists trg_institutions_updated_at on public.institutions;
create trigger trg_institutions_updated_at before update on public.institutions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_disciplines_updated_at on public.disciplines;
create trigger trg_disciplines_updated_at before update on public.disciplines
  for each row execute function public.set_updated_at();

drop trigger if exists trg_topics_updated_at on public.topics;
create trigger trg_topics_updated_at before update on public.topics
  for each row execute function public.set_updated_at();

drop trigger if exists trg_collections_updated_at on public.collections;
create trigger trg_collections_updated_at before update on public.collections
  for each row execute function public.set_updated_at();
