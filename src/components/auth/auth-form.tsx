"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/auth-actions";

export interface AuthField {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--ink)",
  border: "1px solid var(--line-dark)",
  borderRadius: "9px",
  color: "var(--marfil)",
  fontSize: "15px",
  padding: "12px 14px",
  outline: "none",
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  hidden,
  hideFormOnSuccess = false,
}: {
  action: (prev: AuthState, fd: FormData) => Promise<AuthState>;
  fields: AuthField[];
  submitLabel: string;
  hidden?: Record<string, string>;
  hideFormOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const done = state.ok && hideFormOnSuccess;

  return (
    <form action={formAction} style={{ display: "grid", gap: "14px" }}>
      {hidden &&
        Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}

      {state.error && (
        <div
          role="alert"
          style={{
            background: "rgba(200,60,60,.1)",
            border: "1px solid rgba(200,60,60,.4)",
            color: "#f0a6a6",
            fontSize: "13.5px",
            lineHeight: 1.5,
            padding: "11px 14px",
            borderRadius: "9px",
          }}
        >
          {state.error}
        </div>
      )}
      {state.message && (
        <div
          role="status"
          style={{
            background: "rgba(201,154,68,.12)",
            border: "1px solid rgba(201,154,68,.45)",
            color: "var(--gold)",
            fontSize: "13.5px",
            lineHeight: 1.5,
            padding: "11px 14px",
            borderRadius: "9px",
          }}
        >
          {state.message}
        </div>
      )}

      {!done &&
        fields.map((f) => (
          <label key={f.name} style={{ display: "grid", gap: "6px" }}>
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "var(--tx-d-mut)",
                letterSpacing: ".02em",
              }}
            >
              {f.label}
            </span>
            <input
              name={f.name}
              type={f.type ?? "text"}
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              required={f.required ?? true}
              data-lpignore="true"
              style={inputStyle}
            />
          </label>
        ))}

      {!done && (
        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: "4px",
            background: "var(--gold)",
            border: "none",
            color: "var(--ink)",
            fontWeight: 700,
            fontSize: "15px",
            padding: "13px",
            borderRadius: "9px",
            cursor: pending ? "wait" : "pointer",
            opacity: pending ? 0.75 : 1,
          }}
        >
          {pending ? "Un momento…" : submitLabel}
        </button>
      )}
    </form>
  );
}
