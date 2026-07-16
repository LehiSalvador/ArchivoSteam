"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/lib/auth-actions";

const NAV: { group: string; items: { href: string; label: string; min?: string }[] }[] = [
  {
    group: "Contenido",
    items: [
      { href: "/admin", label: "Resumen" },
      { href: "/admin/archivos", label: "Archivos" },
      { href: "/admin/personas", label: "Personas" },
    ],
  },
  {
    group: "Taxonomía",
    items: [
      { href: "/admin/catalogos", label: "Catálogos" },
      { href: "/admin/recorridos", label: "Recorridos" },
    ],
  },
  {
    group: "Sistema",
    items: [
      { href: "/admin/usuarios", label: "Usuarios", min: "OWNER" },
      { href: "/admin/configuracion", label: "Configuración", min: "ADMIN" },
      { href: "/admin/auditoria", label: "Auditoría" },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  EDITOR: "Editor",
  ADMIN: "Administrador",
  OWNER: "Propietario",
};

function canSee(min: string | undefined, level: string): boolean {
  if (!min) return true;
  const order = ["MEMBER", "EDITOR", "ADMIN", "OWNER"];
  return order.indexOf(level) >= order.indexOf(min);
}

export function AdminShell({
  level,
  email,
  children,
}: {
  level: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <nav aria-label="Navegación del panel" style={{ display: "grid", gap: "22px", alignContent: "start" }}>
      <Link href="/" style={{ display: "inline-flex", gap: "7px", alignItems: "baseline", fontWeight: 800, fontSize: "15px", letterSpacing: ".13em", color: "var(--marfil)" }}>
        ARCHIVO <span style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: ".24em" }}>STEAM</span>
      </Link>
      {NAV.map((section) => (
        <div key={section.group} style={{ display: "grid", gap: "3px" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--tx-d-dim)", padding: "0 10px 4px" }}>
            {section.group}
          </span>
          {section.items.filter((it) => canSee(it.min, level)).map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(it.href) ? "page" : undefined}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "14.5px",
                fontWeight: isActive(it.href) ? 700 : 500,
                color: isActive(it.href) ? "var(--ink)" : "var(--tx-d-mut)",
                background: isActive(it.href) ? "var(--gold)" : "transparent",
              }}
            >
              {it.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--marfil)" }}>
      {/* Topbar móvil */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--line-dark)", position: "sticky", top: 0, background: "var(--ink)", zIndex: 40 }} className="admin-topbar">
        <button onClick={() => setOpen((v) => !v)} aria-label="Menú" style={{ background: "none", border: "1px solid var(--line-dark)", color: "var(--marfil)", borderRadius: "8px", padding: "7px 12px", fontSize: "13px" }}>
          ☰ Panel
        </button>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold)" }}>{ROLE_LABEL[level] ?? level}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", alignItems: "start" }} className="admin-grid">
        <aside
          className={open ? "admin-aside open" : "admin-aside"}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            padding: "26px 16px",
            borderRight: "1px solid var(--line-dark)",
            background: "var(--ink-2)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {sidebar}
          <div style={{ display: "grid", gap: "8px", marginTop: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--tx-d-dim)", padding: "0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>
            <form action={signOutAction}>
              <button type="submit" style={{ width: "100%", background: "transparent", border: "1px solid var(--line-dark)", color: "var(--tx-d-mut)", borderRadius: "8px", padding: "9px", fontSize: "13px", cursor: "pointer" }}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <main style={{ padding: "clamp(20px, 4vw, 40px)", minWidth: 0 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .admin-grid { grid-template-columns: 1fr !important; }
          .admin-aside { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 50; width: 260px; transform: translateX(-100%); transition: transform .2s ease; height: 100vh !important; }
          .admin-aside.open { transform: translateX(0); }
        }
        @media (min-width: 861px) { .admin-topbar { display: none !important; } }
      `}</style>
    </div>
  );
}
