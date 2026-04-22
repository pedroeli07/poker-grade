import { POKER_NETWORKS } from "@/lib/constants/poker-networks";
import type { NetworkStat } from "@/lib/types/sharkScopeTypes";
import {
  emptyNetworkAggBucket,
  pctFromRatio,
  roiFromAgg,
  type NetworkAggBucket,
} from "@/lib/sharkscope/completed-tournaments-aggregate";

export type SiteChartYMetric = "roi" | "profit" | "itm" | "earlyFinish" | "lateFinish" | "entries";

export const SITE_CHART_Y_METRICS: { id: SiteChartYMetric; label: string; shortYLabel: string }[] = [
  { id: "roi", label: "ROI total (%)", shortYLabel: "ROI Total %" },
  { id: "profit", label: "Lucro (USD)", shortYLabel: "Lucro $" },
  { id: "itm", label: "ITM % ", shortYLabel: "ITM %" },
  { id: "earlyFinish", label: "Finalização precoce % ", shortYLabel: "FP %" },
  { id: "lateFinish", label: "Finalização tardia % ", shortYLabel: "FT %" },
  {
    id: "entries",
    label: "Inscrições",
    shortYLabel: "Inscr.",
  },
];

function networkLabel(network: string): string {
  return POKER_NETWORKS[network as keyof typeof POKER_NETWORKS]?.label ?? network;
}

function statRowToBucket(r: NetworkStat): NetworkAggBucket {
  const entries = r.entries ?? 0;
  let stake = r.stake ?? 0;
  if (stake <= 0 && r.profit != null && r.roi != null && r.roi !== 0) {
    stake = (100 * r.profit) / r.roi;
  }
  return {
    profit: r.profit ?? 0,
    stake,
    entries,
    itmHits: r.itm != null && entries > 0 ? (r.itm * entries) / 100 : 0,
    earlyHits: r.earlyFinish != null && entries > 0 ? (r.earlyFinish * entries) / 100 : 0,
    lateHits: r.lateFinish != null && entries > 0 ? (r.lateFinish * entries) / 100 : 0,
  };
}

type MergeAgg = NetworkAggBucket & {
  abilityNum: number;
  abilityDen: number;
  avStakeNum: number;
  avStakeDen: number;
};

function emptyMergeAgg(): MergeAgg {
  return {
    ...emptyNetworkAggBucket(),
    abilityNum: 0,
    abilityDen: 0,
    avStakeNum: 0,
    avStakeDen: 0,
  };
}

/** ABI por linha: API ou stake/inscrições (breakdown por torneios). */
function impliedAvStakePerRow(r: NetworkStat): number | null {
  const entries = r.entries ?? 0;
  if (entries <= 0) return null;
  if (r.avStake != null) return r.avStake;
  const st = r.stake ?? 0;
  if (st > 0) return st / entries;
  return null;
}

function statRowToMergeAgg(r: NetworkStat): MergeAgg {
  const b = statRowToBucket(r);
  const entries = r.entries ?? 0;
  const abilityNum = r.ability != null && entries > 0 ? r.ability * entries : 0;
  const abilityDen = r.ability != null && entries > 0 ? entries : 0;
  const av = impliedAvStakePerRow(r);
  const avStakeNum = av != null && entries > 0 ? av * entries : 0;
  const avStakeDen = av != null && entries > 0 ? entries : 0;
  return {
    ...b,
    abilityNum,
    abilityDen,
    avStakeNum,
    avStakeDen,
  };
}

function mergeMergeAggs(a: MergeAgg, b: MergeAgg): MergeAgg {
  return {
    profit: a.profit + b.profit,
    stake: a.stake + b.stake,
    entries: a.entries + b.entries,
    itmHits: a.itmHits + b.itmHits,
    earlyHits: a.earlyHits + b.earlyHits,
    lateHits: a.lateHits + b.lateHits,
    abilityNum: a.abilityNum + b.abilityNum,
    abilityDen: a.abilityDen + b.abilityDen,
    avStakeNum: a.avStakeNum + b.avStakeNum,
    avStakeDen: a.avStakeDen + b.avStakeDen,
  };
}

function mergeBucketsToNetworkStats(map: Map<string, MergeAgg>): NetworkStat[] {
  return [...map.entries()]
    .map(([network, b]) => {
      const roi = roiFromAgg(b);
      const ability = b.abilityDen > 0 ? b.abilityNum / b.abilityDen : null;
      const avStake =
        b.avStakeDen > 0
          ? b.avStakeNum / b.avStakeDen
          : b.entries > 0
            ? b.stake / b.entries
            : null;
      return {
        network,
        label: networkLabel(network),
        roi,
        roiWeighted: roi,
        profit: b.profit,
        entries: b.entries,
        stake: b.stake,
        itm: pctFromRatio(b.itmHits, b.entries),
        earlyFinish: pctFromRatio(b.earlyHits, b.entries),
        lateFinish: pctFromRatio(b.lateHits, b.entries),
        ability,
        avStake,
      };
    })
    .filter((s) => s.roi !== null || s.profit !== null || (s.entries !== null && s.entries > 0))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

/** Agrega linhas de vários jogadores (mesma rede soma buckets). */
export function mergeNetworkStatsForSelection(rowsList: NetworkStat[][]): NetworkStat[] {
  const acc = new Map<string, MergeAgg>();
  for (const rows of rowsList) {
    for (const r of rows) {
      const b = statRowToMergeAgg(r);
      const cur = acc.get(r.network) ?? emptyMergeAgg();
      acc.set(r.network, mergeMergeAggs(cur, b));
    }
  }
  return mergeBucketsToNetworkStats(acc);
}

/** Linha com métricas para o gráfico Por site / Por tier (NetworkStat, TierStat, …). */
export type SiteChartMetricRow = {
  roi?: number | null;
  roiWeighted?: number | null;
  profit?: number | null;
  entries?: number | null;
  itm?: number | null;
  earlyFinish?: number | null;
  lateFinish?: number | null;
};

export function siteChartYValue(row: SiteChartMetricRow, metric: SiteChartYMetric): number | null {
  switch (metric) {
    case "roi":
      return row.roi ?? row.roiWeighted ?? null;
    case "profit":
      return row.profit ?? null;
    case "itm":
      return row.itm ?? null;
    case "earlyFinish":
      return row.earlyFinish ?? null;
    case "lateFinish":
      return row.lateFinish ?? null;
    case "entries":
      return row.entries ?? null;
    default:
      return null;
  }
}
