import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { listCatalog } from "@/lib/admin/queries";
import { PageHeader } from "@/components/admin/ui";
import { CatalogManager } from "@/components/admin/catalog-manager";

export const metadata: Metadata = { title: "Recorridos" };
export const dynamic = "force-dynamic";

export default async function RecorridosPage() {
  await requireStaff();
  const { rows, nameCol } = await listCatalog("tours");

  return (
    <>
      <PageHeader
        eyebrow="Taxonomía"
        title="Recorridos"
        description="Rutas temáticas que agrupan archivos para el público."
      />
      <CatalogManager kind="tours" rows={rows} nameCol={nameCol} />
    </>
  );
}
