// Acceso a variables públicas (enviadas al navegador). SOLO NEXT_PUBLIC_*.
// Los secretos de servidor (service role, tokens) NUNCA se leen aquí.

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export function hasSupabasePublicEnv(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}
