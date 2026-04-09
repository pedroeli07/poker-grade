"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { distinctOptions } from "@/lib/utils";
import type { PlayerTableRow, PlayersTableColumnKey } from "@/lib/types";
import type { PlayersTablePayload } from "@/lib/types";
import { getPlayersTableDataAction } from "@/lib/queries/db/player-queries";
import { playerKeys } from "@/lib/queries/player-query-keys";
import { EMPTY_NICK, STALE_TIME } from "@/lib/constants";
import { usePlayersStore } from "@/lib/stores/use-players-store";

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

  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
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
      playerGroup: distinctOptions(rows, (r) => {
        const v = r.playerGroup ?? EMPTY_NICK;
        return {
          value: v,
          label: r.playerGroup ? r.playerGroup : "(sem grupo)",
        };
      }),
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

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filters.name && !filters.name.has(r.name)) return false;
        if (filters.nickname && !filters.nickname.has(r.nickname ?? EMPTY_NICK))
          return false;
        if (
          filters.playerGroup &&
          !filters.playerGroup.has(r.playerGroup ?? EMPTY_NICK)
        )
          return false;
        if (filters.coach && !filters.coach.has(r.coachKey)) return false;
        if (filters.grade && !filters.grade.has(r.gradeKey)) return false;
        if (filters.abi && !filters.abi.has(r.abiKey)) return false;
        if (filters.status && !filters.status.has(r.status)) return false;
        return true;
      }),
    [rows, filters]
  );

  const setCol = useCallback(
    (col: PlayersTableColumnKey) => (next: Set<string> | null) => {
      setColumnFilter(col, next);
    },
    [setColumnFilter]
  );

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
    filtered,
    anyFilter,
    clearFilters,
    setCol,
    onEditPlayer,
  };
}
