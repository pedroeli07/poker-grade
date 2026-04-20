"use client";

import { useRouter } from "next/navigation";
import { memo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AnalyticsAboutCard from "@/components/sharkscope/analytics/analytics-about-card";
import AnalyticsBountyPanel from "@/components/sharkscope/analytics/analytics-bounty-panel";
import AnalyticsDebugPageHeader from "@/components/sharkscope/analytics/analytics-debug-page-header";
import AnalyticsRankingPanel from "@/components/sharkscope/analytics/analytics-ranking-panel";
import AnalyticsSitePanel from "@/components/sharkscope/analytics/analytics-site-panel";
import AnalyticsTabBar from "@/components/sharkscope/analytics/analytics-tab-bar";
import AnalyticsTierPanel from "@/components/sharkscope/analytics/analytics-tier-panel";
import { useAnalyticsPageClient } from "@/hooks/sharkscope/analytics/use-analytics-page-client";
import type { AnalyticsClientProps, AnalyticsDebugPageData } from "@/lib/types";
import { syncAnalyticsDebugSinglePlayerAction, type SyncAnalyticsDebugResult } from "./actions";

const EMPTY_PROPS: AnalyticsClientProps = {
  stats30d: [],
  stats90d: [],
  siteAnalytics30d: { playersWithSiteData: [], byPlayerId: {}, hasPerPlayerBreakdown: false },
  siteAnalytics90d: { playersWithSiteData: [], byPlayerId: {}, hasPerPlayerBreakdown: false },
  ranking30d: [],
  ranking90d: [],
  tierStats30d: [],
  tierStats90d: [],
  typeStats30d: [],
  typeStats90d: [],
  hasData30d: false,
  hasData90d: false,
};

const AnalyticsDebugClient = memo(function AnalyticsDebugClient(data: AnalyticsDebugPageData) {
  const router = useRouter();
  const { players, selectedPlayerId, playerMeta, analyticsProps, listError } = data;
  const [syncResult, setSyncResult] = useState<SyncAnalyticsDebugResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const props = analyticsProps ?? EMPTY_PROPS;
  const {
    period,
    setPeriod,
    activeTab,
    setActiveTab,
    stats,
    siteAnalytics,
    hasData,
    ranking,
    tierStats,
    typeStats,
    hasTypeData,
  } = useAnalyticsPageClient(props);

  function buildUrl(pid: string): string {
    const p = pid.trim();
    return p ? `/admin/sharkscope/analytics-debug?player=${encodeURIComponent(p)}` : "/admin/sharkscope/analytics-debug";
  }

  function handleCarregar() {
    const el = document.getElementById("analytics-debug-player-select") as HTMLSelectElement | null;
    const pid = el?.value?.trim() ?? "";
    router.push(buildUrl(pid));
  }

  function runSync() {
    const el = document.getElementById("analytics-debug-player-select") as HTMLSelectElement | null;
    const pid = el?.value?.trim() ?? "";
    if (!pid) {
      setSyncResult({ success: false, error: "Selecione um jogador." });
      return;
    }
    setSyncResult(null);
    startTransition(async () => {
      const r = await syncAnalyticsDebugSinglePlayerAction(pid);
      setSyncResult(r);
      if (r.success) {
        router.refresh();
        router.push(buildUrl(pid));
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm dark:bg-amber-950/20">
        <p className="font-medium text-amber-950 dark:text-amber-100">Modo debug — um jogador</p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          O botão abaixo usa <code className="text-[11px]">syncMode: analytics_nick</code>: statistics 30d/90d do grupo + por nick×rede, <strong>sem</strong>{" "}
          <code className="text-[11px]">completedTournaments</code> (poucas buscas vs modo <code className="text-[11px]">analytics</code>). Aba Por site lê caches por
          nick. Ranking / TIER / Bounty precisam de sync <code className="text-[11px]">analytics</code> ou <code className="text-[11px]">full</code> noutro momento.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-2">
          <Label htmlFor="analytics-debug-player-select">Jogador (ativo, com playerGroup)</Label>
          <select
            id="analytics-debug-player-select"
            name="player"
            defaultValue={selectedPlayerId ?? ""}
            className="flex h-10 w-full max-w-xl rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.playerGroup})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handleCarregar}>
            Carregar estatísticas (cache)
          </Button>
          <Button
            type="button"
            className="gap-2 bg-blue-500/10 hover:bg-blue-500/20"
            variant="outline"
            onClick={runSync}
            disabled={isPending}
          >
            {isPending ? "Sincronizando…" : "Sincronizar este grupo (analytics_nick)"}
          </Button>
        </div>
        {listError && <p className="text-sm text-destructive">{listError}</p>}
        {syncResult && !syncResult.success && <p className="text-sm text-destructive">{syncResult.error}</p>}
        {syncResult && syncResult.success && (
          <p className="text-xs text-muted-foreground">
            OK — HTTP SharkScope: {syncResult.sharkHttpCalls} | Buscas restantes:{" "}
            {syncResult.remainingSearches ?? "—"} | Processados: {syncResult.processed} | Erros: {syncResult.errors}
          </p>
        )}
      </div>

      {playerMeta && (
        <p className="text-sm text-muted-foreground">
          A mostrar: <strong className="text-foreground">{playerMeta.name}</strong> · Grupo:{" "}
          <code className="text-xs">{playerMeta.playerGroup}</code>
        </p>
      )}

      <AnalyticsDebugPageHeader period={period} setPeriod={setPeriod} />
      <AnalyticsTabBar activeTab={activeTab} setActiveTab={setActiveTab} period={period} />

      {activeTab === "site" && (
        <AnalyticsSitePanel
          key={selectedPlayerId ?? "none"}
          hasData={hasData}
          stats={stats}
          siteAnalytics={siteAnalytics}
          period={period}
          variant="debug"
          sitePanelOptions={
            selectedPlayerId ? { initialSelectedPlayerIds: [selectedPlayerId] } : undefined
          }
        />
      )}

      {activeTab === "ranking" && <AnalyticsRankingPanel ranking={ranking} period={period} />}

      {activeTab === "tier" && <AnalyticsTierPanel period={period} tierStats={tierStats} />}

      {activeTab === "bounty" && (
        <AnalyticsBountyPanel period={period} hasTypeData={hasTypeData} typeStats={typeStats} />
      )}

      <AnalyticsAboutCard />
    </div>
  );
});

AnalyticsDebugClient.displayName = "AnalyticsDebugClient";

export default AnalyticsDebugClient;
