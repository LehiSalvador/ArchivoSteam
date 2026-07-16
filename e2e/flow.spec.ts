import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

// Lee credenciales del archivo privado (fuera del repo). No imprime valores.
const CRED = "C:/PROYECTOS_CLAUDE/ARCHIVO_STEAM/04_CREDENCIALES_PRIVADAS/.env.claude.local";
const src = fs.readFileSync(CRED, "utf8");
const V = (n: string) => (src.match(new RegExp("^" + n + "=(.*)$", "m"))?.[1] ?? "").replace(/^["']|["'\r]+$/g, "");
const URL = V("SUPABASE_URL"), ANON = V("SUPABASE_ANON_KEY"), SECRET = V("SUPABASE_SERVICE_ROLE_KEY");
const PW = "E2ePass!2026";
const ts = Date.now().toString(36);

const admin = (path: string, method: string, body?: unknown) =>
  fetch(`${URL}${path}`, { method, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body ? JSON.stringify(body) : undefined });

const owner = { email: `e2e-owner-${ts}@example.com`, id: "" };
const member = { email: `e2e-member-${ts}@example.com`, id: "" };
const pub = { slug: `e2e-pub-${ts}`, title: `E2E Publicado ${ts}`, id: "" };
const draft = { slug: `e2e-draft-${ts}`, title: `E2E Borrador ${ts}`, id: "" };

test.beforeAll(async () => {
  for (const u of [owner, member]) {
    const r = await admin("/auth/v1/admin/users", "POST", { email: u.email, password: PW, email_confirm: true });
    u.id = (await r.json()).id;
  }
  await admin("/rest/v1/user_roles", "POST", { user_id: owner.id, role: "OWNER", granted_by: owner.id });
  const mk = async (a: typeof pub, status: string, num: number) => {
    const r = await admin("/rest/v1/archives", "POST", { archive_number: num, slug: a.slug, title: a.title, status, published_at: status === "PUBLISHED" ? new Date().toISOString() : null });
    a.id = (await r.json())[0]?.id;
  };
  await mk(pub, "PUBLISHED", 8000 + (Date.now() % 900));
  await mk(draft, "DRAFT", 8000 + (Date.now() % 900) + 1);
});

test.afterAll(async () => {
  for (const a of [pub, draft]) if (a.id) await fetch(`${URL}/rest/v1/archives?id=eq.${a.id}`, { method: "DELETE", headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` } });
  for (const u of [owner, member]) if (u.id) await admin(`/auth/v1/admin/users/${u.id}`, "DELETE");
});

async function login(page: Page, email: string) {
  await page.goto("/cuenta/iniciar-sesion");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PW);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/cuenta", { timeout: 20_000 });
}

test("OWNER inicia sesión y accede al panel; ve borradores y publicados", async ({ page }) => {
  await login(page, owner.email);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
  await page.goto("/admin/archivos");
  await expect(page.getByText(pub.title)).toBeVisible();
  await expect(page.getByText(draft.title)).toBeVisible();
});

test("MEMBER no accede al panel (redirigido)", async ({ page }) => {
  await login(page, member.email);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/cuenta/);
  await expect(page.getByRole("heading", { name: "Resumen" })).toHaveCount(0);
});

test("Público muestra solo PUBLISHED; el borrador queda oculto", async ({ page }) => {
  await page.goto("/biblioteca");
  await expect(page.getByText(pub.title)).toBeVisible();
  await expect(page.getByText(draft.title)).toHaveCount(0);
  await page.goto(`/archivo/${pub.slug}`);
  await expect(page.getByText(pub.title).first()).toBeVisible();
});

test("Borrador no es accesible públicamente por slug", async ({ page }) => {
  const res = await page.goto(`/archivo/${draft.slug}`);
  expect(res?.status()).toBe(404);
});
