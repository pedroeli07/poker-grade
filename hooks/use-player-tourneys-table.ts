"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";
import { PLAYER_TOURNEYS_LS_PREFIX } from "@/lib/constants/jogador";
import type { PlayerTourneysSort } from "@/lib/types/jogador";
import { usePersistentState } from "@/hooks/use-persistent-state";
import {
  buildPlayerTourneysFilterOptions,
  countPlayerTourneyScheduling,
  filterPlayerTourneyRows,
  nextPlayerTourneysSort,
  sortPlayerTourneyRows,
} from "@/lib/jogador/player-tourneys-table";

export function usePlayerTourneysTable(rows: PlayerTourneyRow[]) {
  const [search] = usePersistentState<string>(`${PLAYER_TOURNEYS_LS_PREFIX}search`, "");
  const [sort, setSort, sortHydrated] = usePersistentState<PlayerTourneysSort>(`${PLAYER_TOURNEYS_LS_PREFIX}sort`, null);

  const toggleSort = useCallback(
    (key: string) => setSort((prev) => nextPlayerTourneysSort(prev, key)),
    [setSort]
  );

  const [siteFilter, setSiteFilter, h1] = usePersistentState<Set<string> | null>(`${PLAYER_TOURNEYS_LS_PREFIX}site`, null);
  const [schedulingFilter, setSchedulingFilter, h2] = usePersistentState<Set<string> | null>(
    `${PLAYER_TOURNEYS_LS_PREFIX}scheduling`,
    null
  );
  const [speedFilter, setSpeedFilter, h3] = usePersistentState<Set<string> | null>(`${PLAYER_TOURNEYS_LS_PREFIX}speed`, null);
  const [priorityFilter, setPriorityFilter, h4] = usePersistentState<Set<string> | null>(
    `${PLAYER_TOURNEYS_LS_PREFIX}priority`,
    null
  );
  const [rebuyFilter, setRebuyFilter, h5] = usePersistentState<Set<string> | null>(`${PLAYER_TOURNEYS_LS_PREFIX}rebuy`, null);
  const [dateFilter, setDateFilter, h6] = usePersistentState<Set<string> | null>(`${PLAYER_TOURNEYS_LS_PREFIX}date`, null);
  const [buyInFilter, setBuyInFilter, h7] = usePersistentState<Set<string> | null>(`${PLAYER_TOURNEYS_LS_PREFIX}buyIn`, null);
  const [tourneyFilter, setTourneyFilter, h8] = usePersistentState<Set<string> | null>(
    `${PLAYER_TOURNEYS_LS_PREFIX}tournamentName`,
    null
  );
  const [sharkIdFilter, setSharkIdFilter, h9] = usePersistentState<Set<string> | null>(
    `${PLAYER_TOURNEYS_LS_PREFIX}sharkId`,
    null
  );

  const filtersHydrated = sortHydrated && h1 && h2 && h3 && h4 && h5 && h6 && h7 && h8 && h9;

  const options = useMemo(() => buildPlayerTourneysFilterOptions(rows), [rows]);

  const filterState = useMemo(
    () => ({
      search,
      schedulingFilter,
      siteFilter,
      speedFilter,
      priorityFilter,
      rebuyFilter,
      dateFilter,
      buyInFilter,
      tourneyFilter,
      sharkIdFilter,
    }),
    [
      search,
      schedulingFilter,
      siteFilter,
      speedFilter,
      priorityFilter,
      rebuyFilter,
      dateFilter,
      buyInFilter,
      tourneyFilter,
      sharkIdFilter,
    ]
  );

  const filtered = useMemo(() => {
    const base = filterPlayerTourneyRows(rows, filterState);
    return sortPlayerTourneyRows(base, sort);
  }, [rows, filterState, sort]);

  const counts = useMemo(() => countPlayerTourneyScheduling(rows), [rows]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);

  /* eslint-disable react-hooks/set-state-in-effect -- reset de paginação quando filtros mudam */
  useEffect(() => {
    setPage(1);
  }, [search, sort, siteFilter, schedulingFilter, speedFilter, priorityFilter, rebuyFilter, dateFilter, buyInFilter, tourneyFilter, sharkIdFilter]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return {
    filtersHydrated,
    search,
    sort,
    toggleSort,
    siteFilter,
    setSiteFilter,
    schedulingFilter,
    setSchedulingFilter,
    speedFilter,
    setSpeedFilter,
    priorityFilter,
    setPriorityFilter,
    rebuyFilter,
    setRebuyFilter,
    dateFilter,
    setDateFilter,
    buyInFilter,
    setBuyInFilter,
    tourneyFilter,
    setTourneyFilter,
    sharkIdFilter,
    setSharkIdFilter,
    options,
    filtered,
    counts,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedRows,
  };
}

export type PlayerTourneysTableApi = ReturnType<typeof usePlayerTourneysTable>;
