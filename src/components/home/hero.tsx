"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store";
import { AnimatedBrandSymbol } from "@/components/brand-symbol";

export function Hero() {
  const { openTrailer } = useStore();
  return (
    <section data-screen-label="Inicio · Hero" className="dark" style={{ position: "relative", minHeight: "100svh", background: "var(--ink)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 6vw 90px", overflow: "hidden" }}>
      <div className="cover-glow" style={{ position: "absolute", left: "50%", bottom: "2%", width: "min(820px,92vw)", height: "480px", background: "radial-gradient(60% 70% at 50% 60%,rgba(201,154,68,.20),rgba(201,154,68,.04) 55%,transparent 72%)", pointerEvents: "none" }} />
      <div className="rise" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "820px" }}>
        <AnimatedBrandSymbol variant="hero" />
        <h1 style={{ margin: 0, display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: "clamp(38px,7vw,74px)", letterSpacing: ".06em", color: "var(--marfil)", lineHeight: 1 }}>ARCHIVO</span>
          <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "clamp(20px,3.4vw,34px)", letterSpacing: ".28em", color: "var(--gold)", lineHeight: 1 }}>STEAM</span>
        </h1>
        <div style={{ width: "64px", height: "1px", background: "linear-gradient(90deg,transparent,var(--gold),transparent)", margin: "26px 0 20px" }} />
        <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(20px,3vw,28px)", lineHeight: 1.3, color: "var(--marfil)", margin: "0 0 18px" }}>Preservar historias. Compartir conocimiento.</p>
        <p style={{ fontSize: "clamp(15px,1.7vw,18px)", lineHeight: 1.7, color: "var(--tx-d-mut)", margin: 0, maxWidth: "60ch" }}>Un archivo vivo de conversaciones con personas detrás de la ciencia, la tecnología, la ingeniería, el arte, la cultura, la industria y las ideas.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center", marginTop: "36px" }}>
          <Link href="/biblioteca" className="btn-aura" style={{ display: "inline-flex", alignItems: "center", gap: "9px", background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "15px", padding: "15px 28px", borderRadius: "9px", boxShadow: "0 6px 24px rgba(201,154,68,.28)" }}>
            Explorar la biblioteca <span style={{ fontFamily: "var(--mono)" }}>→</span>
          </Link>
          <button onClick={openTrailer} className="btn-aura-soft" style={{ display: "inline-flex", alignItems: "center", gap: "10px", color: "var(--marfil)", fontWeight: 600, fontSize: "15px", padding: "15px 24px", borderRadius: "9px", border: "1px solid var(--line-dark)", background: "transparent" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--gold-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>▶</span> Ver tráiler
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".24em", color: "var(--tx-d-dim)", textTransform: "uppercase" }}>Desplázate</span>
        <span style={{ color: "var(--gold)" }}>↓</span>
      </div>
    </section>
  );
}
