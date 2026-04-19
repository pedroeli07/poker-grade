import { useState, useMemo, useCallback } from "react";
import type { GradeRuleCardRule } from "@/lib/types";

export type GradeRulesColumnKey = "sites" | "gameType" | "speed" | "tournamentType" | "playerCount" | "variant";

export type GradeRulesColumnFilters = Record<GradeRulesColumnKey, Set<string> | null>;
export type GradeRulesColumnOptions = Record<GradeRulesColumnKey, { value: string; label: string }[]>;

export function useGradeRulesList(rules: GradeRuleCardRule[]) {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [filters, setFilters] = useState<GradeRulesColumnFilters>({
    sites: null,
    gameType: null,
    speed: null,
    tournamentType: null,
    playerCount: null,
    variant: null,
  });

  const setCol = useCallback(
    (col: GradeRulesColumnKey) => (next: Set<string> | null) => {
      setFilters((prev) => ({ ...prev, [col]: next }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      sites: null,
      gameType: null,
      speed: null,
      tournamentType: null,
      playerCount: null,
      variant: null,
    });
  }, []);

  const anyFilter = Object.values(filters).some((f) => f !== null && f.size > 0);

  const options = useMemo(() => {
    const opts: GradeRulesColumnOptions = {
      sites: [],
      gameType: [],
      speed: [],
      tournamentType: [],
      playerCount: [],
      variant: [],
    };
    const maps = {
      sites: new Map<string, string>(),
      gameType: new Map<string, string>(),
      speed: new Map<string, string>(),
      tournamentType: new Map<string, string>(),
      playerCount: new Map<string, string>(),
      variant: new Map<string, string>(),
    };

    rules.forEach((r) => {
      r.sites?.forEach((s) => maps.sites.set(String(s.item_id), s.item_text));
      r.gameType?.forEach((s) => maps.gameType.set(String(s.item_id), s.item_text));
      r.speed?.forEach((s) => maps.speed.set(String(s.item_id), s.item_text));
      r.tournamentType?.forEach((s) => maps.tournamentType.set(String(s.item_id), s.item_text));
      r.playerCount?.forEach((s) => maps.playerCount.set(String(s.item_id), s.item_text));
      r.variant?.forEach((s) => maps.variant.set(String(s.item_id), s.item_text));
    });

    for (const key in maps) {
      const k = key as GradeRulesColumnKey;
      opts[k] = Array.from(maps[k].entries())
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    return opts;
  }, [rules]);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
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
    filters,
    setCol,
    clearFilters,
    anyFilter,
    options,
    filtered,
  };
}
