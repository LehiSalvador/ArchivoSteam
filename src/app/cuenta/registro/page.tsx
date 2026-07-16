import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Registro"
      title="Crear cuenta"
      subtitle="Regístrate con tu correo. Te enviaremos un enlace de confirmación."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/cuenta/iniciar-sesion" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </>
      }
    >
      <AuthForm
        action={signUpAction}
        hideFormOnSuccess
        fields={[
          { name: "display_name", label: "Nombre", autoComplete: "name", required: false },
          { name: "email", label: "Correo", type: "email", autoComplete: "email" },
          {
            name: "password",
            label: "Contraseña (mín. 8 caracteres)",
            type: "password",
            autoComplete: "new-password",
          },
        ]}
        submitLabel="Crear cuenta"
      />
    </AuthShell>
  );
}
