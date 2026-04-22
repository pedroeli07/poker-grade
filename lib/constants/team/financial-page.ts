import type { FinancialClosureRow, FinancialKpiCard } from "@/lib/types/team/financial";

export const FINANCIAL_DEMO_CLOSURES: FinancialClosureRow[] = [
  {
    monthLabel: "Fevereiro 2026",
    gross: "$ 125.000",
    playerShare: "$ 62.500",
    expenses: "$ 12.000",
    net: "$ 50.500",
    status: "positive",
  },
  {
    monthLabel: "Janeiro 2026",
    gross: "$ 110.000",
    playerShare: "$ 55.000",
    expenses: "$ 11.500",
    net: "$ 43.500",
    status: "positive",
  },
  {
    monthLabel: "Dezembro 2025",
    gross: "$ 85.000",
    playerShare: "$ 42.500",
    expenses: "$ 15.000",
    net: "$ 27.500",
    status: "positive",
  },
];

export const FINANCIAL_DEMO_KPIS: FinancialKpiCard[] = [
  {
    id: "bankroll",
    title: "Saldo em caixa (bankroll)",
    value: "$ 450.000",
    subLabel: "+5,2% vs. mês anterior",
    subVariant: "emerald",
    trend: "up",
  },
  {
    id: "makeup",
    title: "Total em makeup (risco)",
    value: "$ 42.500",
    subLabel: "+1,1% vs. mês anterior",
    subVariant: "red",
    trend: "down",
  },
  {
    id: "transfers",
    title: "Repasses pendentes",
    value: "$ 15.200",
    subLabel: "8 jogadores aguardando",
    subVariant: "muted",
    trend: "neutral",
  },
];
