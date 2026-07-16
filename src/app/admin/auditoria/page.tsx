import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { listAudit } from "@/lib/admin/queries";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Auditoría" };
export const dynamic = "force-dynamic";

// Etiquetas y tintes por acción (reutiliza la paleta existente del panel).
const ACTION_STYLE: Record<string, { label: string; fg: string; bg: string }> = {
  CREATE: { label: "Creación", fg: "#87d0a2", bg: "rgba(90,180,130,.14)" },
  UPDATE: { label: "Edición", fg: "var(--tx-d-mut)", bg: "rgba(255,255,255,.06)" },
  PUBLISH: { label: "Publicación", fg: "var(--gold)", bg: "rgba(201,154,68,.18)" },
  UNPUBLISH: { label: "Despublicación", fg: "#e6a086", bg: "rgba(210,120,90,.16)" },
  ARCHIVE: { label: "Archivado", fg: "var(--tx-d-dim)", bg: "rgba(255,255,255,.05)" },
  RESTORE: { label: "Restauración", fg: "#8fc0ef", bg: "rgba(90,150,210,.16)" },
  SOFT_DELETE: { label: "Eliminación", fg: "#e6a086", bg: "rgba(210,120,90,.16)" },
  ROLE_CHANGE: { label: "Cambio de rol", fg: "#a9b6e6", bg: "rgba(120,140,220,.14)" },
  SETTINGS_CHANGE: { label: "Configuración", fg: "#a9b6e6", bg: "rgba(120,140,220,.14)" },
};

function actionMeta(action: string) {
  return ACTION_STYLE[action] ?? { label: action, fg: "var(--tx-d-mut)", bg: "rgba(255,255,255,.06)" };
}

const DATE_FMT = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_FMT.format(d);
}

export default async function AuditoriaPage() {
  // Acceso para staff (EDITOR o superior); redirige si no lo es.
  await requireStaff();
  const rows = await listAudit(100);

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Registro de auditoría"
        description="Últimas 100 acciones registradas en el panel."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Sin actividad registrada"
          hint="Las acciones del equipo aparecerán aquí."
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div className="audit-head">
            <span>Fecha</span>
            <span>Acción</span>
            <span>Entidad</span>
            <span>Motivo</span>
          </div>
          {rows.map((r) => {
            const m = actionMeta(r.action);
            return (
              <div key={r.id} className="audit-row">
                <span
                  data-label="Fecha"
                  style={{ fontSize: "13px", color: "var(--tx-d-mut)", fontFamily: "var(--mono)" }}
                >
                  {fmtDateTime(r.created_at)}
                </span>
                <span data-label="Acción">
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: m.bg,
                      color: m.fg,
                      fontFamily: "var(--mono)",
                      fontSize: "10.5px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.label}
                  </span>
                </span>
                <span data-label="Entidad" style={{ fontSize: "13px", color: "var(--marfil)" }}>
                  {r.entity_type}
                  {r.entity_id && (
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        color: "var(--tx-d-dim)",
                        marginTop: "2px",
                      }}
                    >
                      {r.entity_id.slice(0, 8)}…
                    </span>
                  )}
                </span>
                <span
                  data-label="Motivo"
                  style={{
                    fontSize: "13px",
                    color: r.reason ? "var(--tx-d-mut)" : "var(--tx-d-dim)",
                    lineHeight: 1.5,
                  }}
                >
                  {r.reason ?? "—"}
                </span>
              </div>
            );
          })}
        </Card>
      )}

      <style>{`
        .audit-head, .audit-row {
          display: grid;
          grid-template-columns: 190px 150px 1.1fr 1.4fr;
          gap: 14px;
          align-items: start;
          padding: 13px 20px;
        }
        .audit-head {
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--tx-d-dim);
          border-bottom: 1px solid var(--line-dark);
        }
        .audit-row + .audit-row { border-top: 1px solid var(--line-dark-2); }
        @media (max-width: 760px) {
          .audit-head { display: none; }
          .audit-row {
            grid-template-columns: 1fr;
            gap: 4px;
            padding: 14px 18px;
          }
          .audit-row span[data-label]::before {
            content: attr(data-label);
            display: block;
            font-family: var(--mono);
            font-size: 9.5px;
            letter-spacing: .12em;
            text-transform: uppercase;
            color: var(--tx-d-dim);
            margin-bottom: 3px;
          }
        }
      `}</style>
    </>
  );
}
