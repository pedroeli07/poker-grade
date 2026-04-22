export type FinancialMonthCloseStatus = "positive" | "negative";

export type FinancialClosureRow = {
  monthLabel: string;
  gross: string;
  playerShare: string;
  expenses: string;
  net: string;
  status: FinancialMonthCloseStatus;
};

export type FinancialKpiCard = {
  id: "bankroll" | "makeup" | "transfers";
  title: string;
  value: string;
  subLabel: string;
  subVariant: "emerald" | "red" | "muted";
  trend: "up" | "down" | "neutral";
};

export type FinancialSummaryCardsProps = {
  items: FinancialKpiCard[];
};

export type FinancialClosuresTableProps = {
  rows: FinancialClosureRow[];
};
