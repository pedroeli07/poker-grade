/**
 * Orçamentos (ms) para testes E2E de performance em rotas públicas.
 * Valores generosos para `next dev` + Turbopack; ajustar em CI se necessário.
 */
export const PERF_BUDGET_MS = {
  /** Primeira navegação (pode compilar rota). */
  coldNavigation: 120_000,
  /** Segunda navegação à mesma rota (cache quente). */
  warmNavigation: 25_000,
  /** Redirecionamento raiz → login. */
  rootRedirect: 30_000,
} as const;
