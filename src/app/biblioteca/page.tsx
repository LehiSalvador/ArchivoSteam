import { Suspense } from "react";
import type { Metadata } from "next";
import { LibraryExplorer } from "@/components/library/library-explorer";
import { getArchives, getCities, getCollections, getDisciplines } from "@/lib/repository";

export const metadata: Metadata = { title: "Biblioteca" };
export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  const [archives, cities, collections, disciplines] = await Promise.all([
    getArchives(),
    getCities(),
    getCollections(),
    getDisciplines(),
  ]);

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh" }}>
      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <LibraryExplorer
          archives={archives}
          cities={cities}
          collections={collections}
          disciplines={disciplines}
        />
      </Suspense>
    </div>
  );
}
