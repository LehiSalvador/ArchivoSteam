"use client";

// Símbolo animado de Archivo STEAM (video autorizado).
// El video es la puerta/archivo/luz sobre fondo NEGRO puro (#000). Se usa
// `mix-blend-mode: screen` para que el negro desaparezca y el símbolo luminoso
// se componga sobre el fondo oscuro del header/hero sin caja ni borde visible.
// Decorativo (aria-hidden); el nombre accesible lo da el wordmark de texto.
// Respeta prefers-reduced-motion: en ese caso queda pausado mostrando el poster.

import { useEffect, useRef } from "react";

const SRC = "/media/brand/archivo-steam-symbol.mp4";
const POSTER = "/media/brand/archivo-steam-symbol-poster.webp";

export function AnimatedBrandSymbol({ variant }: { variant: "header" | "hero" }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.pause();
      return;
    }
    el.play().catch(() => {
      /* autoplay bloqueado: se queda en el poster, sin error */
    });
  }, []);

  const box =
    variant === "hero"
      ? { width: "clamp(150px,36vw,250px)", height: "clamp(150px,36vw,250px)", marginBottom: "14px" }
      : { width: "34px", height: "34px" };

  return (
    // El fondo del wrapper = superficie oscura del sitio (#0D0D0D). Con
    // mix-blend-mode:screen, el negro del video se compone contra ese fondo y
    // queda EXACTAMENTE igual al header/hero (sin caja ni borde visible), incluso
    // dentro de un contexto de apilamiento (el hero tiene transform por su animación).
    <span aria-hidden="true" style={{ display: "inline-block", lineHeight: 0, flex: "none", background: "var(--ink)", ...box }}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={POSTER}
        tabIndex={-1}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      >
        <source src={SRC} type="video/mp4" />
      </video>
    </span>
  );
}
