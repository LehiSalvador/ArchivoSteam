// Vista previa de staff de un archivo (cualquier estado), con el layout PÚBLICO
// para reflejar cómo se verá. Protegida: middleware exige sesión y la página
// exige rol staff. Los borradores NUNCA son públicos por esta ruta.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { getArchiveByIdPreview, getRelated } from "@/lib/repository";
import { ArchiveDetail } from "@/components/archive/archive-detail";

export const metadata: Metadata = { title: "Vista previa", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function VistaPreviaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const a = await getArchiveByIdPreview(id);
  if (!a) notFound();
  const related = await getRelated(a, 3);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "62px",
          left: 0,
          right: 0,
          zIndex: 60,
          background: "var(--gold)",
          color: "var(--ink)",
          fontSize: "13px",
          fontWeight: 700,
          padding: "8px 16px",
          display: "flex",
          gap: "14px",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        Vista previa · no público todavía
        <Link href={`/admin/archivos/${id}`} style={{ color: "var(--ink)", textDecoration: "underline" }}>
          ← Volver a editar
        </Link>
      </div>
      <ArchiveDetail archive={a} related={related} />
    </>
  );
}
