import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Proyecto" };

const narrow = { maxWidth: "820px", margin: "0 auto" };
const h2 = { fontFamily: "var(--serif)", fontWeight: 600, fontSize: "30px", color: "var(--marfil)", margin: "0 0 18px" };
const para = { fontSize: "16px", lineHeight: 1.75, color: "var(--tx-d-mut)" };
const summary = { cursor: "pointer", fontWeight: 600, fontSize: "16px", color: "var(--marfil)", listStyle: "none" as const };
const faqAnswer = { fontSize: "14.5px", lineHeight: 1.65, color: "var(--tx-d-mut)", margin: "12px 0 0" };

const PROCESS = [
  { n: "01", t: "Investigación", d: "Contexto y preparación antes de grabar." },
  { n: "02", t: "Conversación", d: "Una entrevista sin prisa, centrada en la persona." },
  { n: "03", t: "Verificación", d: "Datos, fechas y citas revisadas con la persona." },
  { n: "04", t: "Publicación", d: "El archivo se suma a la biblioteca, abierto a correcciones." },
];

const PRINCIPLES = [
  "La persona es el centro; no fabricamos héroes ni celebridades.",
  "Documentamos errores y aprendizajes, no solo logros.",
  "Verificamos, citamos fuentes y corregimos cuando nos equivocamos.",
  "Respetamos derechos, imagen y voz de cada participante.",
];

export default function ProyectoPage() {
  return (
    <div data-screen-label="Proyecto" style={{ paddingTop: "92px" }}>
      <section style={{ ...narrow, padding: "56px 5vw 30px" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", margin: 0 }}>El proyecto</p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(32px,5vw,54px)", color: "var(--marfil)", margin: "14px 0 20px", lineHeight: 1.08 }}>Qué es Archivo STEAM</h1>
        <p style={{ fontFamily: "var(--serif)", fontSize: "22px", lineHeight: 1.55, color: "var(--tx-d-mut)", margin: 0 }}>Una biblioteca documental audiovisual en la que cada entrevista se convierte en un archivo numerado: un video, información verificada sobre la persona, documentos sobre su trayectoria, transcripción, fuentes y audio. Todo para preservar historias y compartir conocimiento.</p>
      </section>

      <section style={{ ...narrow, padding: "24px 5vw" }}>
        <div className="grid-2" style={{ gap: "1px", background: "var(--line-dark-2)", border: "1px solid var(--line-dark-2)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ background: "var(--ink-2)", padding: "26px" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase" }}>Misión</span>
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--tx-d-mut)", margin: "12px 0 0" }}>Preservar y compartir experiencias, procesos y aprendizajes de personas detrás del conocimiento.</p>
          </div>
          <div style={{ background: "var(--ink-2)", padding: "26px" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase" }}>Visión</span>
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--tx-d-mut)", margin: "12px 0 0" }}>Un archivo vivo y en crecimiento, consultable hoy y útil mañana.</p>
          </div>
        </div>
      </section>

      <section style={{ ...narrow, padding: "40px 5vw" }}>
        <h2 style={{ ...h2, margin: "0 0 8px" }}>De STEM a STEAM</h2>
        <p style={{ ...para, margin: "0 0 14px" }}>Añadir la A de artes reconoce que la ciencia, la ingeniería y la tecnología no viven separadas de la cultura, el diseño y la creación. El conocimiento también se cuenta, se dibuja y se imagina.</p>
        <p style={{ ...para, margin: 0 }}>Y por eso la palabra principal es <strong style={{ color: "var(--marfil)" }}>ARCHIVO</strong>: lo que perdura, lo que se consulta, lo que se puede volver a mirar.</p>
      </section>

      <section style={{ ...narrow, padding: "24px 5vw" }}>
        <h2 style={h2}>Principios editoriales</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PRINCIPLES.map((p) => (
            <div key={p} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ color: "var(--gold)" }}>◆</span>
              <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--tx-d-mut)", margin: 0 }}>{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...narrow, padding: "40px 5vw" }}>
        <h2 style={h2}>Proceso de una entrevista</h2>
        <div className="process-2">
          {PROCESS.map((s) => (
            <div key={s.n} style={{ border: "1px solid var(--line-dark-2)", borderRadius: "12px", padding: "18px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--gold)" }}>{s.n}</span>
              <p style={{ fontSize: "14px", color: "var(--marfil)", margin: "8px 0 0", fontWeight: 600 }}>{s.t}</p>
              <p style={{ fontSize: "13px", color: "var(--tx-d-mut)", margin: "6px 0 0", lineHeight: 1.5 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...narrow, padding: "40px 5vw 90px" }}>
        <h2 style={h2}>Preguntas frecuentes</h2>
        <details style={{ borderBottom: "1px solid var(--line-dark-2)", padding: "16px 0" }}>
          <summary style={summary}>¿Quién puede aparecer en el archivo?</summary>
          <p style={faqAnswer}>Personas con una trayectoria que valga la pena documentar en cualquier disciplina STEAM. No buscamos fama, buscamos historias que enseñan.</p>
        </details>
        <details style={{ borderBottom: "1px solid var(--line-dark-2)", padding: "16px 0" }}>
          <summary style={summary}>¿Cómo se financia?</summary>
          <p style={faqAnswer}>Este es un prototipo; el modelo de sostenibilidad se documentará conforme el proyecto avance.</p>
        </details>
        <details style={{ borderBottom: "1px solid var(--line-dark-2)", padding: "16px 0" }}>
          <summary style={summary}>¿Puedo proponer a alguien?</summary>
          <p style={faqAnswer}>Sí. Desde <Link href="/participar">Participar</Link> puedes recomendar una historia o proponer una persona.</p>
        </details>
      </section>
    </div>
  );
}
