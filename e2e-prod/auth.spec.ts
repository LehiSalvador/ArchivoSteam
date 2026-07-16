import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

// Auth smoke contra el dominio canónico en producción. Usa cuentas QA temporales
// (creadas por service role) y las elimina. No siembra contenido público.
const CRED = "C:/PROYECTOS_CLAUDE/ARCHIVO_STEAM/04_CREDENCIALES_PRIVADAS/.env.claude.local";
const src = fs.readFileSync(CRED, "utf8");
const V = (n: string) => (src.match(new RegExp("^" + n + "=(.*)$", "m"))?.[1] ?? "").replace(/^["']|["'\r]+$/g, "");
const URL = V("SUPABASE_URL"), SECRET = V("SUPABASE_SERVICE_ROLE_KEY");
const PW = "ProdQA!2026";
const ts = Date.now().toString(36);

const admin = (path: string, method: string, body?: unknown) =>
  fetch(`${URL}${path}`, { method, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body ? JSON.stringify(body) : undefined });

const owner = { email: `prodqa-owner-${ts}@example.com`, id: "" };
const member = { email: `prodqa-member-${ts}@example.com`, id: "" };

test.beforeAll(async () => {
  for (const u of [owner, member]) {
    const r = await admin("/auth/v1/admin/users", "POST", { email: u.email, password: PW, email_confirm: true });
    u.id = (await r.json()).id;
  }
  await admin("/rest/v1/user_roles", "POST", { user_id: owner.id, role: "OWNER", granted_by: owner.id });
});

test.afterAll(async () => {
  for (const u of [owner, member]) if (u.id) await admin(`/auth/v1/admin/users/${u.id}`, "DELETE");
});

async function login(page: Page, email: string) {
  await page.goto("/cuenta/iniciar-sesion");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PW);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/cuenta", { timeout: 25_000 });
}

test("PROD: OWNER login por UI → /cuenta (cookies) → /admin", async ({ page }) => {
  await login(page, owner.email);
  await expect(page.getByText(owner.email)).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
  // logout
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.waitForURL("**/cuenta/iniciar-sesion", { timeout: 25_000 });
});

test("PROD: MEMBER no accede a /admin", async ({ page }) => {
  await login(page, member.email);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/cuenta/);
});
