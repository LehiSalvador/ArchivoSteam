import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { listPeople } from "@/lib/admin/queries";
import { PageHeader, Card, EmptyState, btnPrimary, btnGhost, inputStyle } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Personas" };
export const dynamic = "force-dynamic";

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const raw = sp.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined;
  const people = await listPeople(q);

  return (
    <>
      <PageHeader
        eyebrow="Contenido"
        title="Personas"
        description="Entrevistados y protagonistas del archivo."
        action={
          <Link href="/admin/personas/nueva" style={btnPrimary}>
            + Nueva persona
          </Link>
        }
      />

      <form method="get" role="search" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", maxWidth: "520px" }}>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre…"
          aria-label="Buscar personas por nombre"
          type="search"
          autoComplete="off"
          style={{ ...inputStyle, flex: 1, minWidth: "200px" }}
        />
        <button type="submit" style={btnGhost}>
          Buscar
        </button>
        {q && (
          <Link href="/admin/personas" style={btnGhost}>
            Limpiar
          </Link>
        )}
      </form>

      {people.length === 0 ? (
        <EmptyState
          title={q ? `Sin coincidencias para «${q}»` : "Aún no hay personas"}
          hint={q ? "Prueba con otro nombre o limpia la búsqueda." : "Crea la primera persona del archivo."}
          action={
            <Link href="/admin/personas/nueva" style={btnPrimary}>
              + Nueva persona
            </Link>
          }
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {people.map((p, i) => (
            <Link
              key={p.id}
              href={`/admin/personas/${p.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 18px",
                borderTop: i === 0 ? "none" : "1px solid var(--line-dark-2)",
                color: "var(--marfil)",
                minHeight: "44px",
              }}
            >
              {p.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photo_url}
                  alt=""
                  width={40}
                  height={40}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", flex: "none", border: "1px solid var(--line-dark)" }}
                />
              ) : (
                <span
                  aria-hidden="true"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    flex: "none",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--ink-3)",
                    border: "1px solid var(--line-dark)",
                    color: "var(--tx-d-dim)",
                    fontFamily: "var(--serif)",
                    fontSize: "16px",
                  }}
                >
                  {(p.full_name.trim()[0] ?? "?").toUpperCase()}
                </span>
              )}

              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "14.5px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.full_name}
                </span>
                {p.headline && (
                  <span style={{ display: "block", fontSize: "12.5px", color: "var(--tx-d-mut)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.headline}
                  </span>
                )}
              </span>

              <span
                style={{
                  flex: "none",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontFamily: "var(--mono)",
                  fontSize: "10.5px",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  background: p.is_public ? "var(--gold-soft)" : "rgba(245,245,242,.06)",
                  color: p.is_public ? "var(--gold)" : "var(--tx-d-mut)",
                }}
              >
                {p.is_public ? "Público" : "Oculto"}
              </span>

              <span aria-hidden="true" style={{ flex: "none", fontSize: "12.5px", color: "var(--tx-d-dim)", fontWeight: 600 }}>
                Editar →
              </span>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
