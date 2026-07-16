// Cliente de Supabase para el servidor (Server Components / Actions / Route
// Handlers). Nunca expone el service role: usa la clave pública + las cookies de
// la petición, de modo que RLS se evalúa con el rol real del usuario.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { publicEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component sin respuesta mutable; el refresco
          // de sesión lo cubre el middleware.
        }
      },
    },
  });
}
