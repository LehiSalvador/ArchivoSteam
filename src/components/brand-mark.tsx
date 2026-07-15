// Marca de Archivo STEAM — símbolo (puerta/archivo/luz) y wordmark.
// Portado fiel del diseño aprobado.

import type { CSSProperties } from "react";

export function HeaderMark() {
  return (
    <svg viewBox="0 0 200 250" width="22" height="28" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <path d="M40,206 L54,206 L54,66 C54,38 74,24 100,24 C126,24 146,38 146,66 L146,206 L160,206" fill="none" stroke="#F5F5F2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="94,64 130,74 130,196 94,200" fill="none" stroke="rgba(245,245,242,.5)" strokeWidth="5" strokeLinejoin="round" />
      <line x1="94" y1="64" x2="94" y2="200" stroke="#E3B45E" strokeWidth="7" strokeLinecap="round" />
      <line x1="86" y1="72" x2="86" y2="196" stroke="#E3B45E" strokeWidth="4" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

export function Wordmark({ style }: { style?: CSSProperties }) {
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: "7px", ...style }}>
      <span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: "16px", letterSpacing: ".13em", color: "var(--marfil)" }}>ARCHIVO</span>
      <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "11px", letterSpacing: ".26em", color: "var(--gold)" }}>STEAM</span>
    </span>
  );
}

export function HeroSymbol() {
  return (
    <svg viewBox="0 0 200 250" width="150" height="188" role="img" aria-label="Símbolo de Archivo STEAM" style={{ maxWidth: "44vw", height: "auto", marginBottom: "14px" }}>
      <defs>
        <linearGradient id="hbeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3B45E" stopOpacity=".7" />
          <stop offset="1" stopColor="#E3B45E" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hfloor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#E3B45E" stopOpacity=".55" />
          <stop offset="1" stopColor="#E3B45E" stopOpacity="0" />
        </radialGradient>
        <filter id="hglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <ellipse className="as-light as-glow" cx="90" cy="234" rx="74" ry="15" fill="url(#hfloor)" />
      <polygon className="as-light" points="86,150 96,150 124,244 60,244" fill="url(#hbeam)" />
      <g className="as-light">
        <rect x="85" y="58" width="6" height="144" rx="3" fill="#F6D89A" filter="url(#hglow)" />
        <rect x="86.5" y="62" width="3" height="136" rx="1.5" fill="#fff" />
        <circle cx="88" cy="200" r="8" fill="#fff" filter="url(#hglow)" />
      </g>
      <g className="as-door">
        <polygon points="94,62 130,73 130,197 94,202" fill="rgba(245,245,242,.05)" stroke="rgba(245,245,242,.5)" strokeWidth="3" strokeLinejoin="round" />
        <line x1="107" y1="66" x2="107" y2="200" stroke="rgba(245,245,242,.32)" strokeWidth="2" />
        <line x1="119" y1="70" x2="119" y2="198" stroke="rgba(245,245,242,.22)" strokeWidth="2" />
        <line x1="94" y1="62" x2="94" y2="202" stroke="#E3B45E" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path className="as-frame-path" d="M40,206 L54,206 L54,66 C54,38 74,24 100,24 C126,24 146,38 146,66 L146,206 L160,206" fill="none" stroke="#F5F5F2" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength={1000} />
    </svg>
  );
}
