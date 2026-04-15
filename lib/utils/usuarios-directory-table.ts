import type {
  UsuarioDirectoryRow,
  UsuariosColumnFilters,
  UsuariosColumnKey,
} from "@/lib/types";
import type { SortDir } from "@/lib/table-sort";
import { compareString } from "@/lib/table-sort";

export function filterUsuariosDirectoryRows(
  rows: UsuarioDirectoryRow[],
  searchQuery: string,
  filters: UsuariosColumnFilters
): UsuarioDirectoryRow[] {
  return rows.filter((u) => {
    const s = searchQuery.toLowerCase().trim();
    if (s && !u.email.toLowerCase().includes(s)) return false;

    if (filters.email && !filters.email.has(u.email)) return false;
    if (filters.role && !filters.role.has(u.role)) return false;

    const statusVal = u.isRegistered ? "REGISTERED" : "PENDING";
    if (filters.status && !filters.status.has(statusVal)) return false;

    return true;
  });
}

export function sortUsuariosDirectoryRows(
  rows: UsuarioDirectoryRow[],
  tableSort: { key: UsuariosColumnKey; dir: SortDir } | null
): UsuarioDirectoryRow[] {
  if (!tableSort) return rows;
  const { key, dir } = tableSort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "email":
        return compareString(a.email, b.email, dir);
      case "role":
        return compareString(a.role, b.role, dir);
      case "status": {
        const sa = a.isRegistered ? "REGISTERED" : "PENDING";
        const sb = b.isRegistered ? "REGISTERED" : "PENDING";
        return compareString(sa, sb, dir);
      }
      default:
        return 0;
    }
  });
  return copy;
}

export function computeUsuariosDirectoryStats(rows: UsuarioDirectoryRow[]) {
  const reg = rows.filter((u) => u.isRegistered).length;
  return {
    total: rows.length,
    reg,
    pend: rows.length - reg,
  };
}
