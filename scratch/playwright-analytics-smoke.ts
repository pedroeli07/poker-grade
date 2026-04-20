/**
 * Smoke: login → analytics Por Site. Run: PW_EMAIL=... PW_PASS=... npx tsx scratch/playwright-analytics-smoke.ts
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE ?? "http://localhost:3000";
const email = process.env.PW_EMAIL;
const password = process.env.PW_PASS;

async function main() {
  if (!email || !password) {
    console.error("Set PW_EMAIL and PW_PASS");
    process.exit(1);
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30_000 });
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await Promise.all([
      page.waitForURL(/\/(admin|jogador)\//, { timeout: 30_000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.goto(`${BASE}/admin/sharkscope/analises`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    const body = await page.locator("body").innerText();
    const emptyState = body.includes("Sem estatísticas por rede no cache");
    const hasPorSiteButton = body.includes("Por Site");
    const hasAnalyticsTitle = body.includes("Analytics SharkScope");
    const title = await page.title();
    console.log(JSON.stringify({ ok: true, title, hasAnalyticsTitle, hasPorSiteButton, emptyState, bodyLen: body.length }, null, 2));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: String(e) }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
