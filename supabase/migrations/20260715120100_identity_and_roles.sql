-- Archivo STEAM — Fase 1 (cimentación)
-- 0002 · Identidad y roles

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.profiles is 'Perfil mínimo por usuario (1:1 con auth.users).';

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
comment on table public.user_roles is
  'Roles por usuario. NUNCA escribible desde el cliente (gestión servidor / Fase 2). OWNER no se asigna en Fase 1.';

create index if not exists idx_user_roles_user on public.user_roles(user_id);
