"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import {
  updateArchiveAction,
  setClassificationAction,
  transitionArchiveAction,
  importYoutubeAction,
  type ArchiveTransition,
} from "@/lib/admin/actions";
import { Card, StatusBadge, btnPrimary, btnGhost, inputStyle, labelStyle } from "@/components/admin/ui";

export interface Opt {
  id: string;
  label: string;
}

interface EditorProps {
  id: string;
  initial: {
    title: string;
    subtitle: string | null;
    short_description: string | null;
    card_description: string | null;
    highlight_phrase: string | null;
    summary: string | null;
    research: string | null;
    applications: string | null;
    transcript: string | null;
    person_id: string | null;
    city_id: string | null;
    institution_id: string | null;
    primary_discipline_id: string | null;
    youtube_video_id: string | null;
    youtube_url: string | null;
    youtube_channel: string | null;
    youtube_thumbnail_url: string | null;
    duration_seconds: number | null;
    is_featured: boolean;
    is_trending: boolean;
    visibility: string;
    status: string;
    slug: string;
    archive_number: number | null;
    published_at: string | null;
  };
  people: Opt[];
  cities: Opt[];
  institutions: Opt[];
  disciplines: Opt[];
  topics: Opt[];
  collections: Opt[];
  tours: Opt[];
  topicIds: string[];
  collectionIds: string[];
  tourIds: string[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ArchiveEditor(props: EditorProps) {
  const router = useRouter();
  const [f, setF] = useState(props.initial);
  const [topicIds, setTopicIds] = useState<string[]>(props.topicIds);
  const [collectionIds, setCollectionIds] = useState<string[]>(props.collectionIds);
  const [tourIds, setTourIds] = useState<string[]>(props.tourIds);
  const [status, setStatus] = useState(props.initial.status);
  const [save, setSave] = useState<SaveState>("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatch = useRef<Record<string, unknown>>({});

  const flush = useCallback(() => {
    const patch = pendingPatch.current;
    pendingPatch.current = {};
    if (Object.keys(patch).length === 0) return;
    setSave("saving");
    updateArchiveAction(props.id, patch).then((r) => {
      setSave(r.ok ? "saved" : "error");
      if (!r.ok) setMsg(r.error);
    });
  }, [props.id]);

  const scheduleSave = useCallback(
    (patch: Record<string, unknown>) => {
      pendingPatch.current = { ...pendingPatch.current, ...patch };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 1000);
    },
    [flush],
  );

  const set = <K extends keyof EditorProps["initial"]>(key: K, value: EditorProps["initial"][K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
    scheduleSave({ [key]: value });
  };

  const saveClassification = (next: { topicIds?: string[]; collectionIds?: string[]; tourIds?: string[] }) => {
    setSave("saving");
    setClassificationAction(props.id, next).then((r) => setSave(r.ok ? "saved" : "error"));
  };

  const toggleIn = (
    list: string[],
    setList: (v: string[]) => void,
    id: string,
    key: "topicIds" | "collectionIds" | "tourIds",
  ) => {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setList(next);
    saveClassification({ [key]: next });
  };

  const resync = () => {
    const ref = f.youtube_video_id || f.youtube_url;
    if (!ref) return;
    start(async () => {
      const r = await importYoutubeAction(ref);
      if (!r.ok) return setMsg(r.error);
      const m = r.meta as {
        channel: string; thumbnailUrl: string; durationSeconds: number; publishedAt: string | null; chapters: unknown; raw: unknown;
      };
      const patch = {
        youtube_channel: m.channel,
        youtube_thumbnail_url: m.thumbnailUrl,
        duration_seconds: m.durationSeconds,
        video_published_at: m.publishedAt,
        chapters: m.chapters,
        youtube_raw: m.raw,
        youtube_synced_at: new Date().toISOString(),
      };
      const res = await updateArchiveAction(props.id, patch);
      if (res.ok) {
        setF((p) => ({ ...p, youtube_channel: m.channel, youtube_thumbnail_url: m.thumbnailUrl, duration_seconds: m.durationSeconds }));
        setMsg("Metadatos actualizados.");
      } else setMsg(res.error);
    });
  };

  const transition = (action: ArchiveTransition, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    flush();
    setMsg(null);
    start(async () => {
      const r = await transitionArchiveAction(props.id, action);
      if (!r.ok) return setMsg(r.error);
      setStatus(r.status);
      router.refresh();
    });
  };

  const saveLabel = { idle: "", saving: "Guardando…", saved: "Guardado ✓", error: "Error al guardar" }[save];

  return (
    <div style={{ display: "grid", gap: "16px", maxWidth: "860px", paddingBottom: "40px" }}>
      {/* Barra superior pegajosa */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", background: "var(--ink)", padding: "10px 0", borderBottom: "1px solid var(--line-dark-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/admin/archivos" style={{ color: "var(--tx-d-mut)", fontSize: "13px" }}>← Archivos</Link>
          <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--gold)" }}>
            {f.archive_number ? String(f.archive_number).padStart(3, "0") : "—"}
          </span>
          <StatusBadge status={status} />
          <span style={{ fontSize: "12px", color: save === "error" ? "#f0a6a6" : "var(--tx-d-dim)" }}>{saveLabel}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link href={`/vista-previa/${props.id}`} style={btnGhost}>Vista previa</Link>
          {status !== "PUBLISHED" && (
            <button type="button" style={btnPrimary} disabled={pending} onClick={() => transition("publish")}>Publicar</button>
          )}
          {status === "PUBLISHED" && (
            <>
              <Link href={`/archivo/${f.slug}`} target="_blank" style={btnGhost}>Ver público ↗</Link>
              <button type="button" style={btnGhost} disabled={pending} onClick={() => transition("unpublish", "¿Despublicar?")}>Despublicar</button>
            </>
          )}
        </div>
      </div>

      {msg && (
        <div style={{ background: "rgba(201,154,68,.12)", border: "1px solid rgba(201,154,68,.4)", color: "var(--gold)", fontSize: "13px", padding: "10px 14px", borderRadius: "9px" }}>{msg}</div>
      )}

      {/* Video */}
      <Card>
        <span style={labelStyle}>Video</span>
        {f.youtube_video_id ? (
          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            {f.youtube_thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.youtube_thumbnail_url} alt="" style={{ width: "140px", borderRadius: "8px" }} />
            )}
            <div style={{ fontSize: "13px", color: "var(--tx-d-mut)", flex: 1, minWidth: "180px" }}>
              <div style={{ color: "var(--marfil)" }}>{f.youtube_channel || "—"}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{f.youtube_video_id}</div>
              <button type="button" style={{ ...btnGhost, marginTop: "8px" }} disabled={pending} onClick={resync}>Re-sincronizar metadatos</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <input placeholder="URL o ID de YouTube" style={{ ...inputStyle, flex: 1 }} onChange={(e) => set("youtube_url", e.target.value)} defaultValue={f.youtube_url ?? ""} />
            <button type="button" style={btnGhost} disabled={pending} onClick={resync}>Importar</button>
          </div>
        )}
      </Card>

      {/* Persona y clasificación */}
      <Card>
        <span style={labelStyle}>Persona y clasificación</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <SelectField label="Persona" value={f.person_id ?? ""} opts={props.people} onChange={(v) => set("person_id", v || null)} />
          <SelectField label="Ciudad" value={f.city_id ?? ""} opts={props.cities} onChange={(v) => set("city_id", v || null)} />
          <SelectField label="Institución" value={f.institution_id ?? ""} opts={props.institutions} onChange={(v) => set("institution_id", v || null)} />
          <SelectField label="Disciplina" value={f.primary_discipline_id ?? ""} opts={props.disciplines} onChange={(v) => set("primary_discipline_id", v || null)} />
        </div>
        <MultiSelect label="Temas" opts={props.topics} selected={topicIds} onToggle={(id) => toggleIn(topicIds, setTopicIds, id, "topicIds")} />
        <MultiSelect label="Colecciones" opts={props.collections} selected={collectionIds} onToggle={(id) => toggleIn(collectionIds, setCollectionIds, id, "collectionIds")} />
        <MultiSelect label="Recorridos" opts={props.tours} selected={tourIds} onToggle={(id) => toggleIn(tourIds, setTourIds, id, "tourIds")} />
      </Card>

      {/* Presentación */}
      <Card>
        <span style={labelStyle}>Presentación</span>
        <div style={{ display: "grid", gap: "12px" }}>
          <TextField label="Título" value={f.title} onChange={(v) => set("title", v)} />
          <TextField label="Subtítulo" value={f.subtitle ?? ""} onChange={(v) => set("subtitle", v)} />
          <TextField label="Descripción corta" value={f.short_description ?? ""} onChange={(v) => set("short_description", v)} />
          <TextField label="Descripción de tarjeta" value={f.card_description ?? ""} onChange={(v) => set("card_description", v)} />
          <TextField label="Frase destacada" value={f.highlight_phrase ?? ""} onChange={(v) => set("highlight_phrase", v)} />
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <Toggle label="Destacado" checked={f.is_featured} onChange={(v) => set("is_featured", v)} />
            <Toggle label="Tendencia" checked={f.is_trending} onChange={(v) => set("is_trending", v)} />
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "var(--tx-d-mut)" }}>
              Visibilidad
              <select value={f.visibility} onChange={(e) => set("visibility", e.target.value)} style={{ ...inputStyle, width: "auto", padding: "7px 10px" }}>
                <option value="PUBLIC">Pública</option>
                <option value="UNLISTED">No listada</option>
              </select>
            </label>
          </div>
        </div>
      </Card>

      {/* Documentación */}
      <Card>
        <span style={labelStyle}>Documentación</span>
        <div style={{ display: "grid", gap: "14px" }}>
          <AreaField label="Resumen" value={f.summary ?? ""} onChange={(v) => set("summary", v)} />
          <AreaField label="Investigación" value={f.research ?? ""} onChange={(v) => set("research", v)} />
          <AreaField label="Aplicaciones" value={f.applications ?? ""} onChange={(v) => set("applications", v)} />
          <AreaField label="Transcripción" value={f.transcript ?? ""} onChange={(v) => set("transcript", v)} rows={8} />
        </div>
      </Card>

      {/* Publicación */}
      <Card>
        <span style={labelStyle}>Publicación</span>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="button" style={btnGhost} disabled={pending} onClick={() => { flush(); setMsg("Borrador guardado."); }}>Guardar borrador</button>
          {status !== "READY" && status !== "PUBLISHED" && (
            <button type="button" style={btnGhost} disabled={pending} onClick={() => transition("ready")}>Marcar como listo</button>
          )}
          {status !== "PUBLISHED" && (
            <button type="button" style={btnPrimary} disabled={pending} onClick={() => transition("publish")}>Publicar ahora</button>
          )}
          {status !== "ARCHIVED" ? (
            <button type="button" style={btnGhost} disabled={pending} onClick={() => transition("archive", "¿Archivar este archivo?")}>Archivar</button>
          ) : (
            <button type="button" style={btnGhost} disabled={pending} onClick={() => transition("restore")}>Restaurar</button>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ── Campos ─────────────────────────────────────────────────────────────── */
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </label>
  );
}

function AreaField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "var(--sans)" }} />
    </label>
  );
}

function SelectField({ label, value, opts, onChange }: { label: string; value: string; opts: Opt[]; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">— Sin asignar —</option>
        {opts.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function MultiSelect({ label, opts, selected, onToggle }: { label: string; opts: Opt[]; selected: string[]; onToggle: (id: string) => void }) {
  if (opts.length === 0) return null;
  return (
    <div style={{ marginTop: "12px" }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
        {opts.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onToggle(o.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "12.5px",
                border: `1px solid ${on ? "var(--gold)" : "var(--line-dark)"}`,
                background: on ? "rgba(201,154,68,.16)" : "transparent",
                color: on ? "var(--gold)" : "var(--tx-d-mut)",
                cursor: "pointer",
              }}
            >
              {on ? "✓ " : ""}{o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "var(--tx-d-mut)", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
