import { expect, test } from "@playwright/test";

/**
 * Smoke E2E: garante que a página de registo hidrata e expõe os campos.
 * A lógica de força da senha e `canSubmit` está coberta em Vitest
 * (`lib/auth/password-policy.test.ts`).
 *
 * Nota: `fill` / `pressSequentially` no Chromium+Playwright podem alterar o DOM
 * sem disparar o mesmo pipeline que o teclado real em inputs controlados do
 * React; por isso não dependemos disso aqui.
 */
test.describe("Registo — página", () => {
  test("mostra formulário e medidor de força", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: /Poker/i })
    ).toBeVisible();
    await expect(page.locator("#reg-email")).toBeVisible();
    await expect(page.locator("#reg-password")).toBeVisible();
    await expect(page.locator("#reg-confirm")).toBeVisible();
    await expect(page.getByTestId("password-strength-level")).toHaveText(
      "Digite uma senha"
    );
    await expect(page.getByTestId("register-submit")).toBeDisabled();
  });
});
