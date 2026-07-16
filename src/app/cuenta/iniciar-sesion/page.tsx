import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Iniciar sesión" };

const linkStyle = { color: "var(--gold)", fontWeight: 600 } as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/cuenta";
  const err = typeof sp.error === "string" ? sp.error : "";

  return (
    <AuthShell
      eyebrow="Acceso"
      title="Iniciar sesión"
      subtitle="Entra a tu cuenta para continuar."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/cuenta/registro" style={linkStyle}>
            Crear una
          </Link>
        </>
      }
    >
      {err === "confirm" && (
        <p style={{ color: "#f0a6a6", fontSize: "13px", margin: "0 0 14px" }}>
          El enlace de confirmación no es válido o expiró. Inicia sesión o solicita otro.
        </p>
      )}
      {err === "forbidden" && (
        <p style={{ color: "#f0a6a6", fontSize: "13px", margin: "0 0 14px" }}>
          Tu cuenta no tiene permisos para esa sección.
        </p>
      )}
      <AuthForm
        action={signInAction}
        hidden={{ next }}
        fields={[
          { name: "email", label: "Correo", type: "email", autoComplete: "email" },
          { name: "password", label: "Contraseña", type: "password", autoComplete: "current-password" },
        ]}
        submitLabel="Entrar"
      />
      <div style={{ marginTop: "16px", fontSize: "13.5px" }}>
        <Link href="/cuenta/recuperar" style={{ color: "var(--tx-d-mut)" }}>
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </AuthShell>
  );
}
