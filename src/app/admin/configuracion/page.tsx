import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Configuración" };
export const dynamic = "force-dynamic";

function asText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

export default async function ConfiguracionPage() {
  // Administradores y propietario (redirige si el rol es insuficiente).
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key,value,is_public");

  const map = new Map<string, unknown>();
  for (const row of data ?? []) map.set(row.key, row.value);

  const initial: Record<string, string> = {
    "site.name": asText(map.get("site.name")),
    "site.tagline": asText(map.get("site.tagline")),
    "home.featured_note": asText(map.get("home.featured_note")),
    "tours.active": asText(map.get("tours.active")),
  };

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Configuración del sitio"
        description="Ajustes públicos que se muestran en el sitio. Cada campo se guarda por separado."
      />

      <Card style={{ marginBottom: "20px", padding: "14px 18px" }}>
        <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "var(--tx-d-mut)" }}>
          Estos valores son <strong style={{ color: "var(--marfil)" }}>públicos</strong>. No guardes
          aquí contraseñas, claves de API ni datos sensibles.
        </p>
      </Card>

      <SettingsForm initial={initial} />
    </>
  );
}
