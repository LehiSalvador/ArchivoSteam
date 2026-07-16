"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { transitionArchiveAction, type ArchiveTransition } from "@/lib/admin/actions";

const linkBtn: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 600,
  color: "var(--tx-d-mut)",
  padding: "5px 9px",
  borderRadius: "7px",
  border: "1px solid var(--line-dark)",
  background: "transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function ArchiveActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const run = (action: ArchiveTransition, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setErr(null);
    start(async () => {
      const r = await transitionArchiveAction(id, action);
      if (!r.ok) setErr(r.error);
      else router.refresh();
    });
  };

  const isArchived = status === "ARCHIVED";
  const isPublished = status === "PUBLISHED";

  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
      {err && <span style={{ color: "#f0a6a6", fontSize: "11px" }}>{err}</span>}
      <Link href={`/admin/archivos/${id}`} style={{ ...linkBtn, color: "var(--marfil)" }}>
        Editar
      </Link>
      <Link href={`/vista-previa/${id}`} style={linkBtn}>
        Vista previa
      </Link>
      {!isArchived && !isPublished && (
        <button type="button" style={{ ...linkBtn, color: "var(--gold)", borderColor: "var(--gold)" }} disabled={pending} onClick={() => run("publish")}>
          Publicar
        </button>
      )}
      {isPublished && (
        <button type="button" style={linkBtn} disabled={pending} onClick={() => run("unpublish", "¿Despublicar este archivo? Dejará de verse en el sitio.")}>
          Despublicar
        </button>
      )}
      {!isArchived ? (
        <button type="button" style={linkBtn} disabled={pending} onClick={() => run("archive", "¿Archivar este archivo?")}>
          Archivar
        </button>
      ) : (
        <button type="button" style={linkBtn} disabled={pending} onClick={() => run("restore")}>
          Restaurar
        </button>
      )}
    </div>
  );
}
