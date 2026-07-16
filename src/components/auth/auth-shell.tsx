import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "110px 5vw 6vw",
        background:
          "radial-gradient(1200px 500px at 50% -10%, rgba(201,154,68,.08), transparent 60%), var(--ink)",
      }}
    >
      <div style={{ width: "min(440px, 100%)" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--sans)",
            fontWeight: 800,
            fontSize: "14px",
            letterSpacing: ".14em",
            color: "var(--marfil)",
            marginBottom: "24px",
          }}
        >
          ARCHIVO{" "}
          <span style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: ".26em" }}>
            STEAM
          </span>
        </Link>

        <div
          style={{
            background: "var(--ink-2)",
            border: "1px solid var(--line-dark)",
            borderRadius: "16px",
            padding: "clamp(24px, 5vw, 34px)",
            boxShadow: "0 30px 70px rgba(0,0,0,.5)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--gold)",
            }}
          >
            {eyebrow}
          </span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(24px, 4vw, 30px)",
              color: "var(--marfil)",
              margin: "8px 0 6px",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: "14.5px",
                lineHeight: 1.6,
                color: "var(--tx-d-mut)",
                margin: "0 0 22px",
              }}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>

        {footer && (
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "14px",
              color: "var(--tx-d-dim)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
