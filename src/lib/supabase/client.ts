// Cliente de Supabase para el navegador (browser).
// PREPARADO para la Fase 3 (auth + datos reales). En la Fase 1 los componentes
// leen de src/lib/repository (mocks); este cliente todavía no se consume.

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
