import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "26px",
      }}
    >
      <div>
        {eyebrow && (
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)" }}>
            {eyebrow}
          </span>
        )}
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(24px,3.4vw,32px)", color: "var(--marfil)", margin: "6px 0 4px" }}>
          {title}
        </h1>
        {description && <p style={{ color: "var(--tx-d-mut)", fontSize: "14.5px", margin: 0, maxWidth: "60ch" }}>{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--ink-2)",
        border: "1px solid var(--line-dark)",
        borderRadius: "13px",
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: "30px", fontWeight: 600, color: "var(--marfil)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "12.5px", color: "var(--tx-d-mut)", marginTop: "8px" }}>{label}</div>
    </Card>
  );
  return href ? <Link href={href} style={{ display: "block" }}>{inner}</Link> : inner;
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  DRAFT: { bg: "rgba(255,255,255,.06)", fg: "var(--tx-d-mut)", label: "Borrador" },
  RESEARCH: { bg: "rgba(120,140,220,.14)", fg: "#a9b6e6", label: "Investigación" },
  VERIFICATION: { bg: "rgba(120,140,220,.14)", fg: "#a9b6e6", label: "Verificación" },
  LEGAL_REVIEW: { bg: "rgba(210,150,90,.14)", fg: "#e0b483", label: "Revisión legal" },
  READY: { bg: "rgba(90,180,130,.14)", fg: "#87d0a2", label: "Listo" },
  SCHEDULED: { bg: "rgba(90,150,210,.16)", fg: "#8fc0ef", label: "Programado" },
  PUBLISHED: { bg: "rgba(201,154,68,.18)", fg: "var(--gold)", label: "Publicado" },
  CORRECTION: { bg: "rgba(210,120,90,.16)", fg: "#e6a086", label: "Corrección" },
  ARCHIVED: { bg: "rgba(255,255,255,.05)", fg: "var(--tx-d-dim)", label: "Archivado" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "rgba(255,255,255,.06)", fg: "var(--tx-d-mut)", label: status };
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.fg, fontFamily: "var(--mono)", fontSize: "10.5px", letterSpacing: ".08em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <Card style={{ textAlign: "center", padding: "48px 24px" }}>
      <p style={{ color: "var(--marfil)", fontSize: "16px", fontWeight: 600, margin: "0 0 6px" }}>{title}</p>
      {hint && <p style={{ color: "var(--tx-d-mut)", fontSize: "14px", margin: "0 0 16px" }}>{hint}</p>}
      {action}
    </Card>
  );
}

export const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  background: "var(--gold)",
  color: "var(--ink)",
  fontWeight: 700,
  fontSize: "14px",
  padding: "10px 18px",
  borderRadius: "9px",
  border: "none",
  cursor: "pointer",
};

export const btnGhost: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  background: "transparent",
  color: "var(--marfil)",
  fontWeight: 600,
  fontSize: "13.5px",
  padding: "9px 14px",
  borderRadius: "9px",
  border: "1px solid var(--line-dark)",
  cursor: "pointer",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  background: "var(--ink)",
  border: "1px solid var(--line-dark)",
  borderRadius: "9px",
  color: "var(--marfil)",
  fontSize: "14.5px",
  padding: "11px 13px",
  outline: "none",
};

export const labelStyle: CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 600,
  color: "var(--tx-d-mut)",
  marginBottom: "6px",
  display: "block",
};
