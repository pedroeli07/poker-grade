import type { ImportListRow, ImportsColumnKey } from "@/lib/types";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import {
  compareDate,
  compareNumber,
  compareString,
  type SortDir,
} from "@/lib/table-sort";

export function importsListColumnSortKind(col: ImportsColumnKey): ColumnSortKind {
  if (col === "date") return "date";
  if (col === "fileName" || col === "player") return "string";
  return "number";
}

export function sortImportListRows(
  filtered: ImportListRow[],
  sort: { key: ImportsColumnKey; dir: SortDir } | null
): ImportListRow[] {
  if (!sort) return filtered;
  const { key, dir } = sort;
  const copy = [...filtered];
  copy.sort((a, b) => {
    switch (key) {
      case "fileName":
        return compareString(a.fileName, b.fileName, dir);
      case "player":
        return compareString(a.playerName ?? "", b.playerName ?? "", dir);
      case "totalRows":
        return compareNumber(a.totalRows, b.totalRows, dir);
      case "played":
        return compareNumber(a.matchedInGrade, b.matchedInGrade, dir);
      case "extraPlay":
        return compareNumber(a.outOfGrade, b.outOfGrade, dir);
      case "didntPlay":
        return compareNumber(a.suspect, b.suspect, dir);
      case "date":
        return compareDate(a.createdAt, b.createdAt, dir);
      default:
        return 0;
    }
  });
  return copy;
}
