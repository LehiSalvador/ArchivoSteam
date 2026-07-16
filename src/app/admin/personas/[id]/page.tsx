import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { listCatalog } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, btnGhost } from "@/components/admin/ui";
import { PersonForm, type CatalogOption, type PersonFormData } from "@/components/admin/person-form";

export const metadata: Metadata = { title: "Editar persona" };
export const dynamic = "force-dynamic";

function toOptions(result: { rows: unknown[]; nameCol: string }): CatalogOption[] {
  return result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return { id: String(row.id), name: String(row[result.nameCol] ?? "") };
  });
}

export default async function EditarPersonaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  // `listPeople` solo devuelve un subconjunto de columnas y `upsertPersonAction`
  // reescribe la fila completa; por eso se lee la persona entera aquí para no
  // vaciar biografía, institución ni disciplina al guardar. Lectura autenticada
  // (mismo cliente/RLS que `@/lib/admin/queries`). Ver reporte: falta un lector
  // `getPerson(id)` en el contrato compartido.
  const supabase = await createClient();
  const { data: person } = await supabase
    .from("people")
    .select(
      "id, full_name, display_name, headline, short_bio, bio, photo_url, city_id, institution_id, primary_discipline_id, is_public",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!person) notFound();

  const [cities, disciplines, institutions] = await Promise.all([
    listCatalog("cities"),
    listCatalog("disciplines"),
    listCatalog("institutions"),
  ]);

  const data: PersonFormData = person;

  return (
    <>
      <PageHeader
        eyebrow="Personas"
        title={person.full_name}
        description="Edita los datos de la persona o elimínala del archivo."
        action={
          <Link href="/admin/personas" style={btnGhost}>
            ← Volver a personas
          </Link>
        }
      />
      <Card>
        <PersonForm
          person={data}
          cities={toOptions(cities)}
          disciplines={toOptions(disciplines)}
          institutions={toOptions(institutions)}
        />
      </Card>
    </>
  );
}
