"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import {
  SHARKSCOPE_SCOUTING_LS_EXPANDED,
  SHARKSCOPE_SCOUTING_LS_NETWORK,
  SHARKSCOPE_SCOUTING_LS_NICK,
  SHARKSCOPE_SCOUTING_LS_NLQ,
  SHARKSCOPE_SCOUTING_LS_NOTES,
} from "@/lib/constants/sharkscope/scouting/sharkscope-scouting-page";
import { SHARKSCOPE_NLQ_TIMEZONE } from "@/lib/constants";
import type { PokerNetworkKey, PokerNetworkOption, ScoutingAnalysisRow } from "@/lib/types";
import { parseScoutingSearchPayload } from "@/lib/utils";

const MAX_NICK_LS = 120;
const MAX_NOTES_LS = 8000;
const MAX_NLQ_LS = 500;

function clampStr(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max);
}

export function useScoutingPageClient(
  networkOptions: PokerNetworkOption[],
  initialSaved: ScoutingAnalysisRow[]
) {
  const allowedNetworks = useMemo(
    () => new Set(networkOptions.map((o) => o.value as PokerNetworkKey)),
    [networkOptions]
  );

  const defaultNetwork = (networkOptions[0]?.value as PokerNetworkKey) ?? "gg";

  const [nick, setNickState] = useState("");
  const [network, setNetworkState] = useState<PokerNetworkKey>(defaultNetwork);
  const [searchResult, setSearchResult] = useState<Record<string, unknown> | null>(null);
  const [nickId, setNickId] = useState<string | null>(null);
  const [nlqQuestion, setNlqQuestionState] = useState("");
  const [nlqAnswer, setNlqAnswer] = useState<Record<string, unknown> | null>(null);
  const [notes, setNotesState] = useState("");
  const [saved, setSaved] = useState<ScoutingAnalysisRow[]>(initialSaved);
  const [expandedId, setExpandedIdState] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [storageHydrated, setStorageHydrated] = useState(false);

  useLayoutEffect(() => {
    const allowed = new Set(networkOptions.map((o) => o.value as PokerNetworkKey));
    const savedIds = new Set(initialSaved.map((a) => a.id));
    try {
      const n = localStorage.getItem(SHARKSCOPE_SCOUTING_LS_NICK);
      if (n) setNickState(clampStr(n, MAX_NICK_LS));
      const net = localStorage.getItem(SHARKSCOPE_SCOUTING_LS_NETWORK);
      if (net && allowed.has(net as PokerNetworkKey)) {
        setNetworkState(net as PokerNetworkKey);
      }
      const no = localStorage.getItem(SHARKSCOPE_SCOUTING_LS_NOTES);
      if (no) setNotesState(clampStr(no, MAX_NOTES_LS));
      const nlq = localStorage.getItem(SHARKSCOPE_SCOUTING_LS_NLQ);
      if (nlq) setNlqQuestionState(clampStr(nlq, MAX_NLQ_LS));
      const ex = localStorage.getItem(SHARKSCOPE_SCOUTING_LS_EXPANDED);
      if (ex && savedIds.has(ex)) setExpandedIdState(ex);
    } catch {
      /* ignore */
    } finally {
      setStorageHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from LS; use first server payload
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_SCOUTING_LS_NICK, nick);
    } catch {
      /* ignore */
    }
  }, [nick, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_SCOUTING_LS_NETWORK, network);
    } catch {
      /* ignore */
    }
  }, [network, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_SCOUTING_LS_NOTES, notes);
    } catch {
      /* ignore */
    }
  }, [notes, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_SCOUTING_LS_NLQ, nlqQuestion);
    } catch {
      /* ignore */
    }
  }, [nlqQuestion, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      if (expandedId) localStorage.setItem(SHARKSCOPE_SCOUTING_LS_EXPANDED, expandedId);
      else localStorage.removeItem(SHARKSCOPE_SCOUTING_LS_EXPANDED);
    } catch {
      /* ignore */
    }
  }, [expandedId, storageHydrated]);

  useEffect(() => {
    const ids = new Set(saved.map((a) => a.id));
    setExpandedIdState((cur) => (cur && ids.has(cur) ? cur : null));
  }, [saved]);

  const setNick = useCallback((v: string) => {
    setNickState(v);
  }, []);

  const setNetwork = useCallback(
    (v: PokerNetworkKey) => {
      if (allowedNetworks.has(v)) setNetworkState(v);
    },
    [allowedNetworks]
  );

  const setNlqQuestion = useCallback((v: string) => {
    setNlqQuestionState(v);
  }, []);

  const setNotes = useCallback((v: string) => {
    setNotesState(v);
  }, []);

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
    setExpandedIdState((cur) => (cur === id ? null : id));
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
