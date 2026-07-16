"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/components/providers/store";
import { getArchives, getCities, getCollections } from "@/lib/repository";
import { norm } from "@/lib/format";

interface SResult {
  kind: string;
  title: string;
  sub: string;
  href: string;
}

function useSearchResults(q: string): SResult[] {
  return useMemo(() => {
    const n = norm(q);
    if (!n) return [];
    const res: SResult[] = [];
    for (const a of getArchives()) {
      const hay = norm([a.numStr, a.name, a.role, a.title, a.cityName, a.discLabel, a.topics.join(" ")].join(" "));
      if (hay.includes(n)) res.push({ kind: "Archivo", title: `${a.numStr} · ${a.name}`, sub: a.title, href: `/archivo/${a.slug}` });
    }
    for (const c of getCities()) {
      if (norm(c.name).includes(n)) res.push({ kind: "Ciudad", title: c.name, sub: c.tag, href: `/recorridos/${c.id}` });
    }
    for (const c of getCollections()) {
      if (norm(c.title).includes(n)) res.push({ kind: "Colección", title: c.title, sub: `${c.count} archivos`, href: `/biblioteca?col=${c.id}` });
    }
    return res.slice(0, 8);
  }, [q]);
}

function SearchOverlay() {
  const { searchOpen, closeSearch } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useSearchResults(q);

  useEffect(() => {
    if (searchOpen) {
      setQ("");
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  if (!searchOpen) return null;
  const idle = q.trim() === "";
  const suggestions = getCollections().slice(0, 5).map((c) => ({ label: c.title, href: `/biblioteca?col=${c.id}` }));

  return (
    <div onClick={closeSearch} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(5,5,5,.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12vh 5vw 5vw" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(680px,100%)", background: "var(--ink-2)", border: "1px solid var(--line-dark)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 22px", borderBottom: "1px solid var(--line-dark-2)" }}>
          <span style={{ color: "var(--gold)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
          </span>
          <input ref={inputRef} id="global-search-input" type="search" autoComplete="off" data-lpignore="true" data-1p-ignore value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar archivos, personas, temas, ciudades…" aria-label="Búsqueda global" style={{ flex: 1, background: "transparent", border: "none", color: "var(--marfil)", fontSize: "17px", outline: "none" }} />
          <button onClick={closeSearch} aria-label="Cerrar" style={{ background: "none", border: "none", color: "var(--tx-d-dim)", fontSize: "20px" }}>×</button>
        </div>
        <div style={{ maxHeight: "52vh", overflow: "auto" }}>
          {!idle && results.length > 0 && (
            <div style={{ padding: "10px" }}>
              {results.map((r, i) => (
                <Link key={i} href={r.href} onClick={closeSearch} className="hover-gold" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", borderRadius: "10px" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", color: "var(--gold)", textTransform: "uppercase", minWidth: "74px" }}>{r.kind}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 600, fontSize: "15px", color: "var(--marfil)" }}>{r.title}</span>
                    <span style={{ display: "block", fontSize: "12.5px", color: "var(--tx-d-dim)" }}>{r.sub}</span>
                  </span>
                  <span style={{ color: "var(--tx-d-dim)", fontFamily: "var(--mono)" }}>→</span>
                </Link>
              ))}
            </div>
          )}
          {!idle && results.length === 0 && (
            <div style={{ padding: "44px 22px", textAlign: "center", color: "var(--tx-d-dim)", fontSize: "14px" }}>Sin resultados para «{q}». Prueba otro término.</div>
          )}
          {idle && (
            <div style={{ padding: "20px 22px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: ".12em", color: "var(--tx-d-dim)", textTransform: "uppercase" }}>Sugerencias</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {suggestions.map((s, i) => (
                  <Link key={i} href={s.href} onClick={closeSearch} className="chip">{s.label}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileMenu() {
  const { menuOpen, closeMenu, openSearch } = useStore();
  if (!menuOpen) return null;
  const item = { color: "var(--marfil)", fontWeight: 600, fontSize: "18px", padding: "12px 0", borderBottom: "1px solid var(--line-dark-2)" } as const;
  return (
    <div onClick={closeMenu} style={{ position: "fixed", inset: 0, zIndex: 96, background: "rgba(5,5,5,.7)", backdropFilter: "blur(4px)" }}>
      <nav onClick={(e) => e.stopPropagation()} aria-label="Menú" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(320px,84vw)", background: "var(--ink-2)", borderLeft: "1px solid var(--line-dark)", padding: "22px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: "15px", letterSpacing: ".13em", color: "var(--marfil)" }}>ARCHIVO <span style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: ".24em" }}>STEAM</span></span>
          <button onClick={closeMenu} aria-label="Cerrar" style={{ background: "none", border: "none", color: "var(--tx-d-mut)", fontSize: "24px" }}>×</button>
        </div>
        <Link href="/" onClick={closeMenu} style={item}>Inicio</Link>
        <Link href="/biblioteca" onClick={closeMenu} style={item}>Biblioteca</Link>
        <Link href="/recorridos" onClick={closeMenu} style={item}>Recorridos</Link>
        <Link href="/proyecto" onClick={closeMenu} style={item}>Proyecto</Link>
        <Link href="/participar" onClick={closeMenu} style={item}>Participar</Link>
        <button onClick={() => { closeMenu(); openSearch(); }} style={{ textAlign: "left", background: "none", border: "none", color: "var(--gold)", fontWeight: 600, fontSize: "18px", padding: "14px 0" }}>Buscar →</button>
      </nav>
    </div>
  );
}

function TrailerModal() {
  const { trailerOpen, closeTrailer } = useStore();
  if (!trailerOpen) return null;
  return (
    <div onClick={closeTrailer} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(5,5,5,.86)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "5vw" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(900px,100%)", background: "var(--ink-2)", border: "1px solid var(--line-dark)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line-dark-2)" }}>
          <span style={{ fontWeight: 700, color: "var(--marfil)" }}>Tráiler · Primera edición</span>
          <button onClick={closeTrailer} aria-label="Cerrar" style={{ background: "none", border: "none", color: "var(--tx-d-mut)", fontSize: "22px", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ aspectRatio: "16/9", background: "repeating-linear-gradient(135deg,rgba(201,154,68,.06) 0 2px,transparent 2px 14px),linear-gradient(160deg,#221d15,#120f09)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px" }}>
          <span style={{ width: "66px", height: "66px", borderRadius: "50%", background: "var(--gold)", color: "var(--ink)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>▶</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--tx-d-dim)", letterSpacing: ".1em" }}>VIDEO DE DEMOSTRACIÓN · preparado para YouTube</span>
        </div>
      </div>
    </div>
  );
}

function CookieBanner() {
  const { cookieOpen, acceptCookies, rejectCookies, showToast } = useStore();
  if (!cookieOpen) return null;
  return (
    <div style={{ position: "fixed", right: "22px", bottom: "22px", zIndex: 80, width: "min(400px,calc(100vw - 44px))", background: "var(--ink-2)", border: "1px solid var(--line-dark)", borderRadius: "14px", padding: "22px", boxShadow: "0 20px 50px rgba(0,0,0,.6)" }}>
      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--tx-d-mut)", margin: "0 0 16px" }}>Usamos cookies necesarias para que el sitio funcione y, con tu permiso, cookies analíticas para entender qué contenidos se consultan y mejorar Archivo STEAM.</p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={rejectCookies} style={{ flex: 1, minWidth: "110px", background: "transparent", border: "1px solid var(--line-dark)", color: "var(--marfil)", fontWeight: 600, fontSize: "14px", padding: "11px", borderRadius: "9px" }}>Rechazar</button>
        <button onClick={acceptCookies} style={{ flex: 1, minWidth: "110px", background: "var(--gold)", border: "none", color: "var(--ink)", fontWeight: 700, fontSize: "14px", padding: "11px", borderRadius: "9px" }}>Aceptar</button>
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
        <button onClick={() => showToast("Preferencias de cookies guardadas (demo)")} style={{ background: "none", border: "none", color: "var(--tx-d-dim)", fontSize: "12.5px", padding: 0 }}>Configurar</button>
        <Link href="/proyecto" style={{ color: "var(--tx-d-dim)", fontSize: "12.5px" }}>Aviso de privacidad</Link>
      </div>
    </div>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", zIndex: 99, background: "var(--ink-4)", border: "1px solid var(--gold)", color: "var(--marfil)", fontSize: "14px", fontWeight: 600, padding: "12px 22px", borderRadius: "999px", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}>{toast}</div>
  );
}

export function Overlays() {
  return (
    <>
      <SearchOverlay />
      <MobileMenu />
      <TrailerModal />
      <CookieBanner />
      <Toast />
    </>
  );
}
