import { POKER_NETWORKS } from "@/lib/constants/poker-networks";
import type { NetworkStat } from "@/lib/types";
import {
  emptyNetworkAggBucket,
  pctFromRatio,
  roiFromAgg,
  type NetworkAggBucket,
} from "@/lib/sharkscope/completed-tournaments-aggregate";

export type SiteChartYMetric = "roi" | "profit" | "itm" | "earlyFinish" | "lateFinish" | "entries";

export const SITE_CHART_Y_METRICS: { id: SiteChartYMetric; label: string; shortYLabel: string }[] = [
  { id: "roi", label: "ROI total (%)", shortYLabel: "ROI %" },
  { id: "profit", label: "Lucro (USD)", shortYLabel: "Lucro $" },
  { id: "itm", label: "ITM % (torneios com prêmio)", shortYLabel: "ITM %" },
  { id: "earlyFinish", label: "Finalização precoce % (heurística)", shortYLabel: "FP %" },
  { id: "lateFinish", label: "Finalização tardia % (heurística)", shortYLabel: "FT %" },
  { id: "entries", label: "Inscrições (volume de torneios)", shortYLabel: "Inscrições" },
];

function networkLabel(network: string): string {
  return POKER_NETWORKS[network as keyof typeof POKER_NETWORKS]?.label ?? network;
}

function statRowToBucket(r: NetworkStat): NetworkAggBucket {
  const entries = r.count ?? 0;
  return {
    profit: r.profit ?? 0,
    stake: r.stake ?? 0,
    entries,
    itmHits: r.itm != null && entries > 0 ? (r.itm * entries) / 100 : 0,
    earlyHits: r.earlyFinish != null && entries > 0 ? (r.earlyFinish * entries) / 100 : 0,
    lateHits: r.lateFinish != null && entries > 0 ? (r.lateFinish * entries) / 100 : 0,
  };
}

function bucketsToNetworkStats(map: Map<string, NetworkAggBucket>): NetworkStat[] {
  return [...map.entries()]
    .map(([network, b]) => {
      const roi = roiFromAgg(b);
      return {
        network,
        label: networkLabel(network),
        roi,
        roiWeighted: roi,
        profit: b.profit,
        count: b.entries,
        stake: b.stake,
        itm: pctFromRatio(b.itmHits, b.entries),
        earlyFinish: pctFromRatio(b.earlyHits, b.entries),
        lateFinish: pctFromRatio(b.lateHits, b.entries),
      };
    })
    .filter((s) => s.roi !== null || s.profit !== null || (s.count !== null && s.count > 0))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

/** Agrega linhas de vários jogadores (mesma rede soma buckets). */
export function mergeNetworkStatsForSelection(rowsList: NetworkStat[][]): NetworkStat[] {
  const acc = new Map<string, NetworkAggBucket>();
  for (const rows of rowsList) {
    for (const r of rows) {
      const b = statRowToBucket(r);
      const cur = acc.get(r.network) ?? emptyNetworkAggBucket();
      acc.set(r.network, {
        profit: cur.profit + b.profit,
        stake: cur.stake + b.stake,
        entries: cur.entries + b.entries,
        itmHits: cur.itmHits + b.itmHits,
        earlyHits: cur.earlyHits + b.earlyHits,
        lateHits: cur.lateHits + b.lateHits,
      });
    }
  }
  return bucketsToNetworkStats(acc);
}

export function siteChartYValue(row: NetworkStat, metric: SiteChartYMetric): number | null {
  switch (metric) {
    case "roi":
      return row.roi ?? row.roiWeighted ?? null;
    case "profit":
      return row.profit;
    case "itm":
      return row.itm ?? null;
    case "earlyFinish":
      return row.earlyFinish ?? null;
    case "lateFinish":
      return row.lateFinish ?? null;
    case "entries":
      return row.count ?? null;
    default:
      return null;
  }
}
