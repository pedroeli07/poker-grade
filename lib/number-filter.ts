export type NumberFilterOp = "eq" | "gt" | "lt" | "gte" | "lte" | "between" | "in";

export interface NumberFilterValue {
  op: NumberFilterOp;
  min: number | null;
  max: number | null;
  values?: number[];
}

export const OP_LABELS: Record<NumberFilterOp, string> = {
  eq: "=",
  gt: ">",
  lt: "<",
  gte: "≥",
  lte: "≤",
  between: "entre",
  in: "em",
};

export const OPS_WITH_RANGE: NumberFilterOp[] = ["between", "eq", "gt", "lt", "gte", "lte"];

export function isFilterActive(v: NumberFilterValue | null): boolean {
  if (!v) return false;
  if (v.values && v.values.length > 0) return true;
  return v.min !== null || v.max !== null;
}

export function buildNumberFilter(
  mode: "range" | "values",
  op: NumberFilterOp,
  min: string,
  max: string,
  selectedValues: Set<number>
): NumberFilterValue | null {
  if (mode === "values") {
    if (selectedValues.size === 0) return null;
    return { op: "in", min: null, max: null, values: [...selectedValues] };
  }

  const minNum = min === "" ? null : parseFloat(min.replace(",", "."));
  const maxNum = max === "" ? null : parseFloat(max.replace(",", "."));

  if (op === "eq" && minNum !== null) return { op, min: minNum, max: minNum };
  if ((op === "between" || op === "eq") && minNum === null && maxNum === null) return null;
  if (op === "between") return { op, min: minNum, max: maxNum };
  return { op, min: minNum, max: minNum };
}

export function formatNumberValue(v: number, suffix: string): string {
  if (suffix === "%") return `${v.toFixed(1)}%`;
  if (suffix === "$") return `$${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  if (suffix === "") return v.toLocaleString("pt-BR");
  return `${v}${suffix}`;
}