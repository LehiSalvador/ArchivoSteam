import { test, expect, type Page } from "@playwright/test";

const PAGES = [
  { name: "Inicio", path: "/" },
  { name: "Biblioteca", path: "/biblioteca" },
  { name: "Archivo (individual, vacío→404 ok)", path: "/recorridos" },
];

async function measure(page: Page, path: string) {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(path, { waitUntil: "load" });
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), transfer: n.transferSize };
  });
  return { nav, errors };
}

for (const p of PAGES) {
  test(`perf/console: ${p.name}`, async ({ page }) => {
    const { nav, errors } = await measure(page, p.path);
    console.log(`  [${p.name}] DCL=${nav.dcl}ms load=${nav.load}ms transfer=${nav.transfer}B errores=${errors.length}`);
    expect(errors, `sin errores de consola en ${p.name}`).toEqual([]);
    expect(nav.dcl, "DOMContentLoaded razonable").toBeLessThan(3500);
  });
}
