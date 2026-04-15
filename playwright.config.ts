import { defineConfig, devices } from "@playwright/test";

/** Evita aviso Node quando FORCE_COLOR e NO_COLOR estão ambos definidos (ex.: Cursor). */
if (process.env.FORCE_COLOR && process.env.NO_COLOR) {
  delete process.env.NO_COLOR;
}

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  /**
   * Reutiliza `npm run dev` se já estiver a correr (Next não permite dois dev
   * servers no mesmo diretório). Para E2E completo, reinicie o dev e corra
   * `npm run test:e2e`.
   */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
