import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { getArchiveEditor, listPeople, listCatalog } from "@/lib/admin/queries";
import { ArchiveEditor, type Opt } from "@/components/admin/archive-editor";

export const metadata: Metadata = { title: "Editar archivo" };
export const dynamic = "force-dynamic";

type Row = Record<string, unknown> & { id: string };

function toOpts(rows: Row[], nameCol: string): Opt[] {
  return rows.map((r) => ({ id: r.id, label: String(r[nameCol] ?? "—") }));
}

export default async function EditArchivePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const data = await getArchiveEditor(id);
  if (!data) notFound();

  const [people, cities, institutions, disciplines, topics, collections, tours] = await Promise.all([
    listPeople(),
    listCatalog("cities"),
    listCatalog("institutions"),
    listCatalog("disciplines"),
    listCatalog("topics"),
    listCatalog("collections"),
    listCatalog("tours"),
  ]);

  const a = data.archive as Record<string, unknown>;
  const initial = {
    title: (a.title as string) ?? "",
    subtitle: (a.subtitle as string) ?? null,
    short_description: (a.short_description as string) ?? null,
    card_description: (a.card_description as string) ?? null,
    highlight_phrase: (a.highlight_phrase as string) ?? null,
    summary: (a.summary as string) ?? null,
    research: (a.research as string) ?? null,
    applications: (a.applications as string) ?? null,
    transcript: (a.transcript as string) ?? null,
    person_id: (a.person_id as string) ?? null,
    city_id: (a.city_id as string) ?? null,
    institution_id: (a.institution_id as string) ?? null,
    primary_discipline_id: (a.primary_discipline_id as string) ?? null,
    youtube_video_id: (a.youtube_video_id as string) ?? null,
    youtube_url: (a.youtube_url as string) ?? null,
    youtube_channel: (a.youtube_channel as string) ?? null,
    youtube_thumbnail_url: (a.youtube_thumbnail_url as string) ?? null,
    duration_seconds: (a.duration_seconds as number) ?? null,
    is_featured: Boolean(a.is_featured),
    is_trending: Boolean(a.is_trending),
    visibility: (a.visibility as string) ?? "PUBLIC",
    status: (a.status as string) ?? "DRAFT",
    slug: (a.slug as string) ?? "",
    archive_number: (a.archive_number as number) ?? null,
    published_at: (a.published_at as string) ?? null,
  };

  return (
    <ArchiveEditor
      id={id}
      initial={initial}
      people={people.map((p) => ({ id: p.id, label: p.full_name }))}
      cities={toOpts(cities.rows as Row[], cities.nameCol)}
      institutions={toOpts(institutions.rows as Row[], institutions.nameCol)}
      disciplines={toOpts(disciplines.rows as Row[], disciplines.nameCol)}
      topics={toOpts(topics.rows as Row[], topics.nameCol)}
      collections={toOpts(collections.rows as Row[], collections.nameCol)}
      tours={toOpts(tours.rows as Row[], tours.nameCol)}
      topicIds={data.topicIds}
      collectionIds={data.collectionIds}
      tourIds={data.tourIds}
    />
  );
}
