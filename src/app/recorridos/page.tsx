import Link from "next/link";
import type { Metadata } from "next";
import { getCities } from "@/lib/repository";

export const metadata: Metadata = { title: "Recorridos" };

export default function RecorridosPage() {
  const cities = getCities();
  return (
    <div data-screen-label="Recorridos" style={{ paddingTop: "92px" }}>
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "44px 5vw 30px" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", margin: 0 }}>Recorridos · Primera edición</p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(30px,4.4vw,48px)", color: "var(--marfil)", margin: "12px 0 8px" }}>Seis ciudades, un archivo que crece</h1>
        <p style={{ fontSize: "17px", lineHeight: 1.7, color: "var(--tx-d-mut)", maxWidth: "64ch", margin: 0 }}>La primera edición recorre seis ciudades de México documentando trayectorias en ciencia, industria, arte y cultura. Cada ciudad aporta sus propias historias y disciplinas al archivo.</p>
      </section>
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "20px 5vw 90px" }}>
        <div className="grid-3">
          {cities.map((c) => (
            <Link key={c.id} href={`/recorridos/${c.id}`} className="acard" style={{ border: "1px solid var(--line-dark-2)", borderRadius: "16px", padding: "26px", background: "var(--ink-3)", display: "flex", flexDirection: "column", gap: "10px", minHeight: "200px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "24px", color: "var(--marfil)" }}>{c.name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--gold)" }}>{c.count} arch.</span>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: ".1em", color: "var(--gold-bright)", textTransform: "uppercase" }}>{c.tag}</span>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--tx-d-mut)", margin: 0, flex: 1 }}>{c.intro}</p>
              <span style={{ color: "var(--gold)", fontSize: "13.5px", fontWeight: 600 }}>Ver la ciudad →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
