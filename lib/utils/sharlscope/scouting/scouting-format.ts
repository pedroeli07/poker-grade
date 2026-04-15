export function scoutingProfitClass(profit: number): string {
  return profit >= 0 ? "text-emerald-600" : "text-red-500";
}

export function scoutingProfitText(profit: number): string {
  return `${profit >= 0 ? "+" : ""}$${profit.toFixed(0)}`;
}
