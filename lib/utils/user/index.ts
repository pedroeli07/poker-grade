import {
  USER_DIRECTORY_STATUS,
  USERS_FILTER_SUMMARY_EMPTY_SELECTION,
  USERS_FILTER_SUMMARY_SEARCH_PREFIX,
  USERS_TABLE_COLUMN_LABELS,
} from "@/lib/constants/users";
import type { UserColumnFilters, UserColumnKey, UserDirectoryRow } from "@/lib/types/user/index";
import { compareString, type SortDir } from "@/lib/table-sort";

const getUserDirectoryStatus = (u: UserDirectoryRow) =>
  u.isRegistered ? USER_DIRECTORY_STATUS.REGISTERED : USER_DIRECTORY_STATUS.PENDING;

const createLabelMap = (opts: { value: string; label: string }[]) =>
  new Map(opts.map((o) => [o.value, o.label]));

const labelsFromSet = (set: Set<string>, map: Map<string, string>) =>
  !set.size
    ? USERS_FILTER_SUMMARY_EMPTY_SELECTION
    : [...set].map((v) => map.get(v) ?? v).join(", ");

export function filterUsersDirectoryRows(
  rows: UserDirectoryRow[],
  searchQuery: string,
  filters: UserColumnFilters
): UserDirectoryRow[] {
  const search = searchQuery.toLowerCase().trim();

  return rows.filter((u) => {
    if (search && !u.email.toLowerCase().includes(search)) return false;

    if (filters.email && !filters.email.has(u.email)) return false;
    if (filters.role && !filters.role.has(u.role)) return false;

    if (filters.status && !filters.status.has(getUserDirectoryStatus(u))) return false;

    return true;
  });
}

const SORT_HANDLERS = {
  email: (a: UserDirectoryRow, b: UserDirectoryRow, dir: SortDir) =>
    compareString(a.email, b.email, dir),

  role: (a: UserDirectoryRow, b: UserDirectoryRow, dir: SortDir) =>
    compareString(a.role, b.role, dir),

  status: (a: UserDirectoryRow, b: UserDirectoryRow, dir: SortDir) =>
    compareString(getUserDirectoryStatus(a), getUserDirectoryStatus(b), dir),
} satisfies Record<
  UserColumnKey,
  (a: UserDirectoryRow, b: UserDirectoryRow, dir: SortDir) => number
>;

export function sortUsersDirectoryRows(
  rows: UserDirectoryRow[],
  tableSort: { key: UserColumnKey; dir: SortDir } | null
): UserDirectoryRow[] {
  if (!tableSort) return rows;

  const handler = SORT_HANDLERS[tableSort.key];
  if (!handler) return rows;

  return [...rows].sort((a, b) => handler(a, b, tableSort.dir));
}

export function computeUsersDirectoryStats(rows: UserDirectoryRow[]) {
  let reg = 0;

  for (const u of rows) {
    if (u.isRegistered) reg++;
  }

  return {
    total: rows.length,
    reg,
    pend: rows.length - reg,
  };
}

export function buildUsersFilterSummaryLines(
  searchQuery: string,
  filters: {
    email: Set<string> | null;
    role: Set<string> | null;
    status: Set<string> | null;
  },
  options: Record<UserColumnKey, { value: string; label: string }[]>
): string[] {
  const lines: string[] = [];
  const q = searchQuery.trim();

  if (q) {
    lines.push(`${USERS_FILTER_SUMMARY_SEARCH_PREFIX}${q}`);
  }

  const labels = USERS_TABLE_COLUMN_LABELS;

  for (const key of Object.keys(labels) as UserColumnKey[]) {
    const applied = filters[key];

    if (applied !== null) {
      const map = createLabelMap(options[key] ?? []);
      lines.push(`${labels[key]}: ${labelsFromSet(applied, map)}`);
    }
  }

  return lines;
}

export function formatUsersSortSummary(
  sort: { key: UserColumnKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;

  const label = USERS_TABLE_COLUMN_LABELS[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";

  return `${label} (${dirPt})`;
}
