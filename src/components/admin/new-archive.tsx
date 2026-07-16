"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { importYoutubeAction, createArchiveAction, upsertPersonAction } from "@/lib/admin/actions";
import { Card, btnPrimary, btnGhost, inputStyle, labelStyle } from "@/components/admin/ui";

interface YtMeta {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  durationSeconds: number;
  chapters: unknown;
  raw: unknown;
}

interface PersonOpt {
  id: string;
  full_name: string;
}

function fmtDur(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

export function NewArchive({ people }: { people: PersonOpt[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<YtMeta | null>(null);
  const [title, setTitle] = useState("");

  const [personId, setPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [creatingPerson, setCreatingPerson] = useState(false);

  const doImport = () => {
    setError(null);
    start(async () => {
      const r = await importYoutubeAction(url);
      if (!r.ok) return setError(r.error);
      const m = r.meta as YtMeta;
      setMeta(m);
      if (!title) setTitle(m.title);
    });
  };

  const create = () => {
    if (!title.trim()) return setError("Escribe un título editorial.");
    setError(null);
    start(async () => {
      let pid = personId || null;
      if (creatingPerson && newPersonName.trim()) {
        const pr = await upsertPersonAction({ full_name: newPersonName.trim() });
        if (!pr.ok) return setError(pr.error);
        pid = pr.id;
      }
      const r = await createArchiveAction({
        title: title.trim(),
        personId: pid,
        youtube: meta
          ? {
              videoId: meta.videoId,
              url: `https://youtu.be/${meta.videoId}`,
              channel: meta.channel,
              thumbnailUrl: meta.thumbnailUrl,
              publishedAt: meta.publishedAt,
              durationSeconds: meta.durationSeconds,
              chapters: meta.chapters,
              raw: meta.raw,
            }
          : null,
      });
      if (!r.ok) return setError(r.error);
      router.push(`/admin/archivos/${r.id}`);
    });
  };

  return (
    <div style={{ display: "grid", gap: "16px", maxWidth: "720px" }}>
      {error && (
        <div style={{ background: "rgba(200,60,60,.1)", border: "1px solid rgba(200,60,60,.4)", color: "#f0a6a6", fontSize: "13.5px", padding: "11px 14px", borderRadius: "9px" }}>
          {error}
        </div>
      )}

      {/* Paso 1: Video */}
      <Card>
        <span style={labelStyle}>Paso 1 · Video de YouTube</span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega la URL o el ID del video"
            style={{ ...inputStyle, flex: 1, minWidth: "240px" }}
          />
          <button type="button" style={btnGhost} disabled={pending || !url.trim()} onClick={doImport}>
            Importar metadatos
          </button>
        </div>
        {meta && (
          <div style={{ display: "flex", gap: "14px", marginTop: "14px", alignItems: "center" }}>
            {meta.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={meta.thumbnailUrl} alt="" style={{ width: "120px", borderRadius: "8px", flex: "none" }} />
            )}
            <div style={{ fontSize: "13px", color: "var(--tx-d-mut)" }}>
              <div style={{ color: "var(--marfil)", fontWeight: 600, marginBottom: "3px" }}>{meta.title}</div>
              <div>{meta.channel} · {fmtDur(meta.durationSeconds)}</div>
            </div>
          </div>
        )}
        <p style={{ fontSize: "12.5px", color: "var(--tx-d-dim)", margin: "10px 0 0" }}>
          Opcional: puedes crear el archivo sin video y añadirlo después.
        </p>
      </Card>

      {/* Paso 2: Persona */}
      <Card>
        <span style={labelStyle}>Paso 2 · Persona entrevistada</span>
        {!creatingPerson ? (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <select value={personId} onChange={(e) => setPersonId(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: "220px" }}>
              <option value="">— Sin asignar por ahora —</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            <button type="button" style={btnGhost} onClick={() => setCreatingPerson(true)}>
              + Nueva persona
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} placeholder="Nombre completo" style={{ ...inputStyle, flex: 1, minWidth: "220px" }} />
            <button type="button" style={btnGhost} onClick={() => { setCreatingPerson(false); setNewPersonName(""); }}>
              Cancelar
            </button>
          </div>
        )}
      </Card>

      {/* Paso 3: Título editorial y crear */}
      <Card>
        <span style={labelStyle}>Paso 3 · Título editorial</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del archivo" style={inputStyle} />
        <div style={{ marginTop: "16px" }}>
          <button type="button" style={{ ...btnPrimary, opacity: pending ? 0.7 : 1 }} disabled={pending} onClick={create}>
            {pending ? "Creando…" : "Crear archivo y continuar"}
          </button>
        </div>
      </Card>
    </div>
  );
}
