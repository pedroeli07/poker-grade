"use client";

import { useMemo, useCallback } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { distinctOptions } from "@/lib/utils/distinct-options";
import { formatNumberFilterSummary } from "@/lib/utils/player";
import type { OpponentListRow } from "@/lib/types/opponent";
import { OPPONENT_CLASSIFICATION_LABELS, OPPONENT_STYLE_LABELS } from "@/lib/types/opponent";
import { POKER_NETWORKS_UI } from "@/lib/constants/poker-networks";
import type { NumberFilterValue } from "@/lib/number-filter";
import { isFilterActive } from "@/lib/number-filter";
import { matchNumberFilter, getUniqueValues } from "@/lib/match-number-filter";
import {
  dayKeyFromDate,
  matchLastNoteColumnFilter,
  isLastNoteFilterActive,
  type OpponentsLastNoteFilterState,
} from "@/lib/opponents/last-note-filter";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import {
  compareNumber,
  compareString,
  compareDate,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";

export type OpponentsTableSortKey =
  | "nick"
  | "network"
  | "tag"
  | "style"
  | "notesCount"
  | "lastNoteAt";

export type OpponentsColumnKey = "nick" | "network" | "tag" | "style";

const NONE = "__none__";

const OPPONENTS_TABLE_SORT_LABELS: Record<OpponentsTableSortKey, string> = {
  nick: "Nickname",
  network: "Site",
  tag: "Tag",
  style: "Estilo",
  notesCount: "Notas",
  lastNoteAt: "Última",
};

function networkLabel(network: string) {
  return POKER_NETWORKS_UI.find((n) => n.value === network)?.label ?? network;
}

function classificationKey(row: OpponentListRow) {
  return row.consolidated.classification ?? NONE;
}

function styleKey(row: OpponentListRow) {
  return row.consolidated.style ?? NONE;
}

function createLabelMap(opts: { value: string; label: string }[]) {
  return new Map(opts.map((o) => [o.value, o.label]));
}

function labelsFromSet(set: Set<string>, map: Map<string, string>) {
  if (!set.size) return "(nenhum valor selecionado)";
  return [...set].map((v) => map.get(v) ?? v).join(", ");
}

export type OpponentsTableFilters = {
  nick: Set<string> | null;
  network: Set<string> | null;
  tag: Set<string> | null;
  style: Set<string> | null;
};

export type OpponentsTableFilterOptions = {
  nick: { value: string; label: string }[];
  network: { value: string; label: string }[];
  tag: { value: string; label: string }[];
  style: { value: string; label: string }[];
  lastNote: { value: string; label: string }[];
};

const DTF_SHORT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function buildLastNoteOptions(rows: OpponentListRow[]) {
  const map = new Map<string, string>();
  for (const r of rows) {
    const d = new Date(r.lastNoteAt);
    const key = dayKeyFromDate(d);
    if (!map.has(key)) map.set(key, DTF_SHORT.format(d));
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([value, label]) => ({ value, label }));
}

function isoDayToPtLabel(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const y = Number(parts[0]);
  const mo = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return iso;
  return DTF_SHORT.format(new Date(y, mo - 1, d));
}

function buildOpponentsFilterSummaryLines(
  filters: OpponentsTableFilters,
  options: OpponentsTableFilterOptions,
  numFilters: Record<string, NumberFilterValue | null | undefined>,
  lastNoteFilter: OpponentsLastNoteFilterState
): string[] {
  const linesOut: string[] = [];

  if (filters.nick !== null) {
    linesOut.push(`Nickname: ${labelsFromSet(filters.nick, createLabelMap(options.nick))}`);
  }
  if (filters.network !== null) {
    linesOut.push(`Site: ${labelsFromSet(filters.network, createLabelMap(options.network))}`);
  }
  if (filters.tag !== null) {
    linesOut.push(`Tag: ${labelsFromSet(filters.tag, createLabelMap(options.tag))}`);
  }
  if (filters.style !== null) {
    linesOut.push(`Estilo: ${labelsFromSet(filters.style, createLabelMap(options.style))}`);
  }

  const nf = numFilters.notes;
  if (nf && isFilterActive(nf)) {
    linesOut.push(`Notas: ${formatNumberFilterSummary(nf, "")}`);
  }

  if (isLastNoteFilterActive(lastNoteFilter)) {
    const segs: string[] = [];
    if (lastNoteFilter.unique !== null) {
      segs.push(`datas: ${labelsFromSet(lastNoteFilter.unique, createLabelMap(options.lastNote))}`);
    }
    if (lastNoteFilter.dateFrom || lastNoteFilter.dateTo) {
      const a = lastNoteFilter.dateFrom ? isoDayToPtLabel(lastNoteFilter.dateFrom) : "…";
      const b = lastNoteFilter.dateTo ? isoDayToPtLabel(lastNoteFilter.dateTo) : "…";
      segs.push(`intervalo ${a}–${b}`);
    }
    linesOut.push(`Última: ${segs.join("; ")}`);
  }

  return linesOut;
}

function formatOpponentsSortSummary(
  sort: { key: OpponentsTableSortKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;
  const label = OPPONENTS_TABLE_SORT_LABELS[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${label} (${dirPt})`;
}

export function useOpponentsTablePage(rows: OpponentListRow[]) {
  const [filters, setFilters] = usePersistentState<OpponentsTableFilters>(
    "gestao-grades:opponents:filters",
    {
      nick: null,
      network: null,
      tag: null,
      style: null,
    }
  );

  const [numFilters, setNumFilters] = usePersistentState<Record<string, NumberFilterValue | null>>(
    "gestao-grades:opponents:num-filters",
    {}
  );

  const [sort, setSort] = usePersistentState<{
    key: OpponentsTableSortKey;
    dir: SortDir;
  } | null>("gestao-grades:opponents:sort", null);

  const [lastNoteFilter, setLastNoteFilter] = usePersistentState<OpponentsLastNoteFilterState>(
    "gestao-grades:opponents:last-note-filter",
    { unique: null, dateFrom: null, dateTo: null }
  );

  const options = useMemo(
    (): OpponentsTableFilterOptions => ({
      nick: distinctOptions(rows, (r) => ({ value: r.nick, label: r.nick })),
      network: distinctOptions(rows, (r) => ({
        value: r.network,
        label: networkLabel(r.network),
      })),
      tag: [
        ...Object.entries(OPPONENT_CLASSIFICATION_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
        { value: NONE, label: "(sem tag)" },
      ],
      style: [
        ...Object.entries(OPPONENT_STYLE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
        { value: NONE, label: "(sem estilo)" },
      ],
      lastNote: buildLastNoteOptions(rows),
    }),
    [rows]
  );

  const uniqueNotes = useMemo(() => getUniqueValues(rows, (r) => r.notesCount), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.nick && !filters.nick.has(r.nick)) return false;
      if (filters.network && !filters.network.has(r.network)) return false;
      if (filters.tag && !filters.tag.has(classificationKey(r))) return false;
      if (filters.style && !filters.style.has(styleKey(r))) return false;
      if (!matchNumberFilter(r.notesCount, numFilters.notes ?? null)) return false;
      if (!matchLastNoteColumnFilter(r.lastNoteAt, lastNoteFilter)) return false;
      return true;
    });
  }, [rows, filters, numFilters, lastNoteFilter]);

  const sortedFiltered = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "nick":
          return compareString(a.nick, b.nick, dir);
        case "network":
          return compareString(a.network, b.network, dir);
        case "tag":
          return compareString(classificationKey(a), classificationKey(b), dir);
        case "style":
          return compareString(styleKey(a), styleKey(b), dir);
        case "notesCount":
          return compareNumber(a.notesCount, b.notesCount, dir);
        case "lastNoteAt":
          return compareDate(a.lastNoteAt, b.lastNoteAt, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  const setColumnFilter = useCallback(
    (col: OpponentsColumnKey) => (next: Set<string> | null) => {
      setFilters((prev) => ({ ...prev, [col]: next }));
    },
    [setFilters]
  );

  const setNumFilter = useCallback(
    (col: string) => (v: NumberFilterValue | null) => {
      setNumFilters((prev) => ({ ...prev, [col]: v }));
    },
    [setNumFilters]
  );

  const toggleSort = useCallback(
    (key: OpponentsTableSortKey, kind: ColumnSortKind) => {
      setSort((prev) => nextSortState(prev, key, kind));
    },
    [setSort]
  );

  const hasNumFilter = Object.values(numFilters).some((v) => v && isFilterActive(v));

  const anyFilter =
    filters.nick !== null ||
    filters.network !== null ||
    filters.tag !== null ||
    filters.style !== null ||
    hasNumFilter ||
    isLastNoteFilterActive(lastNoteFilter);

  const clearFilters = useCallback(() => {
    setFilters({ nick: null, network: null, tag: null, style: null });
    setNumFilters({});
    setLastNoteFilter({ unique: null, dateFrom: null, dateTo: null });
    setSort(null);
  }, [setFilters, setNumFilters, setLastNoteFilter, setSort]);

  const hasActiveView = anyFilter || sort !== null;

  const filterSummaryLines = useMemo(
    () => buildOpponentsFilterSummaryLines(filters, options, numFilters, lastNoteFilter),
    [filters, options, numFilters, lastNoteFilter]
  );

  const sortSummary = useMemo(() => formatOpponentsSortSummary(sort), [sort]);

  return {
    rows,
    filtered: sortedFiltered,
    filters,
    options,
    setCol: setColumnFilter,
    numFilters,
    setNumFilter,
    toggleSort,
    sort,
    clearFilters,
    anyFilter,
    hasActiveView,
    filterSummaryLines,
    sortSummary,
    uniqueNotes,
    lastNoteFilter,
    setLastNoteFilter,
  };
}

export type { OpponentsLastNoteFilterState } from "@/lib/opponents/last-note-filter";
