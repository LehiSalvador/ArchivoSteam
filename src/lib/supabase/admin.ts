// Cliente de Supabase con service role (secret). SOLO servidor. Bypassa RLS,
// por lo que toda operación que lo use DEBE validar autorización en el código.
// Uso previsto: bootstrap del OWNER y operaciones administrativas puntuales que
// no pueden expresarse con la sesión del usuario.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

export function createAdminClient() {
  return createClient<Database>(publicEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
