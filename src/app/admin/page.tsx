import Link from "next/link";
import type { Metadata } from "next";
import { getDashboardStats, listArchives } from "@/lib/admin/queries";
import { PageHeader, StatCard, Card, StatusBadge, EmptyState, btnPrimary } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Resumen" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getDashboardStats(), listArchives()]);
  const recentTop = recent.slice(0, 8);

  return (
    <>
      <PageHeader
        eyebrow="Panel"
        title="Resumen"
        description="Estado editorial de Archivo STEAM."
        action={
          <Link href="/admin/archivos/nuevo" style={btnPrimary}>
            + Nuevo archivo
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "26px" }}>
        <StatCard label="Publicados" value={stats.published} href="/admin/archivos?status=PUBLISHED" />
        <StatCard label="Borradores" value={stats.drafts} href="/admin/archivos?status=DRAFT" />
        <StatCard label="Listos" value={stats.ready} href="/admin/archivos?status=READY" />
        <StatCard label="Programados" value={stats.scheduled} href="/admin/archivos?status=SCHEDULED" />
        <StatCard label="Correcciones" value={stats.correction} href="/admin/archivos?status=CORRECTION" />
        <StatCard label="Personas" value={stats.people} href="/admin/personas" />
        <StatCard label="Documentos" value={stats.documents} />
        <StatCard label="Archivados" value={stats.archived} href="/admin/archivos?status=ARCHIVED" />
      </div>

      <h2 style={{ fontFamily: "var(--serif)", fontSize: "19px", color: "var(--marfil)", margin: "0 0 14px" }}>
        Actividad reciente
      </h2>
      {recentTop.length === 0 ? (
        <EmptyState
          title="Aún no hay archivos"
          hint="Crea el primer archivo importando un video de YouTube."
          action={
            <Link href="/admin/archivos/nuevo" style={btnPrimary}>
              + Nuevo archivo
            </Link>
          }
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {recentTop.map((a, i) => (
            <Link
              key={a.id}
              href={`/admin/archivos/${a.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 20px",
                borderTop: i === 0 ? "none" : "1px solid var(--line-dark-2)",
                color: "var(--marfil)",
              }}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--gold)", minWidth: "42px" }}>
                {a.archive_number ? String(a.archive_number).padStart(3, "0") : "—"}
              </span>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14.5px" }}>
                {a.title}
                {a.person_name && <span style={{ color: "var(--tx-d-dim)" }}> · {a.person_name}</span>}
              </span>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
