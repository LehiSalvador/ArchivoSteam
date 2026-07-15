"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/components/providers/store";
import { HeaderMark, Wordmark } from "@/components/brand-mark";

const NAV = [
  { key: "home", href: "/", label: "Inicio" },
  { key: "biblioteca", href: "/biblioteca", label: "Biblioteca" },
  { key: "recorridos", href: "/recorridos", label: "Recorridos" },
  { key: "proyecto", href: "/proyecto", label: "Proyecto" },
  { key: "participar", href: "/participar", label: "Participar" },
];

function activeKey(path: string): string {
  if (path === "/") return "home";
  if (path.startsWith("/biblioteca") || path.startsWith("/archivo")) return "biblioteca";
  if (path.startsWith("/recorridos")) return "recorridos";
  if (path.startsWith("/proyecto")) return "proyecto";
  if (path.startsWith("/participar")) return "participar";
  return "";
}

export function SiteHeader() {
  const pathname = usePathname();
  const { openSearch, openMenu } = useStore();
  const ref = useRef<HTMLElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const solid = !isHome || (window.scrollY || 0) > window.innerHeight * 0.7;
      el.setAttribute("data-solid", solid ? "1" : "0");
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [isHome, pathname]);

  const act = activeKey(pathname);

  return (
    <header id="site-header" data-solid={isHome ? "0" : "1"} ref={ref}>
      <Link className="sh-brand" href="/" aria-label="Archivo STEAM — inicio" style={{ display: "flex", alignItems: "center", gap: "11px", flex: "none" }}>
        <HeaderMark />
        <Wordmark />
      </Link>
      <nav className="sh-nav" aria-label="Navegación principal">
        {NAV.map((n) => (
          <Link key={n.key} className="sh-link" data-active={act === n.key ? "1" : "0"} href={n.href}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "none" }}>
        <button className="sh-icon" aria-label="Buscar en el archivo" onClick={openSearch}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </button>
        <Link className="sh-icon" href="/cuenta" aria-label="Mi cuenta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </Link>
        <button className="sh-icon sh-burger" aria-label="Abrir menú" onClick={openMenu}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
