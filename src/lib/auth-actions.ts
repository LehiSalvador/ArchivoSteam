"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureOwnerBootstrap } from "@/lib/auth";

export type AuthState = { ok: boolean; error?: string; message?: string };

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function str(fd: FormData, k: string): string {
  return (fd.get(k) ?? "").toString().trim();
}

export async function signUpAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const displayName = str(fd, "display_name");
  if (!email || !password) return { ok: false, error: "Correo y contraseña son obligatorios." };
  if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split("@")[0] },
      emailRedirectTo: `${await origin()}/auth/callback?next=/cuenta`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    message:
      "Cuenta creada. Te enviamos un correo para confirmar tu dirección. Revisa tu bandeja (y spam).",
  };
}

export async function signInAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const next = str(fd, "next") || "/cuenta";
  if (!email || !password) return { ok: false, error: "Correo y contraseña son obligatorios." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg =
      error.message === "Email not confirmed"
        ? "Tu correo aún no está confirmado. Revisa el enlace que te enviamos."
        : error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message;
    return { ok: false, error: msg };
  }
  await ensureOwnerBootstrap();
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/cuenta");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/cuenta/iniciar-sesion");
}

export async function requestResetAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  if (!email) return { ok: false, error: "Escribe tu correo." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/cuenta/restablecer`,
  });
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    message: "Si el correo existe, te enviamos un enlace para restablecer la contraseña.",
  };
}

export async function updatePasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const password = str(fd, "password");
  const confirm = str(fd, "confirm");
  if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  if (password !== confirm) return { ok: false, error: "Las contraseñas no coinciden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Enlace expirado o sesión no válida. Solicita uno nuevo." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Contraseña actualizada. Ya puedes usarla para iniciar sesión." };
}
