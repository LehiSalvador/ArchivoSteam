-- Archivo STEAM — Fase 2
-- 0013 · Endurecimiento (revocar EXECUTE por defecto de PUBLIC)
--
-- Postgres concede EXECUTE a PUBLIC por defecto al crear una función. `anon`
-- hereda de PUBLIC, así que revocarle a `anon` directamente no basta: hay que
-- revocar de PUBLIC y volver a conceder solo a `authenticated` (que es quien
-- las necesita para evaluar RLS). Siguen siendo SECURITY DEFINER a propósito
-- (rompen la recursión de RLS en user_roles) y solo evalúan al usuario actual.
revoke execute on function public.has_role(public.app_role) from public;
revoke execute on function public.is_staff()            from public;
revoke execute on function public.is_admin()            from public;
revoke execute on function public.is_owner()            from public;
revoke execute on function public.current_role_level()  from public;

grant execute on function public.has_role(public.app_role) to authenticated;
grant execute on function public.is_staff()            to authenticated;
grant execute on function public.is_admin()            to authenticated;
grant execute on function public.is_owner()            to authenticated;
grant execute on function public.current_role_level()  to authenticated;
