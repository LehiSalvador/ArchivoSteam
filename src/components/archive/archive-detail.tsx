"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useStore } from "@/components/providers/store";
import { ArchiveCard } from "@/components/archive-card";
import { fmtDate, mmss, thumbBg } from "@/lib/format";
import type { Archive, AudioState } from "@/types/domain";

const TABS = [
  ["resumen", "Resumen"],
  ["persona", "Persona"],
  ["investig", "Investigación"],
  ["aplic", "Aplicaciones"],
  ["transcript", "Transcripción"],
  ["fuentes", "Fuentes"],
] as const;

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const fuenteColor: Record<string, string> = {
  declaracion: "var(--gold)",
  investigacion: "var(--gold-bright)",
  externa: "var(--info)",
  complementario: "var(--tx-d-dim)",
};
const fuenteLabel: Record<string, string> = {
  declaracion: "Declaración",
  investigacion: "Investigación",
  externa: "Externa",
  complementario: "Complementario",
};

function pctFromClick(e: MouseEvent<HTMLDivElement>): number {
  const rect = e.currentTarget.getBoundingClientRect();
  return Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
}

export function ArchiveDetail({ archive, related }: { archive: Archive; related: Archive[] }) {
  const { isSaved, toggleSave, showToast } = useStore();
  const [tab, setTab] = useState<string>("resumen");
  const [chapterIdx, setChapterIdx] = useState(0);
  const [tMode, setTMode] = useState<"literal" | "corregida" | "resumen">("literal");
  const [tQuery, setTQuery] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoPct, setVideoPct] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPct, setAudioPct] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [audioState, setAudioState] = useState<AudioState>(archive.audio);
  const [shareOpen, setShareOpen] = useState(false);
  const [corrOpen, setCorrOpen] = useState(false);
  const [corrOk, setCorrOk] = useState(false);
  const audioTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const saved = isSaved(archive.n);

  useEffect(() => {
    try {
      const sp = JSON.parse(localStorage.getItem(`as_pos_${archive.slug}`) || "null");
      if (sp) {
        setVideoPct(sp.v || 0);
        setAudioPct(sp.a || 0);
      }
    } catch {
      /* ignore */
    }
  }, [archive.slug]);

  useEffect(() => {
    const id = setInterval(() => {
      setVideoPct((v) => {
        if (!videoPlaying) return v;
        const nv = Math.min(100, v + 1.6);
        if (nv >= 100) setVideoPlaying(false);
        return nv;
      });
      setAudioPct((a) => {
        if (!audioPlaying || audioState !== "READY") return a;
        const na = Math.min(100, a + 1.3 * speed);
        if (na >= 100) setAudioPlaying(false);
        return na;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [videoPlaying, audioPlaying, audioState, speed]);

  useEffect(() => {
    try {
      localStorage.setItem(`as_pos_${archive.slug}`, JSON.stringify({ v: Math.round(videoPct), a: Math.round(audioPct) }));
    } catch {
      /* ignore */
    }
  }, [videoPct, audioPct, archive.slug]);

  useEffect(() => () => audioTimers.current.forEach(clearTimeout), []);

  const generateAudio = () => {
    setAudioState("QUEUED");
    audioTimers.current.forEach(clearTimeout);
    audioTimers.current = [
      setTimeout(() => setAudioState("PROCESSING"), 600),
      setTimeout(() => {
        setAudioState("READY");
        showToast("Audio generado (demo) ✓");
      }, 2200),
    ];
  };

  const total = archive.durMin * 60;
  const meta = [archive.role, archive.inst, archive.cityName, fmtDate(archive.pub), `${archive.durMin} min`].filter(Boolean).join(" · ");
  const turns = archive.transcript.filter((t) => t.text.toLowerCase().includes(tQuery.toLowerCase()) || t.sp.toLowerCase().includes(tQuery.toLowerCase()));

  return (
    <div style={{ paddingTop: "92px", minHeight: "100vh" }}>
      <article data-screen-label="Archivo" style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 5vw 90px" }}>
        <Link href="/biblioteca" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--tx-d-mut)", fontSize: "13.5px", fontWeight: 600, marginBottom: "22px" }}>← Volver a la biblioteca</Link>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "28px" }}>
          <div style={{ maxWidth: "60ch" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "14px", letterSpacing: ".1em", color: "var(--gold)" }}>{archive.numStr}</span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(28px,4vw,44px)", color: "var(--marfil)", margin: "8px 0 6px", lineHeight: 1.1 }}>{archive.name}</h1>
            <p style={{ fontFamily: "var(--serif)", fontSize: "20px", color: "var(--tx-d-mut)", margin: "0 0 12px" }}>{archive.title}</p>
            <p style={{ fontSize: "14px", color: "var(--tx-d-dim)", margin: 0 }}>{meta}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => toggleSave(archive.n)} className="chip" style={{ padding: "11px 16px" }} aria-pressed={saved}>{saved ? "★ Guardado" : "☆ Guardar"}</button>
            <button onClick={() => setShareOpen(true)} className="chip" style={{ padding: "11px 16px" }}>Compartir</button>
          </div>
        </div>

        <div className="detail-2">
          {/* Video + capítulos */}
          <div>
            <div className="dark" style={{ position: "relative", aspectRatio: "16/9", borderRadius: "16px", overflow: "hidden", background: thumbBg(archive.n), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(13,13,13,.6),rgba(13,13,13,.1))" }} />
              <button onClick={() => setVideoPlaying((v) => !v)} aria-label={videoPlaying ? "Pausar video" : "Reproducir video"} className="play-aura" style={{ position: "relative", width: "76px", height: "76px", borderRadius: "50%", border: "none", background: "var(--gold)", color: "var(--ink)", fontSize: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 30px rgba(0,0,0,.5)" }}>{videoPlaying ? "❚❚" : "▶"}</button>
              <span style={{ position: "absolute", left: "14px", top: "14px", fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", color: "var(--marfil)", background: "rgba(13,13,13,.6)", padding: "5px 9px", borderRadius: "6px", textTransform: "uppercase" }}>Video de demostración</span>
              <span style={{ position: "absolute", right: "14px", bottom: "48px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--tx-d-mut)" }}>{archive.chapters[chapterIdx]?.label}</span>
              <div onClick={(e) => setVideoPct(pctFromClick(e))} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "32px", display: "flex", alignItems: "center", padding: "0 14px", background: "linear-gradient(0deg,rgba(13,13,13,.85),transparent)", cursor: "pointer" }}>
                <div style={{ flex: 1, height: "5px", borderRadius: "3px", background: "rgba(245,245,242,.2)", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: "3px", background: "var(--gold)", width: `${videoPct}%` }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: "20px", border: "1px solid var(--line-dark-2)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-dark-2)", fontWeight: 700, fontSize: "14px", color: "var(--marfil)" }}>Capítulos</div>
              {archive.chapters.map((ch, i) => (
                <button key={i} onClick={() => { setChapterIdx(i); setVideoPct((ch.t / total) * 100); }} data-on={i === chapterIdx ? "1" : "0"} className="hover-gold" style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "12px 18px", background: i === chapterIdx ? "var(--ink-3)" : "transparent", border: "none", borderBottom: "1px solid var(--line-dark-2)", textAlign: "left", color: "var(--tx-d-mut)" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--gold)", minWidth: "44px" }}>{mmss(ch.t)}</span>
                  <span style={{ fontSize: "14px" }}>{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Documentos (tabs) */}
          <div>
            <div role="tablist" aria-label="Documentos del archivo" style={{ display: "flex", flexWrap: "wrap", gap: "2px", borderBottom: "1px solid var(--line-dark-2)", marginBottom: "20px" }}>
              {TABS.map(([id, lbl]) => (
                <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} data-on={tab === id ? "1" : "0"} className="doc-tab" style={{ background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "var(--tx-d-mut)", fontWeight: 600, fontSize: "13.5px", padding: "10px 11px" }}>{lbl}</button>
              ))}
            </div>

            {tab === "resumen" && (
              <div className="rise">
                <p style={{ fontSize: "16px", lineHeight: 1.75, color: "var(--tx-d-mut)", margin: 0 }}>{archive.summary}</p>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--tx-d-mut)", margin: "16px 0 0" }}>Esta conversación documenta el contexto, los temas principales y los aprendizajes que {archive.name} considera valioso preservar.</p>
              </div>
            )}
            {tab === "persona" && (
              <div className="rise">
                <p style={{ fontSize: "16px", lineHeight: 1.75, color: "var(--tx-d-mut)", margin: "0 0 18px" }}>{archive.persona || `Perfil de ${archive.name} (demo).`}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--line-dark-2)", border: "1px solid var(--line-dark-2)", borderRadius: "12px", overflow: "hidden" }}>
                  {[["Cargo", archive.role], ["Disciplina", archive.discLabel], ["Institución (demo)", archive.inst], ["Ciudad", archive.cityName]].map(([k, v]) => (
                    <div key={k} style={{ background: "var(--ink-2)", padding: "16px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase" }}>{k}</span>
                      <p style={{ fontSize: "14px", color: "var(--marfil)", margin: "6px 0 0" }}>{v || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "investig" && (
              <div className="rise">
                <p style={{ fontSize: "16px", lineHeight: 1.75, color: "var(--tx-d-mut)", margin: "0 0 16px" }}>{archive.investig || `Línea de investigación de ${archive.name} (demo).`}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ borderLeft: "2px solid var(--gold)", padding: "4px 0 4px 14px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold)" }}>Problema</span>
                    <p style={{ fontSize: "14px", color: "var(--tx-d-mut)", margin: "4px 0 0", lineHeight: 1.6 }}>{archive.summary}</p>
                  </div>
                  <div style={{ borderLeft: "2px solid var(--line-dark)", padding: "4px 0 4px 14px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--tx-d-dim)" }}>Relevancia</span>
                    <p style={{ fontSize: "14px", color: "var(--tx-d-mut)", margin: "4px 0 0", lineHeight: 1.6 }}>Aporta conocimiento aplicable a su disciplina y a su contexto.</p>
                  </div>
                </div>
              </div>
            )}
            {tab === "aplic" && (
              <div className="rise">
                <p style={{ fontSize: "16px", lineHeight: 1.75, color: "var(--tx-d-mut)", margin: 0 }}>{archive.aplic || `Aplicaciones del trabajo de ${archive.name} (demo).`}</p>
              </div>
            )}
            {tab === "transcript" && (
              <div className="rise">
                <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                  <button onClick={() => setTMode("literal")} className="chip" data-on={tMode === "literal" ? "1" : "0"}>Literal</button>
                  <button onClick={() => setTMode("corregida")} className="chip" data-on={tMode === "corregida" ? "1" : "0"}>Corregida</button>
                  <button onClick={() => setTMode("resumen")} className="chip" data-on={tMode === "resumen" ? "1" : "0"}>Resumen</button>
                </div>
                {tMode === "resumen" ? (
                  <p style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--tx-d-mut)", margin: 0 }}>Resumen editorial de la conversación con {archive.name}: {archive.summary} A lo largo de la charla se abordan sus decisiones, errores y aprendizajes.</p>
                ) : (
                  <>
                    <input type="search" autoComplete="off" data-lpignore="true" data-1p-ignore value={tQuery} onChange={(e) => setTQuery(e.target.value)} placeholder="Buscar en la transcripción…" aria-label="Buscar en la transcripción" style={{ width: "100%", background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "9px", padding: "10px 14px", color: "var(--marfil)", fontSize: "14px", marginBottom: "12px" }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--tx-d-dim)", display: "block", marginBottom: "12px" }}>{turns.length} intervenciones</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {turns.map((t, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px" }}>
                          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold)", minWidth: "44px", paddingTop: "2px" }}>{t.time}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: t.sp === "Archivo STEAM" ? "var(--gold)" : "var(--marfil)" }}>{t.sp}</span>
                              <button onClick={() => { navigator.clipboard?.writeText(t.text); showToast("Cita copiada ✓"); }} aria-label="Copiar cita" style={{ background: "none", border: "none", color: "var(--tx-d-dim)", fontSize: "11px" }}>⧉ copiar</button>
                            </div>
                            <p style={{ fontSize: "14.5px", lineHeight: 1.65, color: "var(--tx-d-mut)", margin: "4px 0 0" }}>{t.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {tab === "fuentes" && (
              <div className="rise" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {archive.fuentes.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px 16px", border: "1px solid var(--line-dark-2)", borderRadius: "10px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".08em", color: fuenteColor[f.kind] || "var(--tx-d-dim)", textTransform: "uppercase", minWidth: "96px", paddingTop: "2px" }}>{fuenteLabel[f.kind] || f.kind}</span>
                    <div>
                      <p style={{ fontSize: "14.5px", color: "var(--marfil)", margin: 0 }}>{f.title}</p>
                      <p style={{ fontSize: "12.5px", color: "var(--tx-d-dim)", margin: "4px 0 0" }}>{f.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audio */}
            <div style={{ marginTop: "26px", border: "1px solid var(--line-dark-2)", borderRadius: "14px", padding: "20px", background: "var(--ink-2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--marfil)" }}>Versión de audio</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", color: "var(--tx-d-dim)", textTransform: "uppercase" }}>Demo · ElevenLabs</span>
              </div>
              {audioState === "NOT_REQUESTED" && (
                <button onClick={generateAudio} className="btn-aura" style={{ width: "100%", background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "9px", padding: "13px", fontWeight: 700, fontSize: "14px" }}>Generar versión de audio</button>
              )}
              {(audioState === "QUEUED" || audioState === "PROCESSING") && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
                  <span className="spin" style={{ width: "18px", height: "18px", border: "2px solid var(--line-dark)", borderTopColor: "var(--gold)", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: "14px", color: "var(--tx-d-mut)" }}>{audioState === "QUEUED" ? "En cola…" : "Generando audio…"}</span>
                </div>
              )}
              {audioState === "FAILED" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ fontSize: "14px", color: "oklch(.7 .13 40)" }}>No se pudo generar el audio.</span>
                  <button onClick={generateAudio} className="chip" data-on="1">Reintentar</button>
                </div>
              )}
              {audioState === "OUTDATED" && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(196,140,54,.12)", border: "1px solid var(--gold)", borderRadius: "9px", padding: "10px 12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--gold-bright)" }}>Audio desactualizado respecto al documento.</span>
                  <button onClick={generateAudio} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--gold)", fontWeight: 600, fontSize: "12.5px" }}>Regenerar</button>
                </div>
              )}
              {(audioState === "READY" || audioState === "OUTDATED") && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <button onClick={() => setAudioPlaying((v) => !v)} aria-label={audioPlaying ? "Pausar audio" : "Reproducir audio"} style={{ width: "48px", height: "48px", borderRadius: "50%", border: "none", background: "var(--gold)", color: "var(--ink)", fontSize: "15px", flex: "none" }}>{audioPlaying ? "❚❚" : "▶"}</button>
                    <div onClick={(e) => setAudioPct(pctFromClick(e))} style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(245,245,242,.16)", position: "relative", cursor: "pointer" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: "3px", background: "var(--gold)", width: `${audioPct}%` }} />
                    </div>
                    <button onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])} className="chip" style={{ flex: "none" }}>{speed}×</button>
                  </div>
                  <span style={{ fontSize: "11.5px", color: "var(--tx-d-dim)", display: "block", marginTop: "10px" }}>Continúa donde te quedaste · posición guardada localmente</span>
                </>
              )}
            </div>
            <div style={{ marginTop: "18px" }}>
              <button onClick={() => { setCorrOk(false); setCorrOpen(true); }} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13.5px", fontWeight: 600, padding: 0 }}>Reportar una corrección</button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: "64px" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "26px", color: "var(--marfil)", margin: "0 0 20px" }}>Archivos relacionados</h2>
            <div className="grid-3">
              {related.map((a) => <ArchiveCard key={a.n} archive={a} showSave={false} footer="none" />)}
            </div>
          </div>
        )}
      </article>

      {shareOpen && <ShareModal slug={archive.slug} onClose={() => setShareOpen(false)} onCopy={() => showToast("Enlace copiado ✓")} />}
      {corrOpen && <CorrectionModal ok={corrOk} onClose={() => setCorrOpen(false)} onSubmit={() => setCorrOk(true)} />}
    </div>
  );
}

