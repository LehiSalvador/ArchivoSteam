"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { upsertPersonAction, softDeletePersonAction } from "@/lib/admin/actions";
import { btnPrimary, btnGhost, inputStyle, labelStyle } from "@/components/admin/ui";

/** Datos completos de la persona en edición (subconjunto editable de `people`). */
export interface PersonFormData {
  id: string;
  full_name: string;
  display_name: string | null;
  headline: string | null;
  short_bio: string | null;
  bio: string | null;
  photo_url: string | null;
  city_id: string | null;
  institution_id: string | null;
  primary_discipline_id: string | null;
  is_public: boolean;
}

/** Opción de catálogo para los selects (ciudad, disciplina, institución). */
export interface CatalogOption {
  id: string;
  name: string;
}

interface FormState {
  full_name: string;
  display_name: string;
  headline: string;
  photo_url: string;
  city_id: string;
  primary_discipline_id: string;
  institution_id: string;
  short_bio: string;
  bio: string;
  is_public: boolean;
}

const bannerBase: CSSProperties = {
  fontSize: "13.5px",
  lineHeight: 1.5,
  padding: "11px 14px",
  borderRadius: "9px",
};
const errorBanner: CSSProperties = {
  ...bannerBase,
  background: "rgba(200,60,60,.1)",
  border: "1px solid rgba(200,60,60,.4)",
  color: "#f0a6a6",
};
const successBanner: CSSProperties = {
  ...bannerBase,
  background: "rgba(201,154,68,.12)",
  border: "1px solid rgba(201,154,68,.45)",
  color: "var(--gold)",
};
const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "96px",
  lineHeight: 1.6,
  resize: "vertical",
};
const btnDanger: CSSProperties = {
  ...btnGhost,
  color: "#f0a6a6",
  borderColor: "rgba(200,60,60,.4)",
};

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function PersonForm({
  person,
  cities,
  disciplines,
  institutions,
}: {
  person?: PersonFormData;
  cities: CatalogOption[];
  disciplines: CatalogOption[];
  institutions: CatalogOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isEdit = Boolean(person?.id);

  const [form, setForm] = useState<FormState>(() => ({
    full_name: person?.full_name ?? "",
    display_name: person?.display_name ?? "",
    headline: person?.headline ?? "",
    photo_url: person?.photo_url ?? "",
    city_id: person?.city_id ?? "",
    primary_discipline_id: person?.primary_discipline_id ?? "",
    institution_id: person?.institution_id ?? "",
    short_bio: person?.short_bio ?? "",
    bio: person?.bio ?? "",
    is_public: person?.is_public ?? true,
  }));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const full = form.full_name.trim();
    if (!full) {
      setError("El nombre completo es obligatorio.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await upsertPersonAction({
        id: person?.id,
        full_name: full,
        display_name: form.display_name.trim() || undefined,
        headline: form.headline.trim() || undefined,
        photo_url: form.photo_url.trim() || undefined,
        short_bio: form.short_bio.trim() || undefined,
        bio: form.bio.trim() || undefined,
        city_id: form.city_id || null,
        institution_id: form.institution_id || null,
        primary_discipline_id: form.primary_discipline_id || null,
        is_public: form.is_public,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (isEdit) {
        setSaved(true);
        router.refresh();
      } else {
        router.push("/admin/personas");
      }
    });
  };

  const remove = () => {
    const target = person;
    if (!target) return;
    if (!window.confirm(`¿Eliminar a «${target.full_name}»? Se ocultará del sitio público.`)) return;
    setError(null);
    start(async () => {
      const res = await softDeletePersonAction(target.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/personas");
    });
  };

  const preview = form.photo_url.trim();

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "18px", maxWidth: "760px" }}>
      {error && (
        <div role="alert" style={errorBanner}>
          {error}
        </div>
      )}
      {saved && !error && (
        <div role="status" style={successBanner}>
          Cambios guardados.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <Field id="full_name" label="Nombre completo *">
          <input
            id="full_name"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder="Ej. María González Ruiz"
            required
            autoComplete="off"
            style={inputStyle}
          />
        </Field>

        <Field id="display_name" label="Nombre para mostrar">
          <input
            id="display_name"
            value={form.display_name}
            onChange={(e) => set("display_name", e.target.value)}
            placeholder="Se usa el nombre completo si se deja vacío"
            autoComplete="off"
            style={inputStyle}
          />
        </Field>

        <Field id="headline" label="Titular / cargo">
          <input
            id="headline"
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Ej. Bióloga marina · Investigadora"
            autoComplete="off"
            style={inputStyle}
          />
        </Field>

        <Field id="photo_url" label="URL de la foto">
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                width={44}
                height={44}
                style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flex: "none", border: "1px solid var(--line-dark)" }}
              />
            ) : (
              <span
                aria-hidden="true"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  flex: "none",
                  display: "grid",
                  placeItems: "center",
                  background: "var(--ink-3)",
                  border: "1px solid var(--line-dark)",
                  color: "var(--tx-d-dim)",
                  fontFamily: "var(--serif)",
                  fontSize: "18px",
                }}
              >
                {(form.full_name.trim()[0] ?? "?").toUpperCase()}
              </span>
            )}
            <input
              id="photo_url"
              value={form.photo_url}
              onChange={(e) => set("photo_url", e.target.value)}
              placeholder="https://…"
              type="url"
              autoComplete="off"
              style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            />
          </div>
        </Field>

        <Field id="city_id" label="Ciudad">
          <select id="city_id" value={form.city_id} onChange={(e) => set("city_id", e.target.value)} style={inputStyle}>
            <option value="">— Sin asignar —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="primary_discipline_id" label="Disciplina principal">
          <select
            id="primary_discipline_id"
            value={form.primary_discipline_id}
            onChange={(e) => set("primary_discipline_id", e.target.value)}
            style={inputStyle}
          >
            <option value="">— Sin asignar —</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="institution_id" label="Institución">
          <select
            id="institution_id"
            value={form.institution_id}
            onChange={(e) => set("institution_id", e.target.value)}
            style={inputStyle}
          >
            <option value="">— Sin asignar —</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="short_bio" label="Biografía breve">
        <textarea
          id="short_bio"
          value={form.short_bio}
          onChange={(e) => set("short_bio", e.target.value)}
          placeholder="Una o dos frases para tarjetas y vistas compactas."
          style={{ ...textareaStyle, minHeight: "72px" }}
        />
      </Field>

      <Field id="bio" label="Biografía completa">
        <textarea
          id="bio"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Trayectoria, contexto y aportaciones de la persona."
          style={textareaStyle}
        />
      </Field>

      <div>
        <label htmlFor="is_public" style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "var(--marfil)", fontSize: "14px", minHeight: "24px" }}>
          <input
            id="is_public"
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => set("is_public", e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--gold)" }}
          />
          Visible en el sitio público
        </label>
        <p style={{ fontSize: "12.5px", color: "var(--tx-d-dim)", margin: "6px 0 0" }}>
          Si se desactiva, la persona no aparece en el archivo público, pero se conserva en el panel.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" }}>
        <button type="submit" style={{ ...btnPrimary, opacity: pending ? 0.7 : 1 }} disabled={pending}>
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear persona"}
        </button>
        {isEdit && (
          <button type="button" style={btnDanger} disabled={pending} onClick={remove}>
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
