// Cliente de Supabase para el servidor (Server Components / Route Handlers).
// PREPARADO para la Fase 3. Nunca expone el service role; usa la anon key
// pública y las cookies de la petición para la sesión.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component sin respuesta mutable; se ignora.
        }
      },
    },
  });
}