function ShareModal({ slug, onClose, onCopy }: { slug: string; onClose: () => void; onCopy: () => void }) {
  const copy = () => {
    try {
      navigator.clipboard?.writeText(`${window.location.origin}/archivo/${slug}`);
    } catch {
      /* ignore */
    }
    onCopy();
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 92, background: "rgba(5,5,5,.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "5vw" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(460px,100%)", background: "var(--ink-2)", border: "1px solid var(--line-dark)", borderRadius: "16px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--marfil)" }}>Compartir archivo</span>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: "none", border: "none", color: "var(--tx-d-mut)", fontSize: "22px" }}>×</button>
        </div>
        <button onClick={copy} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "10px", padding: "13px 16px", color: "var(--marfil)", fontSize: "14px" }}>
          Copiar enlace <span style={{ color: "var(--gold)", fontFamily: "var(--mono)" }}>⧉</span>
        </button>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          {["Instagram", "X", "LinkedIn", "Correo"].map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
      </div>
    </div>
  );
}

function CorrectionModal({ ok, onClose, onSubmit }: { ok: boolean; onClose: () => void; onSubmit: () => void }) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 92, background: "rgba(5,5,5,.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "5vw" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(520px,100%)", background: "var(--ink-2)", border: "1px solid var(--line-dark)", borderRadius: "16px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--marfil)" }}>Reportar una corrección</span>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: "none", border: "none", color: "var(--tx-d-mut)", fontSize: "22px" }}>×</button>
        </div>
        {ok ? (
          <div style={{ textAlign: "center", padding: "28px 10px" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>✓</div>
            <p style={{ fontSize: "15px", color: "var(--marfil)", margin: "0 0 6px", fontWeight: 600 }}>Corrección recibida (demo)</p>
            <p style={{ fontSize: "13.5px", color: "var(--tx-d-mut)", margin: "0 0 18px" }}>Gracias. La revisaríamos y responderíamos por correo.</p>
            <button onClick={onClose} className="chip">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "13px", color: "var(--tx-d-mut)" }}>
              ¿Qué dato hay que corregir?
              <select style={{ background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "9px", padding: "11px 13px", color: "var(--marfil)", fontSize: "14px" }} defaultValue="Nombre o cargo">
                <option>Nombre o cargo</option>
                <option>Fecha</option>
                <option>Transcripción</option>
                <option>Una cita</option>
                <option>Un enlace o fuente</option>
                <option>Otro dato</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "13px", color: "var(--tx-d-mut)" }}>
              Explicación
              <textarea required rows={4} style={{ background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "9px", padding: "11px 13px", color: "var(--marfil)", fontSize: "14px", resize: "vertical" }} />
            </label>
            <button type="submit" style={{ alignSelf: "flex-start", background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "9px", padding: "12px 22px", fontWeight: 700, fontSize: "14px" }}>Enviar corrección</button>
          </form>
        )}
      </div>
    </div>
  );
}
