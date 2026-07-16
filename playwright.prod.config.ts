import { defineConfig, devices } from "@playwright/test";

// Smoke de autenticación contra PRODUCCIÓN (dominio canónico). Sin webServer.
export default defineConfig({
  testDir: "./e2e-prod",
  timeout: 60_000,
  expect: { timeout: 20_000 },
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "https://www.archivostem.com", headless: true, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
