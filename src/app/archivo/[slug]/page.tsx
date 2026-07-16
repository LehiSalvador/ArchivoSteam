import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArchiveDetail } from "@/components/archive/archive-detail";
import { getArchiveBySlug, getRelated } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArchiveBySlug(slug);
  return { title: a ? `${a.numStr} · ${a.name}` : "Archivo", description: a?.summary };
}

export default async function ArchivoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArchiveBySlug(slug);
  if (!a) notFound();
  const related = await getRelated(a, 3);
  return <ArchiveDetail archive={a} related={related} />;
}
