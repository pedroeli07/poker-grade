"use client";

import { useMemo, useCallback } from "react";
import type { GradeRuleCardRule } from "@/lib/types/grade/index";
import { formatGradeRuleUsdInt } from "@/lib/utils/grade-rule-display";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type GradeRulesColumnKey =
  | "filterName"
  | "buyIn"
  | "prizePool"
  | "excludePattern"
  | "sites"
  | "gameType"
  | "speed"
  | "tournamentType"
  | "playerCount"
  | "variant";

export type GradeRulesColumnFilters = Record<GradeRulesColumnKey, Set<string> | null>;
export type GradeRulesColumnOptions = Record<GradeRulesColumnKey, { value: string; label: string }[]>;

function buyInKey(r: GradeRuleCardRule): string {
  if (r.buyInMin == null && r.buyInMax == null) return "__none__";
  return `${String(r.buyInMin ?? "")}|${String(r.buyInMax ?? "")}`;
}

function buyInLabel(r: GradeRuleCardRule): string {
  if (r.buyInMin == null && r.buyInMax == null) return "Sem restrição de buy-in";
  return `$${r.buyInMin ?? "—"} – $${r.buyInMax ?? "—"}`;
}

function prizePoolKey(r: GradeRuleCardRule): string {
  if (r.prizePoolMin == null && r.prizePoolMax == null) return "__none__";
  return `${r.prizePoolMin ?? 0}|${r.prizePoolMax ?? "inf"}`;
}

function prizePoolLabel(r: GradeRuleCardRule): string {
  if (r.prizePoolMin == null && r.prizePoolMax == null) return "Sem garantido";
  const min = r.prizePoolMin != null ? formatGradeRuleUsdInt(r.prizePoolMin) : "0";
  if (r.prizePoolMax != null) {
    return `GTD $${min} – $${formatGradeRuleUsdInt(r.prizePoolMax)}`;
  }
  return `GTD $${min} – ∞`;
}

function excludeKey(r: GradeRuleCardRule): string {
  const p = r.excludePattern?.trim();
  return p ? p : "__none__";
}

const EMPTY_FILTERS: GradeRulesColumnFilters = {
  filterName: null,
  buyIn: null,
  prizePool: null,
  excludePattern: null,
  sites: null,
  gameType: null,
  speed: null,
  tournamentType: null,
  playerCount: null,
  variant: null,
};

export function useGradeRulesList(rules: GradeRuleCardRule[]) {
  const [view, setView, viewHydrated] = usePersistentState<"cards" | "table">(
    "gestao-grades:grade-rules:view",
    "cards"
  );
  const [filters, setFilters, filtersHydrated] =
    usePersistentState<GradeRulesColumnFilters>(
      "gestao-grades:grade-rules:filters",
      { ...EMPTY_FILTERS }
    );
  const hydrated = viewHydrated && filtersHydrated;

  const setCol = useCallback(
    (col: GradeRulesColumnKey) => (next: Set<string> | null) => {
      setFilters((prev) => ({ ...prev, [col]: next }));
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
  }, [setFilters]);

  const anyFilter = Object.values(filters).some((f) => f !== null && f.size > 0);

  const options = useMemo(() => {
    const maps: Record<GradeRulesColumnKey, Map<string, string>> = {
      filterName: new Map<string, string>(),
      buyIn: new Map<string, string>(),
      prizePool: new Map<string, string>(),
      excludePattern: new Map<string, string>(),
      sites: new Map<string, string>(),
      gameType: new Map<string, string>(),
      speed: new Map<string, string>(),
      tournamentType: new Map<string, string>(),
      playerCount: new Map<string, string>(),
      variant: new Map<string, string>(),
    };

    rules.forEach((r) => {
      maps.filterName.set(r.filterName, r.filterName);
      maps.buyIn.set(buyInKey(r), buyInLabel(r));
      maps.prizePool.set(prizePoolKey(r), prizePoolLabel(r));
      const ek = excludeKey(r);
      maps.excludePattern.set(ek, ek === "__none__" ? "Sem exclusão" : ek);

      r.sites?.forEach((s) => maps.sites.set(String(s.item_id), s.item_text));
      r.gameType?.forEach((s) => maps.gameType.set(String(s.item_id), s.item_text));
      r.speed?.forEach((s) => maps.speed.set(String(s.item_id), s.item_text));
      r.tournamentType?.forEach((s) => maps.tournamentType.set(String(s.item_id), s.item_text));
      r.playerCount?.forEach((s) => maps.playerCount.set(String(s.item_id), s.item_text));
      r.variant?.forEach((s) => maps.variant.set(String(s.item_id), s.item_text));
    });

    const keys: GradeRulesColumnKey[] = [
      "filterName",
      "buyIn",
      "prizePool",
      "excludePattern",
      "sites",
      "gameType",
      "speed",
      "tournamentType",
      "playerCount",
      "variant",
    ];
    const opts = {} as GradeRulesColumnOptions;
    for (const key of keys) {
      opts[key] = Array.from(maps[key].entries())
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    }

    return opts;
  }, [rules]);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      if (filters.filterName && filters.filterName.size > 0) {
        if (!filters.filterName.has(r.filterName)) return false;
      }
      if (filters.buyIn && filters.buyIn.size > 0) {
        if (!filters.buyIn.has(buyInKey(r))) return false;
      }
      if (filters.prizePool && filters.prizePool.size > 0) {
        if (!filters.prizePool.has(prizePoolKey(r))) return false;
      }
      if (filters.excludePattern && filters.excludePattern.size > 0) {
        if (!filters.excludePattern.has(excludeKey(r))) return false;
      }
      if (filters.sites && filters.sites.size > 0) {
        if (!r.sites?.some((s) => filters.sites!.has(String(s.item_id)))) return false;
      }
      if (filters.gameType && filters.gameType.size > 0) {
        if (!r.gameType?.some((s) => filters.gameType!.has(String(s.item_id)))) return false;
      }
      if (filters.speed && filters.speed.size > 0) {
        if (!r.speed?.some((s) => filters.speed!.has(String(s.item_id)))) return false;
      }
      if (filters.tournamentType && filters.tournamentType.size > 0) {
        if (!r.tournamentType?.some((s) => filters.tournamentType!.has(String(s.item_id)))) return false;
      }
      if (filters.playerCount && filters.playerCount.size > 0) {
        if (!r.playerCount?.some((s) => filters.playerCount!.has(String(s.item_id)))) return false;
      }
      if (filters.variant && filters.variant.size > 0) {
        if (!r.variant?.some((s) => filters.variant!.has(String(s.item_id)))) return false;
      }
      return true;
    });
  }, [rules, filters]);

  return {
    view,
    setView,
    hydrated,
    filters,
    setCol,
    clearFilters,
    anyFilter,
    options,
    filtered,
  };
}
