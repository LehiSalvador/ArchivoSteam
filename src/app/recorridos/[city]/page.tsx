import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveCard } from "@/components/archive-card";
import { getArchives, getCities, getCityById } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = await getCityById(city);
  return { title: c ? `Recorrido · ${c.name}` : "Recorrido" };
}

export default async function CiudadPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = await getCityById(city);
  if (!c) notFound();

  const [allArchives, allCities] = await Promise.all([getArchives(), getCities()]);
  const archives = allArchives.filter((a) => a.city === c.id);
  const others = allCities.filter((o) => o.id !== c.id);
  const disciplines = Array.from(new Set(archives.map((a) => a.discLabel).filter(Boolean)));

  return (
    <div style={{ paddingTop: "92px" }}>
      <section data-screen-label="Recorrido · ciudad" style={{ maxWidth: "1240px", margin: "0 auto", padding: "44px 5vw 30px" }}>
        <Link href="/recorridos" style={{ display: "inline-flex", gap: "8px", color: "var(--tx-d-mut)", fontSize: "13.5px", fontWeight: 600, marginBottom: "20px" }}>← Todos los recorridos</Link>
        <p style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", margin: 0 }}>{c.tag} · {c.count} archivos</p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(32px,5vw,56px)", color: "var(--marfil)", margin: "12px 0 12px" }}>{c.name}</h1>
        <p style={{ fontSize: "17px", lineHeight: 1.7, color: "var(--tx-d-mut)", maxWidth: "62ch", margin: "0 0 18px" }}>{c.intro}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {disciplines.map((d) => (
            <span key={d} className="chip" data-on="0">{d}</span>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "14px 5vw 40px" }}>
        <div className="grid-3">
          {archives.map((a) => (
            <ArchiveCard key={a.n} archive={a} footer="none" />
          ))}
        </div>
      </section>
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 5vw 90px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: ".12em", color: "var(--tx-d-dim)", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>Otras ciudades</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {others.map((o) => (
            <Link key={o.id} href={`/recorridos/${o.id}`} className="chip">{o.name}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
