import type { Metadata } from "next";
import { requireStaff, getUser, ensureOwnerBootstrap } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: { default: "Panel", template: "%s · Panel · Archivo STEAM" } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // El propietario inicial se promueve aquí si corresponde, antes del gate.
  await ensureOwnerBootstrap();
  const { level } = await requireStaff();
  const user = await getUser();
  return (
    <AdminShell level={level} email={user?.email ?? ""}>
      {children}
    </AdminShell>
  );
}
