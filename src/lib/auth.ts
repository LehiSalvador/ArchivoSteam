// Autenticación y autorización del lado del servidor.
// La autorización se apoya en public.user_roles (gestión servidor) + RLS.
// NUNCA se confía en user_metadata para decisiones de autorización.
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env.server";

export type RoleLevel = "ANON" | "MEMBER" | "EDITOR" | "ADMIN" | "OWNER";
const ORDER: RoleLevel[] = ["ANON", "MEMBER", "EDITOR", "ADMIN", "OWNER"];

export function atLeast(level: RoleLevel, min: RoleLevel): boolean {
  return ORDER.indexOf(level) >= ORDER.indexOf(min);
}

export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Nivel de rol más alto del usuario actual (o ANON). Lee sus propias filas. */
export const getRoleLevel = cache(async (): Promise<RoleLevel> => {
  const user = await getUser();
  if (!user) return "ANON";
  const supabase = await createClient();
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (data ?? []).map((r) => r.role as RoleLevel);
  let best: RoleLevel = "MEMBER";
  for (const r of roles) if (ORDER.indexOf(r) > ORDER.indexOf(best)) best = r;
  return best;
});

export async function isStaff(): Promise<boolean> {
  return atLeast(await getRoleLevel(), "EDITOR");
}

/** Exige sesión; si no hay, redirige a inicio de sesión conservando destino. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/cuenta/iniciar-sesion${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Exige un nivel mínimo de rol. Redirige a /cuenta si es insuficiente. */
export async function requireRole(min: RoleLevel): Promise<{ user: User; level: RoleLevel }> {
  const user = await requireUser("/admin");
  const level = await getRoleLevel();
  if (!atLeast(level, min)) redirect("/cuenta?error=forbidden");
  return { user, level };
}

export const requireStaff = () => requireRole("EDITOR");
export const requireAdmin = () => requireRole("ADMIN");
export const requireOwner = () => requireRole("OWNER");

/**
 * Bootstrap seguro del OWNER (§10.4). Idempotente y de un solo consumo.
 * Solo promueve si: el correo del usuario coincide EXACTAMENTE con
 * INITIAL_OWNER_EMAIL (variable privada de servidor), el candado no se ha
 * consumido y aún no existe ningún OWNER. Usa service role (bypassa RLS) con
 * validación explícita en código. El cliente jamás decide el rol.
 */
export async function ensureOwnerBootstrap(): Promise<void> {
  const user = await getUser();
  if (!user?.email || !serverEnv.initialOwnerEmail) return;
  if (user.email.trim().toLowerCase() !== serverEnv.initialOwnerEmail) return;

  const admin = createAdminClient();

  const { data: lock } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "security.owner_bootstrapped")
    .maybeSingle();
  if (lock && (lock.value === true || lock.value === "true")) return;

  const { data: owners } = await admin
    .from("user_roles")
    .select("id")
    .eq("role", "OWNER")
    .limit(1);

  if (!owners || owners.length === 0) {
    await admin
      .from("user_roles")
      .insert({ user_id: user.id, role: "OWNER", granted_by: user.id });
    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "ROLE_CHANGE",
      entity_type: "user_roles",
      entity_id: user.id,
      new_values: { role: "OWNER", via: "bootstrap" },
      reason: "Bootstrap inicial del propietario (INITIAL_OWNER_EMAIL)",
    });
  }

  await admin.from("site_settings").upsert({
    key: "security.owner_bootstrapped",
    value: true,
    is_public: false,
    updated_by: user.id,
  });
}

/** Registra una entrada de auditoría como el usuario actual (RLS: staff self). */
export async function logAudit(entry: {
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  reason?: string | null;
}): Promise<void> {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    old_values: (entry.oldValues ?? null) as never,
    new_values: (entry.newValues ?? null) as never,
    reason: entry.reason ?? null,
  });
}
