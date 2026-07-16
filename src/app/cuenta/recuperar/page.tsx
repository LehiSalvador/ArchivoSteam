import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { requestResetAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Recuperación"
      title="Recuperar contraseña"
      subtitle="Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña."
      footer={
        <Link href="/cuenta/iniciar-sesion" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Volver a iniciar sesión
        </Link>
      }
    >
      <AuthForm
        action={requestResetAction}
        hideFormOnSuccess
        fields={[{ name: "email", label: "Correo", type: "email", autoComplete: "email" }]}
        submitLabel="Enviar enlace"
      />
    </AuthShell>
  );
}
