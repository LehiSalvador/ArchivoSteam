"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArchiveCard } from "@/components/archive-card";
import { getArchives, getCities, getCollections, getDisciplines } from "@/lib/repository";
import { norm } from "@/lib/format";

const PER = 9;
const SORTS: [string, string][] = [
  ["recientes", "Recientes"],
  ["relevancia", "Relevancia"],
  ["numero", "Número de archivo"],
  ["vistas", "Vistas"],
  ["escuchas", "Escuchas"],
  ["guardados", "Guardados"],
];

export function LibraryExplorer() {
  const searchParams = useSearchParams();
  const colParam = searchParams.get("col");

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recientes");
  const [fCity, setFCity] = useState<string[]>([]);
  const [fDisc, setFDisc] = useState<string[]>([]);
  const [fCol, setFCol] = useState<string[]>(colParam ? [colParam] : []);
  const [fTranscript, setFTranscript] = useState(false);
  const [fAudio, setFAudio] = useState(false);
  const [page, setPage] = useState(1);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cities = getCities();
  const disciplines = getDisciplines();
  const collections = getCollections();
  const all = getArchives();

  useEffect(() => {
    if (colParam) {
      setFCol([colParam]);
      setFCity([]);
      setFDisc([]);
      setPage(1);
    }
  }, [colParam]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [q, sort, fCity, fDisc, fCol, fTranscript, fAudio, page]);

  const filtered = useMemo(() => {
    const nq = norm(q);
    const list = all.filter((a) => {
      if (fCity.length && !fCity.includes(a.city)) return false;
      if (fDisc.length && !a.disc.some((d) => fDisc.includes(d))) return false;
      if (fCol.length && !a.cols.some((c) => fCol.includes(c))) return false;
      if (fTranscript && !(a.transcript && a.transcript.length)) return false;
      if (fAudio && a.audio !== "READY") return false;
      if (nq) {
        const hay = norm([a.numStr, a.name, a.role, a.inst, a.cityName, a.title, a.summary, a.discLabel, a.topics.join(" "), a.cols.join(" ")].join(" "));
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
    list.sort((x, y) => {
      if (sort === "numero") return x.n - y.n;
      if (sort === "vistas") return y.views - x.views;
      if (sort === "escuchas") return y.listens - x.listens;
      if (sort === "guardados") return y.saves - x.saves;
      if (sort === "relevancia") return y.trend - x.trend;
      return (y.pub || "").localeCompare(x.pub || "");
    });
    return list;
  }, [all, q, sort, fCity, fDisc, fCol, fTranscript, fAudio]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const curPage = Math.min(page, pages);
  const slice = filtered.slice((curPage - 1) * PER, (curPage - 1) * PER + PER);

  const cityName = (id: string) => cities.find((c) => c.id === id)?.name || id;
  const colTitle = (id: string) => collections.find((c) => c.id === id)?.title || id;

  const toggleIn = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    setPage(1);
  };

  const hasActiveFilters = fCity.length > 0 || fDisc.length > 0 || fCol.length > 0 || fTranscript || fAudio;

  const activeFilters = [
    ...fCity.map((id) => ({ key: `city-${id}`, label: cityName(id), remove: () => toggleIn(fCity, setFCity, id) })),
    ...fDisc.map((id) => ({ key: `disc-${id}`, label: disciplines[id], remove: () => toggleIn(fDisc, setFDisc, id) })),
    ...fCol.map((id) => ({ key: `col-${id}`, label: colTitle(id), remove: () => toggleIn(fCol, setFCol, id) })),
    ...(fTranscript ? [{ key: "tr", label: "Con transcripción", remove: () => { setFTranscript(false); setPage(1); } }] : []),
    ...(fAudio ? [{ key: "au", label: "Con audio", remove: () => { setFAudio(false); setPage(1); } }] : []),
  ];

  const clearAll = () => {
    setFCity([]);
    setFDisc([]);
    setFCol([]);
    setFTranscript(false);
    setFAudio(false);
    setQ("");
    setPage(1);
    setOpenFilter(null);
  };

  const tg = (id: string) => setOpenFilter((cur) => (cur === id ? null : id));
  const dd = (base: string, count: number) => (count ? `${base} · ${count}` : base);

  return (
    <section data-screen-label="Biblioteca" style={{ background: "var(--ink)", padding: "44px 5vw 90px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", margin: 0 }}>Biblioteca</p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(30px,4.4vw,48px)", color: "var(--marfil)", margin: "12px 0 6px" }}>Explorar el archivo</h1>
        <p style={{ fontSize: "16px", color: "var(--tx-d-mut)", margin: "0 0 26px", maxWidth: "60ch" }}>Busca por nombre, tema, ciudad, disciplina o número de archivo. Combina filtros para encontrar exactamente lo que buscas.</p>

        <div style={{ position: "relative", marginBottom: "22px" }}>
          <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "var(--tx-d-dim)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
          </span>
          <input type="search" autoComplete="off" data-lpignore="true" data-1p-ignore value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar: nombre, tema, ciudad, «Archivo 024»…" aria-label="Buscar en el archivo" style={{ width: "100%", background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "12px", padding: "16px 18px 16px 50px", color: "var(--marfil)", fontSize: "16px" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--tx-d-mut)" }}>{filtered.length} {filtered.length === 1 ? "archivo" : "archivos"}</span>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--tx-d-mut)" }}>
            Ordenar
            <select onChange={(e) => setSort(e.target.value)} value={sort} style={{ background: "var(--ink-3)", border: "1px solid var(--line-dark)", borderRadius: "9px", padding: "10px 12px", color: "var(--marfil)", fontSize: "13px", fontWeight: 600 }}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>

        <div className="lib-toolbar" style={{ position: "relative", zIndex: 6, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Dropdown open={openFilter === "city"} onToggle={() => tg("city")} label={dd("Ciudad", fCity.length)} active={fCity.length > 0}>
            {cities.map((c) => <button key={c.id} className="chip" data-on={fCity.includes(c.id) ? "1" : "0"} onClick={() => toggleIn(fCity, setFCity, c.id)}>{c.name}</button>)}
          </Dropdown>
          <Dropdown open={openFilter === "disc"} onToggle={() => tg("disc")} label={dd("Disciplina", fDisc.length)} active={fDisc.length > 0}>
            {Object.entries(disciplines).map(([id, name]) => <button key={id} className="chip" data-on={fDisc.includes(id) ? "1" : "0"} onClick={() => toggleIn(fDisc, setFDisc, id)}>{name}</button>)}
          </Dropdown>
          <Dropdown open={openFilter === "col"} onToggle={() => tg("col")} label={dd("Colección", fCol.length)} active={fCol.length > 0}>
            {collections.map((c) => <button key={c.id} className="chip" data-on={fCol.includes(c.id) ? "1" : "0"} onClick={() => toggleIn(fCol, setFCol, c.id)}>{c.title}</button>)}
          </Dropdown>
          <Dropdown open={openFilter === "avail"} onToggle={() => tg("avail")} label={dd("Disponibilidad", (fTranscript ? 1 : 0) + (fAudio ? 1 : 0))} active={fTranscript || fAudio}>
            <button className="chip" data-on={fTranscript ? "1" : "0"} onClick={() => { setFTranscript((v) => !v); setPage(1); }}>Con transcripción</button>
            <button className="chip" data-on={fAudio ? "1" : "0"} onClick={() => { setFAudio((v) => !v); setPage(1); }}>Con audio</button>
          </Dropdown>
          {hasActiveFilters && <button onClick={clearAll} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "12.5px", fontWeight: 600, padding: "8px 4px" }}>Limpiar</button>}
          <span style={{ flex: 1, minWidth: "10px" }} />
        </div>
        {openFilter && <div onClick={() => setOpenFilter(null)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />}

        {hasActiveFilters && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {activeFilters.map((f) => (
              <button key={f.key} onClick={f.remove} style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "var(--gold-soft)", border: "1px solid var(--gold)", color: "var(--gold-bright)", borderRadius: "999px", padding: "6px 12px", fontSize: "12.5px", fontWeight: 600 }}>
                {f.label} <span style={{ fontSize: "14px", lineHeight: 1 }}>×</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ border: "1px solid var(--line-dark-2)", borderRadius: "14px", overflow: "hidden" }}>
                <div className="skel" style={{ aspectRatio: "16/9" }} />
                <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: "9px" }}>
                  <div className="skel" style={{ height: "12px", width: "40%", borderRadius: "4px" }} />
                  <div className="skel" style={{ height: "16px", width: "70%", borderRadius: "4px" }} />
                  <div className="skel" style={{ height: "12px", width: "90%", borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid-3">
              {slice.map((a) => <ArchiveCard key={a.n} archive={a} footer="durpub" />)}
            </div>
            {pages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "40px" }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="chip" style={{ width: "40px", height: "40px", padding: 0 }} aria-label="Página anterior">‹</button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className="chip" data-on={i + 1 === curPage ? "1" : "0"} style={{ minWidth: "40px", height: "40px", padding: 0, fontFamily: "var(--mono)" }}>{i + 1}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} className="chip" style={{ width: "40px", height: "40px", padding: 0 }} aria-label="Página siguiente">›</button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed var(--line-dark)", borderRadius: "16px" }}>
            <div style={{ fontSize: "34px", marginBottom: "14px", opacity: 0.5 }}>⌕</div>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "24px", color: "var(--marfil)", margin: "0 0 8px" }}>Sin coincidencias</h3>
            <p style={{ fontSize: "15px", color: "var(--tx-d-mut)", margin: "0 0 22px", maxWidth: "44ch", marginInline: "auto" }}>No encontramos archivos para «{q}» con los filtros actuales. Prueba con otros términos o limpia los filtros.</p>
            <button onClick={clearAll} style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "14px", padding: "12px 22px", border: "none", borderRadius: "9px" }}>Limpiar búsqueda y filtros</button>
          </div>
        )}
      </div>
    </section>
  );
}

function Dropdown({ open, onToggle, label, active, children }: { open: boolean; onToggle: () => void; label: string; active: boolean; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onToggle} className="lib-dd" data-on={active ? "1" : "0"}>
        {label} <span style={{ opacity: 0.55, fontSize: "11px" }}>▾</span>
      </button>
      {open && <div className="lib-pop">{children}</div>}
    </div>
  );
}
