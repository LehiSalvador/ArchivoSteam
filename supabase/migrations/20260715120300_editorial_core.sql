-- Archivo STEAM — Fase 1 (cimentación)
-- 0004 · Núcleo editorial (personas, archivos numerados, documentos, fuentes)

create table if not exists public.people (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  full_name             text not null,
  display_name          text,
  headline              text,
  bio                   text,
  photo_url             text,
  birth_year            int,
  city_id               uuid references public.cities(id) on delete set null,
  primary_discipline_id uuid references public.disciplines(id) on delete set null,
  is_public             boolean not null default false,
  created_by            uuid references auth.users(id) on delete set null,
  updated_by            uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint people_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
create index if not exists idx_people_public on public.people(is_public) where is_public;
create index if not exists idx_people_city on public.people(city_id);
create index if not exists idx_people_discipline on public.people(primary_discipline_id);

create table if not exists public.archives (
  id               uuid primary key default gen_random_uuid(),
  archive_number   bigint unique,
  slug             text not null unique,
  title            text not null,
  person_id        uuid references public.people(id) on delete set null,
  summary          text,
  research         text,
  applications     text,
  transcript       text,
  youtube_video_id text,
  youtube_url      text,
  audio_url        text,
  duration_seconds int,
  status           public.archive_status not null default 'DRAFT',
  is_featured      boolean not null default false,
  scheduled_at     timestamptz,
  published_at     timestamptz,
  created_by       uuid references auth.users(id) on delete set null,
  updated_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  constraint archives_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint archives_number_positive check (archive_number is null or archive_number > 0)
);
create index if not exists idx_archives_status on public.archives(status);
create index if not exists idx_archives_published_at on public.archives(published_at desc);
create index if not exists idx_archives_person on public.archives(person_id);
create index if not exists idx_archives_featured on public.archives(is_featured) where is_featured;
-- Índice de apoyo al patrón de lectura pública (status + soft-delete + orden)
create index if not exists idx_archives_public_read on public.archives(status, deleted_at, published_at desc);

create table if not exists public.archive_topics (
  archive_id uuid not null references public.archives(id) on delete cascade,
  topic_id   uuid not null references public.topics(id) on delete cascade,
  primary key (archive_id, topic_id)
);
create index if not exists idx_archive_topics_topic on public.archive_topics(topic_id);

create table if not exists public.archive_collections (
  archive_id    uuid not null references public.archives(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  sort_order    int not null default 0,
  primary key (archive_id, collection_id)
);
create index if not exists idx_archive_collections_collection on public.archive_collections(collection_id);

create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  kind       text not null default 'OTHER',
  title      text,
  slug       text,
  is_public  boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_kind_check check (kind in
    ('SUMMARY','RESEARCH','APPLICATIONS','TRANSCRIPT','SOURCES','NOTES','OTHER'))
);
create index if not exists idx_documents_archive on public.documents(archive_id);

create table if not exists public.document_versions (
  id             uuid primary key default gen_random_uuid(),
  document_id    uuid not null references public.documents(id) on delete cascade,
  version_number int not null,
  content        text,
  content_format text not null default 'markdown',
  language       text not null default 'es',
  is_current     boolean not null default false,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (document_id, version_number)
);
create index if not exists idx_docversions_document on public.document_versions(document_id);
-- A lo sumo una versión "actual" por documento
create unique index if not exists uq_docversions_current
  on public.document_versions(document_id) where is_current;

create table if not exists public.sources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  url          text,
  author       text,
  publisher    text,
  published_on date,
  source_type  text,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.document_sources (
  document_id uuid not null references public.documents(id) on delete cascade,
  source_id   uuid not null references public.sources(id) on delete cascade,
  note        text,
  primary key (document_id, source_id)
);
create index if not exists idx_document_sources_source on public.document_sources(source_id);

-- Triggers updated_at
drop trigger if exists trg_people_updated_at on public.people;
create trigger trg_people_updated_at before update on public.people
  for each row execute function public.set_updated_at();

drop trigger if exists trg_archives_updated_at on public.archives;
create trigger trg_archives_updated_at before update on public.archives
  for each row execute function public.set_updated_at();

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

drop trigger if exists trg_sources_updated_at on public.sources;
create trigger trg_sources_updated_at before update on public.sources
  for each row execute function public.set_updated_at();
