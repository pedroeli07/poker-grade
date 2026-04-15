import { test, expect } from "@playwright/test";
import { PERF_BUDGET_MS } from "./performance-budgets";

test.describe.configure({ timeout: PERF_BUDGET_MS.coldNavigation + 30_000 });

test.describe("Performance — rotas públicas (sem auth)", () => {
  test("GET /login: primeira carga dentro do orçamento; segunda mais rápida", async ({
    page,
  }) => {
    const tCold = Date.now();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const coldMs = Date.now() - tCold;
    expect(coldMs).toBeLessThan(PERF_BUDGET_MS.coldNavigation);

    await expect(page).toHaveTitle(/Login/i);

    const tWarm = Date.now();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const warmMs = Date.now() - tWarm;
    expect(warmMs).toBeLessThan(PERF_BUDGET_MS.warmNavigation);
  });

  test("GET / redireciona para /login dentro do orçamento", async ({ page }) => {
    const t0 = Date.now();
    const res = await page.goto("/", { waitUntil: "commit" });
    expect(res?.status() ?? 0).toBeLessThan(400);
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    expect(Date.now() - t0).toBeLessThan(PERF_BUDGET_MS.rootRedirect);
  });

  test("Navigation Timing API: /login reporta duração finita", async ({ page }) => {
    await page.goto("/login", { waitUntil: "load" });
    const nav = await page.evaluate(() => {
      const e = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      return e
        ? {
            duration: e.duration,
            domContentLoaded: e.domContentLoadedEventEnd - e.startTime,
          }
        : null;
    });
    expect(nav).not.toBeNull();
    if (nav) {
      expect(nav.duration).toBeGreaterThan(0);
      expect(Number.isFinite(nav.duration)).toBe(true);
    }
  });
});
