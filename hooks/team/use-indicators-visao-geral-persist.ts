"use client";

import { useCallback, useMemo } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { INDICATORS_VISAO_GERAL_LS } from "@/lib/constants/metadata";

export const VISAO_GERAL_PAGE_SIZE_ALL = 10_000;

export function normalizeVisaoGeralPageSize(n: number): number {
  if (!Number.isFinite(n)) return 25;
  const v = Math.floor(n);
  if ([5, 10, 25, 50, 100, VISAO_GERAL_PAGE_SIZE_ALL].includes(v)) return v;
  if (v > 100 && v <= VISAO_GERAL_PAGE_SIZE_ALL) return VISAO_GERAL_PAGE_SIZE_ALL;
  return 25;
}

type VgSnapshot = {
  tipo: string[] | null;
  dri: string[] | null;
  kpi: string[] | null;
  page: number;
  pageSize: number;
};

const DEFAULT_SNAPSHOT: VgSnapshot = {
  tipo: null,
  dri: null,
  kpi: null,
  page: 1,
  pageSize: 25,
};

function toInt(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function parseStrArr(v: unknown): string[] | null {
  if (v == null) return null;
  if (!Array.isArray(v)) return null;
  return v.map((x) => String(x));
}

function snapshotFromStorage(raw: string): VgSnapshot {
  try {
    const p = JSON.parse(raw) as unknown;
    if (typeof p !== "object" || p === null) return DEFAULT_SNAPSHOT;
    const o = p as Record<string, unknown>;
    return {
      tipo: parseStrArr(o.tipo),
      dri: parseStrArr(o.dri),
      kpi: parseStrArr(o.kpi),
      page: Math.max(1, toInt(o.page, 1)),
      pageSize: normalizeVisaoGeralPageSize(toInt(o.pageSize, 25)),
    };
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

export function useIndicatorsVisaoGeralPersist() {
  const [snap, setSnap, hydrated] = usePersistentState<VgSnapshot>(
    INDICATORS_VISAO_GERAL_LS,
    DEFAULT_SNAPSHOT,
    {
      serialize: (v) => JSON.stringify(v),
      deserialize: snapshotFromStorage,
    },
  );

  const tipoFilter = useMemo(
    () => (snap.tipo == null ? null : new Set(snap.tipo)),
    [snap.tipo],
  );
  const driFilter = useMemo(
    () => (snap.dri == null ? null : new Set(snap.dri)),
    [snap.dri],
  );
  const kpiFilter = useMemo(
    () => (snap.kpi == null ? null : new Set(snap.kpi)),
    [snap.kpi],
  );

  const setTipoFilter = useCallback((next: Set<string> | null) => {
    setSnap((s) => ({
      ...s,
      tipo: next == null ? null : [...next],
      page: 1,
    }));
  }, [setSnap]);

  const setDriFilter = useCallback((next: Set<string> | null) => {
    setSnap((s) => ({
      ...s,
      dri: next == null ? null : [...next],
      page: 1,
    }));
  }, [setSnap]);

  const setKpiFilter = useCallback((next: Set<string> | null) => {
    setSnap((s) => ({
      ...s,
      kpi: next == null ? null : [...next],
      page: 1,
    }));
  }, [setSnap]);

  const setPage = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setSnap((s) => {
        const next = typeof updater === "function" ? updater(s.page) : updater;
        return { ...s, page: Math.max(1, Math.floor(next)) };
      });
    },
    [setSnap],
  );

  const setPageSize = useCallback(
    (size: number) => {
      const v = normalizeVisaoGeralPageSize(size);
      setSnap((s) => ({ ...s, pageSize: v, page: 1 }));
    },
    [setSnap],
  );

  const clearFilters = useCallback(() => {
    setSnap((s) => ({
      ...s,
      tipo: null,
      dri: null,
      kpi: null,
      page: 1,
    }));
  }, [setSnap]);

  return {
    tipoFilter,
    driFilter,
    kpiFilter,
    page: snap.page,
    pageSize: snap.pageSize,
    setTipoFilter,
    setDriFilter,
    setKpiFilter,
    setPage,
    setPageSize,
    clearFilters,
    hydrated,
  };
}
