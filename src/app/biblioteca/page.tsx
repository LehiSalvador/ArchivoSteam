import { Suspense } from "react";
import type { Metadata } from "next";
import { LibraryExplorer } from "@/components/library/library-explorer";

export const metadata: Metadata = { title: "Biblioteca" };

export default function BibliotecaPage() {
  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh" }}>
      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <LibraryExplorer />
      </Suspense>
    </div>
  );
}
