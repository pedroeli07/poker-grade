export function fmtEntries(n: number | null): string {
  return n !== null ? n.toLocaleString("pt-BR", { maximumFractionDigits: 0 }) : "—";
}

export function fmtProfitUsd(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtPct(n: number | null): string {
  return n !== null ? `${n.toFixed(1)}%` : "—";
}

export function fmtStake(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

// Estilos de tabela compartilhados
export const ANALYTICS_TABLE_STYLES = {
  thCenter: "whitespace-nowrap text-center align-middle",
  tdCenter: "text-center align-middle",
  filterWrap: "flex justify-center w-full min-w-0",
} as const;

export const { thCenter, tdCenter, filterWrap } = ANALYTICS_TABLE_STYLES;