-- Archivo STEAM — Fase 2
-- 0009 · Identidad y autorización (helpers de rol + alta de usuario)
--
-- Principios de seguridad:
--   · Los helpers evalúan SIEMPRE al usuario actual (auth.uid()); jamás reciben
--     un uid arbitrario -> no hay fuga de "¿qué rol tiene el usuario X?".
--   · SECURITY DEFINER + search_path bloqueado: la comprobación de rol puede leer
--     user_roles aunque el rol invocante no tenga acceso directo por RLS.
--   · La autorización vive en public.user_roles (gestión servidor), NUNCA en
--     user_metadata (editable por el usuario).

-- ── Helpers de rol (usuario actual) ───────────────────────────────────────────
create or replace function public.has_role(p_role public.app_role)
  returns boolean
  language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = p_role
  );
$$;
comment on function public.has_role(public.app_role) is
  'TRUE si el usuario autenticado actual posee el rol indicado.';

create or replace function public.is_staff()
  returns boolean
  language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid())
      and role in ('EDITOR','ADMIN','OWNER')
  );
$$;

create or replace function public.is_admin()
  returns boolean
  language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid())
      and role in ('ADMIN','OWNER')
  );
$$;

create or replace function public.is_owner()
  returns boolean
  language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'OWNER'
  );
$$;

-- Nivel de rol más alto del usuario actual (para la UI del panel).
create or replace function public.current_role_level()
  returns text
  language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(
    (select role::text from public.user_roles
      where user_id = (select auth.uid())
      order by array_position(array['MEMBER','EDITOR','ADMIN','OWNER']::text[], role::text) desc
      limit 1),
    'ANON');
$$;

-- Los helpers deben ser ejecutables por los roles de la API (se usan en RLS).
grant execute on function public.has_role(public.app_role) to anon, authenticated;
grant execute on function public.is_staff()  to anon, authenticated;
grant execute on function public.is_admin()  to anon, authenticated;
grant execute on function public.is_owner()  to anon, authenticated;
grant execute on function public.current_role_level() to anon, authenticated;

-- ── Alta de usuario: perfil + rol MEMBER ──────────────────────────────────────
-- El bootstrap de OWNER NO ocurre aquí: se valida en servidor contra
-- INITIAL_OWNER_EMAIL (variable privada) tras confirmar el correo.
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name',''),
      nullif(new.raw_user_meta_data->>'full_name',''),
      split_part(coalesce(new.email,'usuario'),'@',1)
    )
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'MEMBER')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
