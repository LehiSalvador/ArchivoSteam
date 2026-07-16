-- Archivo STEAM — Fase 2
-- 0012 · Endurecimiento de funciones SECURITY DEFINER
--
-- handle_new_user es una función de TRIGGER: no debe poder invocarse por RPC.
-- Los triggers se ejecutan con los privilegios del dueño sin necesidad de GRANT.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Los helpers de rol solo se evalúan dentro de políticas `to authenticated`
-- (anon nunca las toca). Se retira EXECUTE a anon; se conserva en authenticated,
-- que es imprescindible para que RLS pueda evaluarlas. Son seguras: solo miran
-- al usuario actual (auth.uid()) y tienen search_path bloqueado.
revoke execute on function public.has_role(public.app_role) from anon;
revoke execute on function public.is_staff()            from anon;
revoke execute on function public.is_admin()            from anon;
revoke execute on function public.is_owner()            from anon;
revoke execute on function public.current_role_level()  from anon;
