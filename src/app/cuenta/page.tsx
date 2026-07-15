import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function CuentaPage() {
  return (
    <div data-screen-label="Cuenta" style={{ paddingTop: "92px", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: "5vw", paddingRight: "5vw" }}>
      <div style={{ textAlign: "center", maxWidth: "520px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)" }}>Mi cuenta</span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(28px,4vw,42px)", color: "var(--marfil)", margin: "14px 0 12px" }}>Tu continuidad, pronto</h1>
        <p style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--tx-d-mut)", margin: "0 0 22px" }}>El área de cuenta — guardados, historial, temas y ciudades seguidas — llega en la próxima ronda. Mientras tanto, puedes guardar archivos y tu selección se conserva localmente en este prototipo.</p>
        <Link href="/biblioteca" style={{ display: "inline-flex", alignItems: "center", gap: "9px", background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "15px", padding: "13px 24px", borderRadius: "9px" }}>Explorar la biblioteca →</Link>
      </div>
    </div>
  );
}
