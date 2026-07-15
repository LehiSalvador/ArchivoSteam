-- Archivo STEAM — Fase 1 (cimentación)
-- 0005 · Sistema (configuración pública y auditoría)

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  is_public  boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
comment on table public.site_settings is
  'Configuración del sitio. Solo las filas is_public=true son legibles por anon/authenticated.';

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
comment on table public.audit_logs is
  'Bitácora de auditoría. NO pública: RLS habilitado sin políticas anon/authenticated (solo service_role).';

create index if not exists idx_audit_logs_entity  on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_actor   on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);
