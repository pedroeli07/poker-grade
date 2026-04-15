"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { distinctOptions } from "@/lib/utils";
import type { PlayerTableRow, PlayersTableColumnKey, PlayersTableSortKey } from "@/lib/types";
import type { PlayersTablePayload } from "@/lib/types";
import { getPlayersTableDataAction } from "@/lib/queries/db/player-queries";
import { playerKeys } from "@/lib/queries/player-query-keys";
import { EMPTY_NICK, PLAYER_GROUP_FILTER_HAS_ANY, STALE_TIME } from "@/lib/constants";
import { usePlayersStore } from "@/lib/stores/use-players-store";
import type { NumberFilterValue } from "@/lib/number-filter";
import { matchNumberFilter, getUniqueValues } from "@/lib/match-number-filter";
import type { ColumnSortKind } from "@/lib/types/sortButton";
import {
  compareNumberNullsLast,
  compareString,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";

function nickRowKey(n: { network: string; nick: string }) {
  return `${n.network}\t${n.nick}`;
}

export function usePlayersTablePage(initialPayload: PlayersTablePayload) {
  const { data: payload = initialPayload } = useQuery({
    queryKey: playerKeys.list(),
    queryFn: async () => {
      const r = await getPlayersTableDataAction();
      if (!r.ok) throw new Error(r.error);
      return r.payload;
    },
    initialData: initialPayload,
    staleTime: STALE_TIME,
  });

  const { rows, coaches, grades, allowCoachSelect } = payload;

  const [editRow, setEditRow] = useState<PlayerTableRow | null>(null);
  const [numFilters, setNumFilters] = useState<Record<string, NumberFilterValue | null>>({});
  const [sort, setSort] = useState<{ key: PlayersTableSortKey; dir: SortDir } | null>(null);

  const { filters, setColumnFilter, clearFilters: clearColumnFilters, hasAnyFilter } =
    usePlayersStore();

  const options = useMemo(
    () => ({
      name: distinctOptions(rows, (r) => ({ value: r.name, label: r.name })),
      nickname: distinctOptions(rows, (r) => {
        const v = r.nickname ?? EMPTY_NICK;
        return {
          value: v,
          label: r.nickname ? r.nickname : "(sem nickname)",
        };
      }),
      email: distinctOptions(rows, (r) => {
        const v = r.email ?? EMPTY_NICK;
        return {
          value: v,
          label: r.email ? r.email : "(sem e-mail)",
        };
      }),
      nicks: (() => {
        const map = new Map<string, string>();
        for (const r of rows) {
          for (const n of r.nicks) {
            const key = nickRowKey(n);
            if (!map.has(key)) map.set(key, `${n.nick} · ${n.network}`);
          }
        }
        return [...map.entries()]
          .map(([value, label]) => ({ value, label }))
          .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
      })(),
      playerGroup: [
        {
          value: PLAYER_GROUP_FILTER_HAS_ANY,
          label: "Com grupo Shark (qualquer)",
        },
        ...distinctOptions(rows, (r) => {
          const v = r.playerGroup ?? EMPTY_NICK;
          return {
            value: v,
            label: r.playerGroup ? r.playerGroup : "(sem grupo)",
          };
        }),
      ],
      coach: distinctOptions(rows, (r) => ({
        value: r.coachKey,
        label: r.coachLabel,
      })),
      grade: distinctOptions(rows, (r) => ({
        value: r.gradeKey,
        label: r.gradeLabel,
      })),
      abi: distinctOptions(rows, (r) => ({
        value: r.abiKey,
        label: r.abiLabel,
      })),
      status: distinctOptions(rows, (r) => ({
        value: r.status,
        label:
          r.status === "ACTIVE"
            ? "Ativo"
            : r.status === "SUSPENDED"
              ? "Suspenso"
              : "Inativo",
      })),
    }),
    [rows]
  );

  const uniqueRoiTenDay = useMemo(() => getUniqueValues(rows, (r) => r.roiTenDay), [rows]);
  const uniqueFpTenDay = useMemo(() => getUniqueValues(rows, (r) => r.fpTenDay), [rows]);
  const uniqueFtTenDay = useMemo(() => getUniqueValues(rows, (r) => r.ftTenDay), [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filters.name && !filters.name.has(r.name)) return false;
        if (filters.nickname && !filters.nickname.has(r.nickname ?? EMPTY_NICK))
          return false;
        if (filters.email && !filters.email.has(r.email ?? EMPTY_NICK)) return false;
        if (filters.nicks && filters.nicks.size > 0) {
          const keys = new Set(r.nicks.map(nickRowKey));
          const hit = [...filters.nicks].some((k) => keys.has(k));
          if (!hit) return false;
        }
        if (filters.playerGroup) {
          const fg = filters.playerGroup;
          const hasAny = fg.has(PLAYER_GROUP_FILTER_HAS_ANY);
          const rest = new Set(fg);
          rest.delete(PLAYER_GROUP_FILTER_HAS_ANY);
          if (hasAny && rest.size === 0) {
            if (!r.playerGroup?.trim()) return false;
          } else if (hasAny && rest.size > 0) {
            if (!rest.has(r.playerGroup ?? EMPTY_NICK)) return false;
          } else if (!fg.has(r.playerGroup ?? EMPTY_NICK)) {
            return false;
          }
        }
        if (filters.coach && !filters.coach.has(r.coachKey)) return false;
        if (filters.grade && !filters.grade.has(r.gradeKey)) return false;
        if (filters.abi && !filters.abi.has(r.abiKey)) return false;
        if (filters.status && !filters.status.has(r.status)) return false;

        if (numFilters.roiTenDay && !matchNumberFilter(r.roiTenDay, numFilters.roiTenDay))
          return false;
        if (numFilters.fpTenDay && !matchNumberFilter(r.fpTenDay, numFilters.fpTenDay))
          return false;
        if (numFilters.ftTenDay && !matchNumberFilter(r.ftTenDay, numFilters.ftTenDay))
          return false;

        return true;
      }),
    [rows, filters, numFilters]
  );

  const sortedFiltered = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "name":
          return compareString(a.name, b.name, dir);
        case "email":
          return compareString(a.email ?? "", b.email ?? "", dir);
        case "nicks": {
          const sa = a.nicks.map((n) => n.nick).join(", ") || "";
          const sb = b.nicks.map((n) => n.nick).join(", ") || "";
          return compareString(sa, sb, dir);
        }
        case "playerGroup":
          return compareString(a.playerGroup ?? "", b.playerGroup ?? "", dir);
        case "coachLabel":
          return compareString(a.coachLabel, b.coachLabel, dir);
        case "gradeLabel":
          return compareString(a.gradeLabel, b.gradeLabel, dir);
        case "abiNumericValue":
          return compareNumberNullsLast(a.abiNumericValue, b.abiNumericValue, dir);
        case "roiTenDay":
          return compareNumberNullsLast(a.roiTenDay, b.roiTenDay, dir);
        case "fpTenDay":
          return compareNumberNullsLast(a.fpTenDay, b.fpTenDay, dir);
        case "ftTenDay":
          return compareNumberNullsLast(a.ftTenDay, b.ftTenDay, dir);
        case "status":
          return compareString(a.status, b.status, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  const setCol = useCallback(
    (col: PlayersTableColumnKey) => (next: Set<string> | null) => {
      setColumnFilter(col, next);
    },
    [setColumnFilter]
  );

  const setNumFilter = useCallback(
    (col: string) => (v: NumberFilterValue | null) => {
      setNumFilters((prev) => ({ ...prev, [col]: v }));
    },
    []
  );

  const toggleSort = useCallback((key: PlayersTableSortKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const hasNumFilter = Object.values(numFilters).some(Boolean);
  const anyFilter = hasAnyFilter || hasNumFilter;

  const clearFilters = useCallback(() => {
    clearColumnFilters();
    setNumFilters({});
    setSort(null);
  }, [clearColumnFilters]);

  const onEditPlayer = useCallback((p: PlayerTableRow) => setEditRow(p), []);

  return {
    rows,
    coaches,
    grades,
    allowCoachSelect,
    editRow,
    setEditRow,
    filters,
    options,
    filtered: sortedFiltered,
    anyFilter,
    clearFilters,
    setCol,
    numFilters,
    setNumFilter,
    toggleSort,
    sort,
    uniqueRoiTenDay,
    uniqueFpTenDay,
    uniqueFtTenDay,
    onEditPlayer,
  };
}

export type { PlayersTableSortKey } from "@/lib/types";
