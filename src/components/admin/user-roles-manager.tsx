"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { assignRoleAction, revokeRoleAction } from "@/lib/admin/actions";
import { Card, btnGhost } from "@/components/admin/ui";

export interface UserRow {
  id: string;
  display_name: string | null;
  created_at: string;
  roles: string[];
}

// Roles que el propietario puede otorgar/retirar desde el panel.
// OWNER está protegido (no se asigna ni revoca) y MEMBER es el rol base.
const ASSIGNABLE = ["EDITOR", "ADMIN"] as const;
type AssignableRole = (typeof ASSIGNABLE)[number];

const ROLE_LABEL: Record<string, string> = {
  MEMBER: "Miembro",
  EDITOR: "Editor",
  ADMIN: "Administrador",
  OWNER: "Propietario",
};

// Vista mínima y estable del resultado de las acciones (garantiza el
// estrechamiento del discriminante en `.error`).
type ActionResult = { ok: true } | { ok: false; error: string };
type Feedback = { userId: string; kind: "ok" | "error"; text: string };

const btnDanger: CSSProperties = {
  ...btnGhost,
  color: "#e6a086",
  borderColor: "rgba(210,120,90,.4)",
};

function chipStyle(role: string): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: "999px",
    fontFamily: "var(--mono)",
    fontSize: "10.5px",
    letterSpacing: ".08em",
    textTransform: "uppercase",
  };
  if (role === "OWNER") return { ...base, background: "rgba(201,154,68,.18)", color: "var(--gold)" };
  if (role === "ADMIN") return { ...base, background: "rgba(255,255,255,.10)", color: "var(--marfil)" };
  if (role === "EDITOR") return { ...base, background: "rgba(255,255,255,.06)", color: "var(--tx-d-mut)" };
  return { ...base, background: "rgba(255,255,255,.04)", color: "var(--tx-d-dim)" };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
}

export function UserRolesManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function run(key: string, userId: string, fn: () => Promise<ActionResult>, okText: string) {
    setFeedback(null);
    setBusy(key);
    startTransition(async () => {
      const res = await fn();
      setBusy(null);
      setFeedback(
        res.ok
          ? { userId, kind: "ok", text: okText }
          : { userId, kind: "error", text: res.error },
      );
    });
  }

  function assign(user: UserRow, role: AssignableRole) {
    run(
      `${user.id}:assign:${role}`,
      user.id,
      () => assignRoleAction(user.id, role),
      `Rol ${ROLE_LABEL[role]} asignado.`,
    );
  }

  function revoke(user: UserRow, role: AssignableRole) {
    const name = user.display_name?.trim() || "este usuario";
    if (!window.confirm(`¿Revocar el rol ${ROLE_LABEL[role]} de ${name}?`)) return;
    run(
      `${user.id}:revoke:${role}`,
      user.id,
      () => revokeRoleAction(user.id, role),
      `Rol ${ROLE_LABEL[role]} revocado.`,
    );
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {users.map((user) => {
        const roleSet = new Set(user.roles);
        const isOwner = roleSet.has("OWNER");
        const toAssign = ASSIGNABLE.filter((r) => !roleSet.has(r));
        const toRevoke = ASSIGNABLE.filter((r) => roleSet.has(r));
        const fb = feedback && feedback.userId === user.id ? feedback : null;
        const name = user.display_name?.trim() || "Sin nombre";

        return (
          <Card key={user.id}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "15.5px", fontWeight: 600, color: "var(--marfil)" }}>
                  {name}
                  {user.id === currentUserId && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--gold)",
                        letterSpacing: ".1em",
                      }}
                    >
                      TÚ
                    </span>
                  )}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "12px",
                    color: "var(--tx-d-dim)",
                    fontFamily: "var(--mono)",
                    wordBreak: "break-all",
                  }}
                >
                  {user.id}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--tx-d-mut)" }}>
                  Alta: {fmtDate(user.created_at)}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {user.roles.map((role) => (
                  <span key={role} style={chipStyle(role)}>
                    {ROLE_LABEL[role] ?? role}
                  </span>
                ))}
              </div>
            </div>

            {isOwner ? (
              <p style={{ margin: "14px 0 0", fontSize: "12.5px", color: "var(--tx-d-dim)" }}>
                El propietario está protegido: su rol no se modifica desde el panel.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--line-dark-2)",
                }}
              >
                {toAssign.map((role) => {
                  const key = `${user.id}:assign:${role}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => assign(user, role)}
                      disabled={pending}
                      style={{
                        ...btnGhost,
                        cursor: pending ? "wait" : "pointer",
                        opacity: pending && busy !== key ? 0.6 : 1,
                      }}
                    >
                      {busy === key ? "Asignando…" : `+ Asignar ${ROLE_LABEL[role]}`}
                    </button>
                  );
                })}
                {toRevoke.map((role) => {
                  const key = `${user.id}:revoke:${role}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => revoke(user, role)}
                      disabled={pending}
                      aria-label={`Quitar rol ${ROLE_LABEL[role]} de ${name}`}
                      style={{
                        ...btnDanger,
                        cursor: pending ? "wait" : "pointer",
                        opacity: pending && busy !== key ? 0.6 : 1,
                      }}
                    >
                      {busy === key ? "Quitando…" : `Quitar ${ROLE_LABEL[role]}`}
                    </button>
                  );
                })}
                {toAssign.length === 0 && toRevoke.length === 0 && (
                  <span style={{ fontSize: "12.5px", color: "var(--tx-d-dim)" }}>
                    Sin cambios de rol disponibles.
                  </span>
                )}
              </div>
            )}

            {fb && (
              <p
                role={fb.kind === "error" ? "alert" : "status"}
                style={{
                  margin: "12px 0 0",
                  fontSize: "13px",
                  color: fb.kind === "error" ? "#f0a6a6" : "var(--gold)",
                }}
              >
                {fb.text}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
