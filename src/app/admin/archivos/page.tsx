import Link from "next/link";
import type { Metadata } from "next";
import { listArchives } from "@/lib/admin/queries";
import { PageHeader, Card, StatusBadge, EmptyState, btnPrimary } from "@/components/admin/ui";
import { ArchiveActions } from "@/components/admin/archive-actions";

export const metadata: Metadata = { title: "Archivos" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "Todos" },
  { key: "DRAFT", label: "Borradores" },
  { key: "READY", label: "Listos" },
  { key: "SCHEDULED", label: "Programados" },
  { key: "PUBLISHED", label: "Publicados" },
  { key: "CORRECTION", label: "Correcciones" },
  { key: "ARCHIVED", label: "Archivados" },
];

export default async function ArchivosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const includeDeleted = status === "ARCHIVED";
  const rows = await listArchives({ status: status || undefined, q: q || undefined, includeDeleted });

  return (
    <>
      <PageHeader
        eyebrow="Contenido"
        title="Archivos"
        description="Crea, edita, publica y administra los archivos."
        action={
          <Link href="/admin/archivos/nuevo" style={btnPrimary}>
            + Nuevo archivo
          </Link>
        }
      />

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
        {FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={f.key ? `/admin/archivos?status=${f.key}` : "/admin/archivos"}
              style={{
                padding: "7px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: active ? 700 : 500,
                border: "1px solid var(--line-dark)",
                background: active ? "var(--gold)" : "transparent",
                color: active ? "var(--ink)" : "var(--tx-d-mut)",
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <form action="/admin/archivos" style={{ marginBottom: "16px" }}>
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por título…"
          aria-label="Buscar archivos"
          style={{
            width: "min(360px,100%)",
            background: "var(--ink-2)",
            border: "1px solid var(--line-dark)",
            borderRadius: "9px",
            color: "var(--marfil)",
            fontSize: "14px",
            padding: "10px 13px",
          }}
        />
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={q || status ? "Sin resultados" : "Aún no hay archivos"}
          hint={q || status ? "Ajusta el filtro o la búsqueda." : "Crea el primero importando un video de YouTube."}
          action={
            <Link href="/admin/archivos/nuevo" style={btnPrimary}>
              + Nuevo archivo
            </Link>
          }
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--tx-d-dim)", fontSize: "11px", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--mono)" }}>Nº</th>
                  <th style={{ padding: "12px 8px", fontFamily: "var(--mono)" }}>Título</th>
                  <th style={{ padding: "12px 8px", fontFamily: "var(--mono)" }}>Persona</th>
                  <th style={{ padding: "12px 8px", fontFamily: "var(--mono)" }}>Estado</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--mono)", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} style={{ borderTop: "1px solid var(--line-dark-2)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--gold)" }}>
                      {a.archive_number ? String(a.archive_number).padStart(3, "0") : "—"}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "14px" }}>
                      <Link href={`/admin/archivos/${a.id}`} style={{ color: "var(--marfil)", fontWeight: 600 }}>
                        {a.title}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "13.5px", color: "var(--tx-d-mut)" }}>
                      {a.person_name ?? "—"}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <ArchiveActions id={a.id} status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
