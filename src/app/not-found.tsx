import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "140px 5vw 100px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(28px,4vw,42px)", color: "var(--marfil)", margin: "0 0 10px" }}>Página no encontrada</h1>
      <p style={{ fontSize: "16px", color: "var(--tx-d-mut)", margin: "0 0 22px" }}>Esta página no existe o fue movida.</p>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "9px", background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "15px", padding: "13px 24px", borderRadius: "9px" }}>Volver al inicio →</Link>
    </div>
  );
}
