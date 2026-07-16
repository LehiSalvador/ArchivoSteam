import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { updatePasswordAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Nueva contraseña" };

// Se llega aquí tras verificar el token de recuperación (/auth/confirm crea la
// sesión). updateUser aplica la nueva contraseña sobre esa sesión.
export default function Page() {
  return (
    <AuthShell
      eyebrow="Recuperación"
      title="Nueva contraseña"
      subtitle="Define tu nueva contraseña. Debe tener al menos 8 caracteres."
      footer={
        <Link href="/cuenta/iniciar-sesion" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Ir a iniciar sesión
        </Link>
      }
    >
      <AuthForm
        action={updatePasswordAction}
        hideFormOnSuccess
        fields={[
          { name: "password", label: "Nueva contraseña", type: "password", autoComplete: "new-password" },
          { name: "confirm", label: "Repetir contraseña", type: "password", autoComplete: "new-password" },
        ]}
        submitLabel="Guardar contraseña"
      />
    </AuthShell>
  );
}
