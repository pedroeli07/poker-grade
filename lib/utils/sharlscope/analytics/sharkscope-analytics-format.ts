function isMissingNumber(n: number | null | undefined): n is null | undefined {
  return n == null || !Number.isFinite(n);
}

export function fmtEntries(n: number | null | undefined): string {
  if (isMissingNumber(n)) return "—";
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export function fmtProfitUsd(n: number | null | undefined): string {
  if (isMissingNumber(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtPct(n: number | null | undefined): string {
  if (isMissingNumber(n)) return "—";
  return `${n.toFixed(1)}%`;
}

export function fmtStake(n: number | null | undefined): string {
  if (isMissingNumber(n)) return "—";
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