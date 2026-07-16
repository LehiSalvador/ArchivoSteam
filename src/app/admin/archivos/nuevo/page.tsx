import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { listPeople } from "@/lib/admin/queries";
import { PageHeader } from "@/components/admin/ui";
import { NewArchive } from "@/components/admin/new-archive";

export const metadata: Metadata = { title: "Nuevo archivo" };
export const dynamic = "force-dynamic";

export default async function NuevoArchivoPage() {
  await requireStaff();
  const people = await listPeople();
  return (
    <>
      <PageHeader
        eyebrow="Contenido"
        title="Nuevo archivo"
        description="Importa el video, elige la persona y crea el borrador. Después completarás documentación y publicación."
      />
      <NewArchive people={people.map((p) => ({ id: p.id, full_name: p.full_name }))} />
    </>
  );
}
