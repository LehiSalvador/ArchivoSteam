import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { listCatalog, type CatalogKind } from "@/lib/admin/queries";
import { PageHeader } from "@/components/admin/ui";
import { CatalogTabs, type CatalogTabData } from "@/components/admin/catalog-manager";

export const metadata: Metadata = { title: "Catálogos" };
export const dynamic = "force-dynamic";

const TABS: { kind: CatalogKind; label: string }[] = [
  { kind: "cities", label: "Ciudades" },
  { kind: "institutions", label: "Instituciones" },
  { kind: "disciplines", label: "Disciplinas" },
  { kind: "topics", label: "Temas" },
  { kind: "collections", label: "Colecciones" },
];

export default async function CatalogosPage() {
  await requireStaff();

  const catalogs: CatalogTabData[] = await Promise.all(
    TABS.map(async (t) => {
      const { rows, nameCol } = await listCatalog(t.kind);
      return { kind: t.kind, label: t.label, rows, nameCol };
    }),
  );

  return (
    <>
      <PageHeader
        eyebrow="Taxonomía"
        title="Catálogos"
        description="Ciudades, instituciones, disciplinas, temas y colecciones que clasifican el archivo."
      />
      <CatalogTabs catalogs={catalogs} />
    </>
  );
}
