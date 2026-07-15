"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store";
import { fmtDate, thumbBg } from "@/lib/format";
import type { Archive } from "@/types/domain";

function SaveButton({ n }: { n: number }) {
  const { isSaved, toggleSave } = useStore();
  const saved = isSaved(n);
  return (
    <button
      aria-label={saved ? "Quitar de guardados" : "Guardar archivo"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(n);
      }}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 2,
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        border: "none",
        background: "rgba(13,13,13,.6)",
        color: saved ? "var(--gold)" : "var(--marfil)",
        backdropFilter: "blur(6px)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}

export function ArchiveCard({
  archive,
  showSave = true,
  footer = "dur",
}: {
  archive: Archive;
  showSave?: boolean;
  footer?: "none" | "dur" | "durpub";
}) {
  const meta = `${archive.role} · ${archive.cityName}`;
  return (
    <article className="acard" style={{ position: "relative", background: "var(--ink-3)", border: "1px solid var(--line-dark-2)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Link className="stretch" href={`/archivo/${archive.slug}`} aria-label={`Abrir ${archive.numStr}, ${archive.name}`}>
        <span className="sr-only">{`Abrir ${archive.numStr}, ${archive.name}`}</span>
      </Link>
      <div className="dark" style={{ position: "relative", aspectRatio: "16/9", background: thumbBg(archive.n), display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "12px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", color: "var(--tx-d-dim)", textTransform: "uppercase" }}>{archive.thumb}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--tx-d-dim)" }}>16:9</span>
      </div>
      {showSave && <SaveButton n={archive.n} />}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".08em", color: "var(--gold)" }}>{archive.numStr}</span>
        <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "19px", color: "var(--marfil)", lineHeight: 1.2 }}>{archive.name}</span>
        <span style={{ fontSize: "14px", color: "var(--tx-d-mut)", lineHeight: 1.35 }}>{archive.title}</span>
        <span style={{ fontSize: "12.5px", color: "var(--tx-d-dim)", marginTop: "2px" }}>{meta}</span>
        {footer !== "none" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--tx-d-dim)", marginTop: "10px", paddingTop: "12px", borderTop: "1px solid var(--line-dark-2)" }}>
            <span>{footer === "durpub" ? `${archive.durMin} min · ${fmtDate(archive.pub)}` : `${archive.durMin} min`}</span>
            <span style={{ color: "var(--gold)" }}>Abrir →</span>
          </div>
        )}
      </div>
    </article>
  );
}

export function TrendCard({ archive }: { archive: Archive }) {
  return (
    <article className="acard" style={{ position: "relative", background: "var(--ink-3)", border: "1px solid var(--line-dark-2)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <Link className="stretch" href={`/archivo/${archive.slug}`} aria-label={`Abrir ${archive.numStr}, ${archive.name}`}>
        <span className="sr-only">{`Abrir ${archive.numStr}, ${archive.name}`}</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--gold)" }}>{archive.numStr}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold-bright)" }}>▲ {archive.trend}</span>
      </div>
      <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "18px", color: "var(--marfil)", lineHeight: 1.22 }}>{archive.name}</span>
      <span style={{ fontSize: "13.5px", color: "var(--tx-d-mut)", lineHeight: 1.4, flex: 1 }}>{archive.title}</span>
      <span style={{ fontSize: "12px", color: "var(--tx-d-dim)" }}>{archive.cityName} · {archive.discLabel}</span>
    </article>
  );
}
