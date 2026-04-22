import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import type { ComputeStatsFromRowsResult } from "@/lib/types/sharkscope/aggregate";

export async function saveComputedStats(
  playerNickId: string,
  dataType: string,
  filterKey: string,
  stats: ComputeStatsFromRowsResult,
  forceRefresh: boolean,
  extraStats?: Record<string, number | null>
) {
  await getOrFetchSharkScope(
    playerNickId,
    dataType,
    filterKey,
    async () => buildFakeStatsResponse(stats, extraStats),
    24,
    forceRefresh
  );
}

export function buildFakeStatsResponse(stats: ComputeStatsFromRowsResult, extra?: Record<string, number | null>): unknown {
  const statistics: Record<string, unknown>[] = [];

  const push = (id: string, value: number | null) => {
    if (value !== null) statistics.push({ "@id": id, "#text": String(value) });
  };

  const statMap: [string, number | null][] = [
    ["Count", stats.count],
    ["Entries", stats.entries],
    ["TotalROI", stats.totalRoi],
    ["AvROI", stats.totalRoi],
    ["ITM", stats.itm],
    ["TotalProfit", stats.totalProfit],
    ["Profit", stats.totalProfit],
    ["TotalStake", stats.totalStake],
    ["AvStake", stats.avStake],
    ["FinishesEarly", stats.earlyFinish],
    ["FinishesLate", stats.lateFinish],
    ["Entrants", stats.entries],
  ];

  for (const [id, value] of statMap) push(id, value);
  if (extra) for (const [id, val] of Object.entries(extra)) push(id, val);

  return {
    Response: {
      PlayerResponse: {
        PlayerView: {
          PlayerGroup: { Statistics: { Statistic: statistics } },
        },
      },
      UserInfo: {},
    },
  };
}
