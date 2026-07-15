"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useStore } from "@/components/providers/store";

const linkStyle = { color: "var(--tx-d-mut)", fontSize: "14px" } as const;
const headStyle = {
  fontFamily: "var(--mono)",
  fontSize: "11px",
  letterSpacing: ".14em",
  color: "var(--gold)",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "14px",
};

export function SiteFooter() {
  const { openCookiePrefs } = useStore();
  const [ok, setOk] = useState(false);

  const onNewsletter = (e: FormEvent) => {
    e.preventDefault();
    setOk(true);
  };

  return (
    <footer style={{ background: "var(--ink)", borderTop: "1px solid var(--line-dark-2)", padding: "64px 5vw 32px" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.4fr", gap: "40px" }}>
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: "16px", letterSpacing: ".13em", color: "var(--marfil)" }}>ARCHIVO</span>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "11px", letterSpacing: ".26em", color: "var(--gold)" }}>STEAM</span>
            </Link>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "16px", color: "var(--marfil)", margin: "0 0 10px" }}>Preservar historias. Compartir conocimiento.</p>
            <p style={{ fontSize: "13.5px", color: "var(--tx-d-mut)", lineHeight: 1.6, margin: 0, maxWidth: "38ch" }}>Una biblioteca documental audiovisual de conversaciones con personas detrás de las ideas.</p>
          </div>
          <div>
            <span style={headStyle}>Explorar</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <Link href="/biblioteca" style={linkStyle}>Biblioteca</Link>
              <Link href="/recorridos" style={linkStyle}>Recorridos</Link>
              <Link href="/proyecto" style={linkStyle}>Proyecto</Link>
              <Link href="/participar" style={linkStyle}>Participar</Link>
            </div>
          </div>
          <div>
            <span style={headStyle}>Legal</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <Link href="/proyecto" style={linkStyle}>Privacidad</Link>
              <Link href="/proyecto" style={linkStyle}>Términos</Link>
              <Link href="/participar" style={linkStyle}>Correcciones</Link>
              <Link href="/proyecto" style={linkStyle}>Accesibilidad</Link>
              <button onClick={openCookiePrefs} style={{ background: "none", border: "none", color: "var(--tx-d-mut)", fontSize: "14px", textAlign: "left", padding: 0, cursor: "pointer" }}>Preferencias de cookies</button>
            </div>
          </div>
          <div>
            <span style={headStyle}>Novedades</span>
            <p style={{ fontSize: "13.5px", color: "var(--tx-d-mut)", lineHeight: 1.6, margin: "0 0 12px" }}>Recibe los nuevos archivos. Sin spam.</p>
            <form onSubmit={onNewsletter} style={{ display: "flex", gap: "8px" }}>
              <input type="email" required placeholder="tu@correo.com" aria-label="Correo" style={{ flex: 1, minWidth: 0, background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "9px", padding: "11px 13px", color: "var(--marfil)", fontSize: "13px" }} />
              <button type="submit" style={{ background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "9px", padding: "0 16px", fontWeight: 700, fontSize: "13px" }}>→</button>
            </form>
            {ok && <span style={{ fontSize: "12.5px", color: "var(--gold)", display: "block", marginTop: "8px" }}>Suscripción de demostración registrada ✓</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "44px", paddingTop: "24px", borderTop: "1px solid var(--line-dark-2)" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--tx-d-dim)" }}>Prototipo · contenido ficticio de demostración</span>
          <div style={{ display: "flex", gap: "14px" }}>
            <span style={{ color: "var(--tx-d-dim)", fontSize: "13px" }}>Instagram</span>
            <span style={{ color: "var(--tx-d-dim)", fontSize: "13px" }}>YouTube</span>
            <span style={{ color: "var(--tx-d-dim)", fontSize: "13px" }}>LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
