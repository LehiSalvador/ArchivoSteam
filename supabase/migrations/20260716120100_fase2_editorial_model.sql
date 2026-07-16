-- Archivo STEAM — Fase 2
-- 0010 · Modelo editorial definitivo (extensión aditiva, no destructiva)
--
-- Reutiliza el esquema de Fase 1. Solo AÑADE columnas/tablas. No elimina ni
-- renombra nada. Todo idempotente.

-- ── archives: presentación, clasificación directa y metadatos de YouTube ──────
alter table public.archives add column if not exists subtitle             text;
alter table public.archives add column if not exists short_description    text;
alter table public.archives add column if not exists card_description     text;
alter table public.archives add column if not exists highlight_phrase     text;
alter table public.archives add column if not exists is_trending          boolean not null default false;
alter table public.archives add column if not exists visibility           text not null default 'PUBLIC';
alter table public.archives add column if not exists city_id              uuid references public.cities(id) on delete set null;
alter table public.archives add column if not exists institution_id       uuid references public.institutions(id) on delete set null;
alter table public.archives add column if not exists primary_discipline_id uuid references public.disciplines(id) on delete set null;
alter table public.archives add column if not exists youtube_channel      text;
alter table public.archives add column if not exists youtube_thumbnail_url text;
alter table public.archives add column if not exists video_published_at   timestamptz;
alter table public.archives add column if not exists youtube_synced_at    timestamptz;
alter table public.archives add column if not exists youtube_sync_error   text;
alter table public.archives add column if not exists youtube_raw          jsonb;
alter table public.archives add column if not exists youtube_stats        jsonb;
alter table public.archives add column if not exists chapters             jsonb not null default '[]'::jsonb;
alter table public.archives add column if not exists archived_at          timestamptz;

alter table public.archives drop constraint if exists archives_visibility_check;
alter table public.archives add  constraint archives_visibility_check
  check (visibility in ('PUBLIC','UNLISTED'));

create index if not exists idx_archives_status      on public.archives(status);
create index if not exists idx_archives_city        on public.archives(city_id);
create index if not exists idx_archives_discipline  on public.archives(primary_discipline_id);
create index if not exists idx_archives_published_at on public.archives(published_at desc);
create index if not exists idx_archives_trending    on public.archives(is_trending) where is_trending;
create index if not exists idx_archives_featured    on public.archives(is_featured) where is_featured;

-- ── people: institución, semblanza, enlaces, borrado lógico ───────────────────
alter table public.people add column if not exists institution_id uuid references public.institutions(id) on delete set null;
alter table public.people add column if not exists short_bio      text;
alter table public.people add column if not exists links          jsonb not null default '[]'::jsonb;
alter table public.people add column if not exists deleted_at     timestamptz;

-- ── documents: orden, estado, borrado lógico, tipos válidos ───────────────────
alter table public.documents add column if not exists sort_order int  not null default 0;
alter table public.documents add column if not exists status     text not null default 'DRAFT';
alter table public.documents add column if not exists deleted_at timestamptz;

alter table public.documents drop constraint if exists documents_kind_check;
alter table public.documents add  constraint documents_kind_check
  check (kind in ('SUMMARY','PERSON','RESEARCH','APPLICATIONS','TRANSCRIPT','SOURCES','CUSTOM'));

alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents add  constraint documents_status_check
  check (status in ('DRAFT','PUBLISHED'));

create index if not exists idx_documents_archive on public.documents(archive_id);

-- ── sources: fecha de consulta, verificación, nota ────────────────────────────
alter table public.sources add column if not exists accessed_on date;
alter table public.sources add column if not exists is_verified boolean not null default false;
alter table public.sources add column if not exists note        text;

-- ── audit_logs: valores anteriores/nuevos + motivo ────────────────────────────
alter table public.audit_logs add column if not exists old_values jsonb;
alter table public.audit_logs add column if not exists new_values jsonb;
alter table public.audit_logs add column if not exists reason     text;
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);

-- ── Recorridos (tours) como catálogo administrable ────────────────────────────
create table if not exists public.tours (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  cover_url   text,
  city_id     uuid references public.cities(id) on delete set null,
  is_public   boolean not null default true,
  sort_order  int not null default 0,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.tours is 'Recorridos temáticos/geográficos administrables.';

drop trigger if exists trg_tours_updated_at on public.tours;
create trigger trg_tours_updated_at
  before update on public.tours
  for each row execute function public.set_updated_at();

create table if not exists public.archive_tours (
  archive_id uuid not null references public.archives(id) on delete cascade,
  tour_id    uuid not null references public.tours(id)    on delete cascade,
  sort_order int not null default 0,
  primary key (archive_id, tour_id)
);
create index if not exists idx_archive_tours_tour on public.archive_tours(tour_id);
