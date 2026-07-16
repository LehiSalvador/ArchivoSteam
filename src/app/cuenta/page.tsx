import Link from "next/link";
import type { Metadata } from "next";
import { getUser, getRoleLevel, ensureOwnerBootstrap, atLeast } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Mi cuenta" };
export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  ANON: "Visitante",
  MEMBER: "Miembro",
  EDITOR: "Editor",
  ADMIN: "Administrador",
  OWNER: "Propietario",
};

export default async function CuentaPage() {
  // El middleware ya garantiza sesión. Corremos el bootstrap del OWNER por si se
  // llega aquí directamente tras confirmar el correo.
  await ensureOwnerBootstrap();
  const user = await getUser();
  const level = await getRoleLevel();
  const staff = atLeast(level, "EDITOR");
  const name = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "120px 5vw 8vw",
        background:
          "radial-gradient(1000px 460px at 50% -10%, rgba(201,154,68,.06), transparent 60%), var(--ink)",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "12px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--gold)",
          }}
        >
          Mi cuenta
        </span>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: "clamp(28px,4vw,40px)",
            color: "var(--marfil)",
            margin: "12px 0 6px",
          }}
        >
          Hola{name ? `, ${name}` : ""}
        </h1>
        <p style={{ color: "var(--tx-d-mut)", fontSize: "15px", margin: "0 0 30px" }}>
          {user?.email}
          <span
            style={{
              display: "inline-block",
              marginLeft: "12px",
              padding: "3px 10px",
              borderRadius: "999px",
              border: "1px solid var(--line-dark)",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: ".1em",
              color: "var(--gold)",
            }}
          >
            {ROLE_LABEL[level] ?? level}
          </span>
        </p>

        <div style={{ display: "grid", gap: "14px" }}>
          {staff && (
            <Link
              href="/admin"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--ink-2)",
                border: "1px solid var(--gold)",
                borderRadius: "13px",
                padding: "20px 22px",
                color: "var(--marfil)",
              }}
            >
              <span>
                <strong style={{ display: "block", fontSize: "16px" }}>Panel administrativo</strong>
                <span style={{ fontSize: "13.5px", color: "var(--tx-d-mut)" }}>
                  Gestiona archivos, personas, documentos y catálogos.
                </span>
              </span>
              <span style={{ color: "var(--gold)", fontFamily: "var(--mono)" }}>→</span>
            </Link>
          )}

          <Link
            href="/biblioteca"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--ink-2)",
              border: "1px solid var(--line-dark)",
              borderRadius: "13px",
              padding: "20px 22px",
              color: "var(--marfil)",
            }}
          >
            <span>
              <strong style={{ display: "block", fontSize: "16px" }}>Explorar la biblioteca</strong>
              <span style={{ fontSize: "13.5px", color: "var(--tx-d-mut)" }}>
                Archivos publicados, recorridos y colecciones.
              </span>
            </span>
            <span style={{ color: "var(--tx-d-dim)", fontFamily: "var(--mono)" }}>→</span>
          </Link>
        </div>

        <form action={signOutAction} style={{ marginTop: "28px" }}>
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid var(--line-dark)",
              color: "var(--tx-d-mut)",
              fontWeight: 600,
              fontSize: "14px",
              padding: "11px 20px",
              borderRadius: "9px",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
