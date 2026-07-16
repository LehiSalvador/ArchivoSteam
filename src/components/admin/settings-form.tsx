"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { updateSettingAction } from "@/lib/admin/actions";
import { Card, btnPrimary, inputStyle, labelStyle } from "@/components/admin/ui";

interface SettingField {
  key: string;
  label: string;
  hint: string;
  placeholder?: string;
  multiline?: boolean;
}

// Ajustes públicos del sitio. Jamás secretos: se guardan con is_public = true.
const FIELDS: SettingField[] = [
  {
    key: "site.name",
    label: "Nombre del sitio",
    hint: "Título principal del proyecto.",
    placeholder: "Archivo STEAM",
  },
  {
    key: "site.tagline",
    label: "Lema",
    hint: "Frase breve que acompaña al nombre.",
    placeholder: "Memoria viva de la ciencia y el arte.",
  },
  {
    key: "home.featured_note",
    label: "Nota destacada (inicio)",
    hint: "Mensaje breve que aparece en la portada.",
    multiline: true,
  },
  {
    key: "tours.active",
    label: "Recorrido activo (slug)",
    hint: "Slug del recorrido que se muestra como activo.",
    placeholder: "recorrido-2026",
  },
];

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "88px",
  resize: "vertical",
  lineHeight: 1.6,
  fontFamily: "var(--sans)",
};

// Vista mínima y estable del resultado de la acción (para estrechar `.error`).
type ActionResult = { ok: true } | { ok: false; error: string };
type Feedback = { key: string; kind: "ok" | "error"; text: string };

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const initValues = (): Record<string, string> => {
    const base: Record<string, string> = {};
    for (const f of FIELDS) base[f.key] = initial[f.key] ?? "";
    return base;
  };

  const [values, setValues] = useState<Record<string, string>>(initValues);
  const [saved, setSaved] = useState<Record<string, string>>(initValues);
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function onChange(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    if (feedback?.key === key) setFeedback(null);
  }

  function save(key: string) {
    const value = (values[key] ?? "").trim();
    setFeedback(null);
    setBusyKey(key);
    startTransition(async () => {
      const res: ActionResult = await updateSettingAction(key, value, true);
      setBusyKey(null);
      if (res.ok) {
        setValues((v) => ({ ...v, [key]: value }));
        setSaved((s) => ({ ...s, [key]: value }));
        setFeedback({ key, kind: "ok", text: "Guardado." });
      } else {
        setFeedback({ key, kind: "error", text: res.error });
      }
    });
  }

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {FIELDS.map((f) => {
        const id = `set-${f.key.replace(/\W+/g, "-")}`;
        const hintId = `${id}-hint`;
        const val = values[f.key] ?? "";
        const dirty = val !== (saved[f.key] ?? "");
        const isBusy = busyKey === f.key;
        const fb = feedback?.key === f.key ? feedback : null;
        const disabled = !dirty || pending;

        return (
          <Card key={f.key}>
            <label htmlFor={id} style={labelStyle}>
              {f.label}
            </label>
            {f.multiline ? (
              <textarea
                id={id}
                value={val}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                aria-describedby={hintId}
                style={textareaStyle}
              />
            ) : (
              <input
                id={id}
                type="text"
                value={val}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                aria-describedby={hintId}
                style={inputStyle}
              />
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >
              <span id={hintId} style={{ fontSize: "12px", color: "var(--tx-d-dim)" }}>
                {f.hint}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {fb && (
                  <span
                    role={fb.kind === "error" ? "alert" : "status"}
                    style={{
                      fontSize: "12.5px",
                      color: fb.kind === "error" ? "#f0a6a6" : "var(--gold)",
                    }}
                  >
                    {fb.text}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => save(f.key)}
                  disabled={disabled}
                  style={{
                    ...btnPrimary,
                    fontSize: "13.5px",
                    padding: "9px 16px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.55 : 1,
                  }}
                >
                  {isBusy ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
