import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArchiveDetail } from "@/components/archive/archive-detail";
import { getArchiveBySlug, getArchives, getRelated } from "@/lib/repository";

export function generateStaticParams() {
  return getArchives().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArchiveBySlug(slug);
  return { title: a ? `${a.numStr} · ${a.name}` : "Archivo", description: a?.summary };
}

export default async function ArchivoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArchiveBySlug(slug);
  if (!a) notFound();
  return <ArchiveDetail archive={a} related={getRelated(a, 3)} />;
}
