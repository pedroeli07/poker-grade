"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { SHARKSCOPE_NLQ_TIMEZONE } from "@/lib/constants";
import type { PokerNetworkKey, PokerNetworkOption, ScoutingAnalysisRow } from "@/lib/types";
import { parseScoutingSearchPayload } from "@/lib/utils";

export function useScoutingDashboard(
  networkOptions: PokerNetworkOption[],
  initialSaved: ScoutingAnalysisRow[]
) {
  const [nick, setNick] = useState("");
  const [network, setNetwork] = useState<PokerNetworkKey>(
    () => (networkOptions[0]?.value as PokerNetworkKey) ?? "gg"
  );
  const [searchResult, setSearchResult] = useState<Record<string, unknown> | null>(null);
  const [nickId, setNickId] = useState<string | null>(null);
  const [nlqQuestion, setNlqQuestion] = useState("");
  const [nlqAnswer, setNlqAnswer] = useState<Record<string, unknown> | null>(null);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState<ScoutingAnalysisRow[]>(initialSaved);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchStats = useMemo(
    () => parseScoutingSearchPayload(searchResult),
    [searchResult]
  );

  const handleSearch = useCallback(() => {
    const trimmed = nick.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/sharkscope/scouting-search?nick=${encodeURIComponent(trimmed)}&network=${network}`
        );

        if (!res.ok) {
          const json = await res.json();
          toast.error(
            "Erro na busca",
            json.error ?? "Não foi possível buscar o nick."
          );
          return;
        }

        const json = await res.json();
        setSearchResult(json.data);
        setNickId(json.nickId ?? null);
        setNlqAnswer(null);
      } catch {
        toast.error(
          "Erro",
          "Falha na busca. Verifique as credenciais SharkScope."
        );
      }
    });
  }, [nick, network, startTransition]);

  const handleNlq = useCallback(() => {
    if (!nickId || !nlqQuestion.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/sharkscope/nlq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerNickId: nickId,
          question: nlqQuestion.trim(),
          timezone: SHARKSCOPE_NLQ_TIMEZONE,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Erro NLQ", json.error ?? "Não foi possível consultar.");
        return;
      }
      setNlqAnswer(json.data);
    });
  }, [nickId, nlqQuestion, startTransition]);

  const handleSave = useCallback(() => {
    if (!searchResult || !nick.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/sharkscope/scouting-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nick: nick.trim(),
          network,
          rawData: searchResult,
          nlqAnswer,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Erro", json.error ?? "Não foi possível salvar.");
        return;
      }
      setSaved((prev) => [json.analysis as ScoutingAnalysisRow, ...prev]);
      toast.success(
        "Análise salva",
        `Scouting de ${nick.trim()} registrado com sucesso.`
      );
    });
  }, [nick, network, nlqAnswer, notes, searchResult, startTransition]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((cur) => (cur === id ? null : id));
  }, []);

  const removeSaved = useCallback(
    (id: string) => {
      startTransition(async () => {
        const res = await fetch(`/api/sharkscope/scouting-delete?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          toast.error("Erro", "Não foi possível excluir.");
          return;
        }
        setSaved((prev) => prev.filter((a) => a.id !== id));
      });
    },
    [startTransition]
  );

  return {
    nick,
    setNick,
    network,
    setNetwork,
    searchResult,
    nickId,
    nlqQuestion,
    setNlqQuestion,
    nlqAnswer,
    notes,
    setNotes,
    saved,
    expandedId,
    isPending,
    searchStats,
    handleSearch,
    handleNlq,
    handleSave,
    toggleExpanded,
    removeSaved,
  };
}
