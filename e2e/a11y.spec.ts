import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "Inicio", path: "/" },
  { name: "Biblioteca", path: "/biblioteca" },
  { name: "Recorridos", path: "/recorridos" },
  { name: "Proyecto", path: "/proyecto" },
  { name: "Iniciar sesión", path: "/cuenta/iniciar-sesion" },
  { name: "Registro", path: "/cuenta/registro" },
];

for (const p of PAGES) {
  test(`a11y sin violaciones críticas/serias: ${p.name}`, async ({ page }) => {
    await page.goto(p.path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const severe = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    if (severe.length) {
      console.log(`\n[${p.name}] violaciones críticas/serias:`);
      for (const v of severe) {
        console.log(`  - ${v.id} (${v.impact}): nodos=${v.nodes.length}`);
        for (const n of v.nodes.slice(0, 8)) {
          const d = (n.any?.[0]?.data ?? {}) as Record<string, unknown>;
          console.log(`     ${n.target} | fg=${d.fgColor} bg=${d.bgColor} ratio=${d.contrastRatio} need=${d.expectedContrastRatio}`);
        }
      }
    }
    expect(severe, `${p.name} debe estar libre de violaciones críticas/serias`).toEqual([]);
  });
}
