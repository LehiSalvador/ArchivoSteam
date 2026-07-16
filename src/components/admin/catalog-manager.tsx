"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { upsertCatalogAction, deleteCatalogAction } from "@/lib/admin/actions";
import type { CatalogKind } from "@/lib/admin/queries";
import { Card, btnPrimary, btnGhost, inputStyle, labelStyle } from "@/components/admin/ui";

/** Fila genérica de catálogo. La columna del nombre es dinámica (`nameCol`). */
export type CatalogRow = { id: string } & Record<string, unknown>;

export interface CatalogTabData {
  kind: CatalogKind;
  label: string;
  rows: CatalogRow[];
  nameCol: string;
}

/** Solo estos catálogos persisten `description` en `upsertCatalogAction`. */
const KIND_HAS_DESCRIPTION: Record<CatalogKind, boolean> = {
  cities: false,
  institutions: false,
  disciplines: false,
  topics: true,
  collections: true,
  tours: true,
};

const errorBanner: CSSProperties = {
  background: "rgba(200,60,60,.1)",
  border: "1px solid rgba(200,60,60,.4)",
  color: "#f0a6a6",
  fontSize: "13.5px",
  lineHeight: 1.5,
  padding: "11px 14px",
  borderRadius: "9px",
  marginBottom: "16px",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "72px",
  lineHeight: 1.6,
  resize: "vertical",
};

const rowBtn: CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 600,
  color: "var(--tx-d-mut)",
  padding: "6px 11px",
  borderRadius: "7px",
  border: "1px solid var(--line-dark)",
  background: "transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
  minHeight: "30px",
};
const rowBtnDanger: CSSProperties = { ...rowBtn, color: "#f0a6a6", borderColor: "rgba(200,60,60,.4)" };

const nameOf = (row: CatalogRow, nameCol: string) => String(row[nameCol] ?? "");

export function CatalogManager({ kind, rows, nameCol }: { kind: CatalogKind; rows: CatalogRow[]; nameCol: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const hasDesc = KIND_HAS_DESCRIPTION[kind];

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setError(null);
  };

  const startEdit = (row: CatalogRow) => {
    setEditingId(row.id);
    setName(nameOf(row, nameCol));
    setDescription(hasDesc ? String(row.description ?? "") : "");
    setError(null);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setError("El nombre es obligatorio.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await upsertCatalogAction(kind, {
        id: editingId ?? undefined,
        name: clean,
        description: hasDesc ? description.trim() || undefined : undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      resetForm();
      router.refresh();
    });
  };

  const remove = (row: CatalogRow) => {
    if (!window.confirm(`¿Eliminar «${nameOf(row, nameCol)}»? Esta acción no se puede deshacer.`)) return;
    setError(null);
    start(async () => {
      const res = await deleteCatalogAction(kind, row.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (editingId === row.id) resetForm();
      router.refresh();
    });
  };

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <Card>
        <form onSubmit={submit} style={{ display: "grid", gap: "14px", maxWidth: "640px" }}>
          <span style={labelStyle}>{editingId ? "Editar elemento" : "Nuevo elemento"}</span>
          {error && (
            <div role="alert" style={{ ...errorBanner, marginBottom: 0 }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor={`cat-name-${kind}`} style={labelStyle}>
              Nombre *
            </label>
            <input
              id={`cat-name-${kind}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              required
              autoComplete="off"
              style={inputStyle}
            />
          </div>

          {hasDesc && (
            <div>
              <label htmlFor={`cat-desc-${kind}`} style={labelStyle}>
                Descripción
              </label>
              <textarea
                id={`cat-desc-${kind}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción opcional"
                style={textareaStyle}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="submit" style={{ ...btnPrimary, opacity: pending ? 0.7 : 1 }} disabled={pending}>
              {pending ? "Guardando…" : editingId ? "Guardar cambios" : "Añadir"}
            </button>
            {editingId && (
              <button type="button" style={btnGhost} disabled={pending} onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Card>

      {rows.length === 0 ? (
        <p style={{ color: "var(--tx-d-mut)", fontSize: "14px", margin: "2px 0 0" }}>
          Aún no hay elementos. Añade el primero con el formulario de arriba.
        </p>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {rows.map((row, i) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 18px",
                borderTop: i === 0 ? "none" : "1px solid var(--line-dark-2)",
                background: editingId === row.id ? "var(--gold-soft)" : "transparent",
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "14.5px", fontWeight: 600, color: "var(--marfil)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nameOf(row, nameCol) || "—"}
                </span>
                {hasDesc && String(row.description ?? "") && (
                  <span style={{ display: "block", fontSize: "12.5px", color: "var(--tx-d-mut)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {String(row.description)}
                  </span>
                )}
              </span>
              <div style={{ display: "flex", gap: "6px", flex: "none" }}>
                <button type="button" style={rowBtn} disabled={pending} onClick={() => startEdit(row)}>
                  Editar
                </button>
                <button type="button" style={rowBtnDanger} disabled={pending} onClick={() => remove(row)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export function CatalogTabs({ catalogs }: { catalogs: CatalogTabData[] }) {
  const [active, setActive] = useState(0);
  const current = catalogs[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Catálogos"
        style={{ display: "flex", flexWrap: "wrap", gap: "2px", borderBottom: "1px solid var(--line-dark-2)", marginBottom: "22px" }}
      >
        {catalogs.map((c, i) => (
          <button
            key={c.kind}
            type="button"
            role="tab"
            id={`cat-tab-${c.kind}`}
            aria-selected={i === active}
            aria-controls={`cat-panel-${c.kind}`}
            onClick={() => setActive(i)}
            data-on={i === active ? "1" : "0"}
            className="doc-tab"
            style={{ background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "var(--tx-d-mut)", fontWeight: 600, fontSize: "13.5px", padding: "10px 13px" }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {current && (
        <div role="tabpanel" id={`cat-panel-${current.kind}`} aria-labelledby={`cat-tab-${current.kind}`}>
          <CatalogManager key={current.kind} kind={current.kind} rows={current.rows} nameCol={current.nameCol} />
        </div>
      )}
    </div>
  );
}
