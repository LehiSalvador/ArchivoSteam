import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { ArchiveCard, TrendCard } from "@/components/archive-card";
import { getCities, getCollections, getNewArchives, getTrending } from "@/lib/repository";

const eyebrow = { fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".2em", textTransform: "uppercase" as const, color: "var(--gold)", margin: 0 };
const h2 = { fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(26px,3.4vw,38px)", color: "var(--marfil)", margin: "12px 0 0" };
const wrap = { maxWidth: "1240px", margin: "0 auto" };

export default function HomePage() {
  const nuevos = getNewArchives(6);
  const trend = getTrending(4);
  const cols = getCollections().slice(0, 6);
  const cities = getCities();

  return (
    <>
      <Hero />

      <section data-screen-label="Inicio · Nuevos archivos" style={{ background: "var(--ink)", padding: "84px 5vw", borderTop: "1px solid var(--line-dark-2)" }}>
        <div style={wrap}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
            <div>
              <p style={eyebrow}>Nuevos archivos</p>
              <h2 style={h2}>Lo último que se sumó</h2>
            </div>
            <Link href="/biblioteca" style={{ fontWeight: 600, fontSize: "14px", color: "var(--gold)" }}>Ver toda la biblioteca →</Link>
          </div>
          <div className="grid-3">
            {nuevos.map((a) => (
              <ArchiveCard key={a.n} archive={a} footer="dur" />
            ))}
          </div>
        </div>
      </section>

      <section data-screen-label="Inicio · Tendencia" style={{ background: "var(--ink-2)", padding: "84px 5vw" }}>
        <div style={wrap}>
          <div style={{ marginBottom: "32px" }}>
            <p style={eyebrow}>En tendencia</p>
            <h2 style={{ ...h2, maxWidth: "24ch" }}>Archivos con más actividad estas semanas</h2>
          </div>
          <div className="grid-4">
            {trend.map((a) => (
              <TrendCard key={a.n} archive={a} />
            ))}
          </div>
        </div>
      </section>

      <section data-screen-label="Inicio · Colecciones" style={{ background: "var(--ink)", padding: "84px 5vw" }}>
        <div style={wrap}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
            <div>
              <p style={eyebrow}>Colecciones destacadas</p>
              <h2 style={h2}>Recorridos editoriales por el archivo</h2>
            </div>
          </div>
          <div className="grid-3">
            {cols.map((c) => (
              <Link key={c.id} className="dark hover-gold" href={`/biblioteca?col=${c.id}`} style={{ position: "relative", borderRadius: "14px", overflow: "hidden", minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "22px", border: "1px solid var(--line-dark-2)", background: c.bg }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(13,13,13,.9),rgba(13,13,13,.25))" }} />
                <div style={{ position: "relative" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold)" }}>{c.count} archivos</span>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "22px", color: "var(--marfil)", margin: "8px 0 6px" }}>{c.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--tx-d-mut)", margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-screen-label="Inicio · Recorrido actual" style={{ background: "var(--ink-2)", padding: "84px 5vw", borderTop: "1px solid var(--line-dark-2)" }}>
        <div style={wrap}>
          <div className="split-2">
            <div>
              <p style={eyebrow}>Recorrido actual · Primera edición</p>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(28px,3.8vw,42px)", color: "var(--marfil)", margin: "14px 0 16px", lineHeight: 1.1 }}>Seis ciudades, un archivo que crece</h2>
              <p style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--tx-d-mut)", margin: "0 0 24px", maxWidth: "52ch" }}>La primera edición recorre seis ciudades de México documentando trayectorias en ciencia, industria, arte y cultura. Cada ciudad aporta sus propias historias al archivo.</p>
              <Link href="/recorridos" className="btn-aura" style={{ display: "inline-flex", alignItems: "center", gap: "9px", background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "15px", padding: "13px 24px", borderRadius: "9px" }}>
                Explorar los recorridos <span style={{ fontFamily: "var(--mono)" }}>→</span>
              </Link>
            </div>
            <div className="grid-2">
              {cities.map((c) => (
                <Link key={c.id} className="hover-gold" href={`/recorridos/${c.id}`} style={{ border: "1px solid var(--line-dark)", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "6px", background: "var(--ink-3)" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold)" }}>{c.count} archivos</span>
                  <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "18px", color: "var(--marfil)" }}>{c.name}</span>
                  <span style={{ fontSize: "12px", color: "var(--tx-d-dim)" }}>{c.tag}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
