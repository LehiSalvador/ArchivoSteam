// Variables de entorno SOLO de servidor. `server-only` impide que este módulo
// se incluya en un bundle de cliente: si algún componente de cliente lo importa,
// la compilación falla. Aquí viven los secretos (service role, tokens).
import "server-only";

export const serverEnv = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  initialOwnerEmail: (process.env.INITIAL_OWNER_EMAIL ?? "").trim().toLowerCase(),
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? "",
};

export function hasServiceRole(): boolean {
  return Boolean(serverEnv.serviceRoleKey);
}
