import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { listUsers } from "@/lib/admin/queries";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { UserRolesManager } from "@/components/admin/user-roles-manager";

export const metadata: Metadata = { title: "Usuarios" };
export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  // Solo el propietario gestiona roles (redirige si no lo es).
  const { user } = await requireOwner();
  const users = await listUsers();

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Usuarios y roles"
        description="Gestiona los permisos del equipo. Solo el propietario puede asignar o revocar roles."
      />

      <Card style={{ marginBottom: "20px", padding: "14px 18px" }}>
        <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "var(--tx-d-mut)" }}>
          Puedes asignar y revocar los roles{" "}
          <strong style={{ color: "var(--marfil)" }}>Editor</strong> y{" "}
          <strong style={{ color: "var(--marfil)" }}>Administrador</strong>. El rol{" "}
          <strong style={{ color: "var(--gold)" }}>Propietario</strong> está protegido y no se
          modifica desde el panel.
        </p>
      </Card>

      {users.length === 0 ? (
        <EmptyState title="No hay usuarios" hint="Aún no se ha registrado ninguna cuenta." />
      ) : (
        <UserRolesManager users={users} currentUserId={user.id} />
      )}
    </>
  );
}
