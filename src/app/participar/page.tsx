"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const label = { display: "flex", flexDirection: "column" as const, gap: "7px", fontSize: "13px", color: "var(--tx-d-mut)" };
const field = { background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "9px", padding: "12px 14px", color: "var(--marfil)", fontSize: "15px" };

const INTENTS = [
  { icon: "◈", t: "Recomendar una historia", d: "Conoces a alguien cuya trayectoria merece preservarse." },
  { icon: "◉", t: "Participar como invitado", d: "Quieres compartir tu propia experiencia." },
  { icon: "◎", t: "Institución o espacio", d: "Representas un museo, empresa o proyecto social." },
];

export default function ParticiparPage() {
  const [ok, setOk] = useState(false);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOk(true);
  };

  return (
    <div data-screen-label="Participar" style={{ paddingTop: "92px" }}>
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 5vw 20px" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", margin: 0 }}>Participar</p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(30px,4.4vw,48px)", color: "var(--marfil)", margin: "12px 0 8px" }}>Cada persona guarda una historia</h1>
        <p style={{ fontSize: "17px", lineHeight: 1.7, color: "var(--tx-d-mut)", maxWidth: "60ch", margin: 0 }}>Recomienda una historia, propón una persona o contáctanos. Esto conecta — no es publicidad.</p>
      </section>

      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "20px 5vw" }}>
        <div className="grid-3">
          {INTENTS.map((i) => (
            <div key={i.t} style={{ border: "1px solid var(--line-dark-2)", borderRadius: "12px", padding: "20px", background: "var(--ink-3)" }}>
              <span style={{ color: "var(--gold)", fontSize: "20px" }}>{i.icon}</span>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--marfil)", margin: "12px 0 4px" }}>{i.t}</p>
              <p style={{ fontSize: "13px", color: "var(--tx-d-mut)", margin: 0, lineHeight: 1.5 }}>{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "30px 5vw 90px" }}>
        {ok ? (
          <div style={{ textAlign: "center", padding: "56px 24px", border: "1px solid var(--gold)", borderRadius: "16px", background: "var(--gold-soft)" }}>
            <div style={{ fontSize: "38px", marginBottom: "12px" }}>✓</div>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "26px", color: "var(--marfil)", margin: "0 0 8px" }}>Gracias por escribir</h2>
            <p style={{ fontSize: "15px", color: "var(--tx-d-mut)", margin: "0 0 20px" }}>Recibimos tu mensaje (envío de demostración, no se envió a ningún servicio). Te responderíamos por correo.</p>
            <Link href="/biblioteca" style={{ color: "var(--gold)", fontWeight: 600 }}>Explorar la biblioteca →</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="grid-2" style={{ gap: "16px" }}>
              <label style={label}>Nombre<input required style={field} /></label>
              <label style={label}>Correo<input type="email" required style={field} /></label>
            </div>
            <div className="grid-2" style={{ gap: "16px" }}>
              <label style={label}>Ciudad<input style={field} /></label>
              <label style={label}>Tipo de participación
                <select style={field} defaultValue="Recomendar una historia">
                  <option>Recomendar una historia</option>
                  <option>Proponer una persona</option>
                  <option>Participar como invitado</option>
                  <option>Institución o espacio</option>
                  <option>Prensa</option>
                  <option>Contacto general</option>
                </select>
              </label>
            </div>
            <label style={label}>Mensaje<textarea required rows={5} style={{ ...field, resize: "vertical" }} /></label>
            <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: "var(--tx-d-mut)" }}>
              <input type="checkbox" required style={{ marginTop: "3px" }} /> Acepto el aviso de privacidad y el tratamiento de mis datos para fines de contacto.
            </label>
            <button type="submit" style={{ alignSelf: "flex-start", background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "9px", padding: "14px 28px", fontWeight: 700, fontSize: "15px" }}>Enviar mensaje</button>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--tx-d-dim)" }}>Envío de demostración · no se conecta a ningún servicio real.</span>
          </form>
        )}
      </section>
    </div>
  );
}
