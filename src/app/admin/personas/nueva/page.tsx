import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { listCatalog } from "@/lib/admin/queries";
import { PageHeader, Card, btnGhost } from "@/components/admin/ui";
import { PersonForm, type CatalogOption } from "@/components/admin/person-form";

export const metadata: Metadata = { title: "Nueva persona" };
export const dynamic = "force-dynamic";

function toOptions(result: { rows: unknown[]; nameCol: string }): CatalogOption[] {
  return result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return { id: String(row.id), name: String(row[result.nameCol] ?? "") };
  });
}

export default async function NuevaPersonaPage() {
  await requireStaff();
  const [cities, disciplines, institutions] = await Promise.all([
    listCatalog("cities"),
    listCatalog("disciplines"),
    listCatalog("institutions"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Personas"
        title="Nueva persona"
        description="Registra a un entrevistado o protagonista del archivo."
        action={
          <Link href="/admin/personas" style={btnGhost}>
            ← Volver a personas
          </Link>
        }
      />
      <Card>
        <PersonForm
          cities={toOptions(cities)}
          disciplines={toOptions(disciplines)}
          institutions={toOptions(institutions)}
        />
      </Card>
    </>
  );
}
