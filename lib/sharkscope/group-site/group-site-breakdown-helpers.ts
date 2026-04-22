import type {
  GroupSiteBreakdownPayloadV3,
  NetworkAggBucket,
} from "@/lib/types/sharkscope/completed-tournaments";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
  SHARKSCOPE_GROUP_SITE_FILTER_KEYS,
} from "@/lib/constants/sharkscope/group-site";

export function mergeSkippedUnknownMaps(
  into: Map<string, number>,
  from: Map<string, number>
) {
  for (const [net, n] of from) {
    into.set(net, (into.get(net) ?? 0) + n);
  }
}

export function mergedPlayerToRecord(
  mergedPlayer: Map<string, Map<string, NetworkAggBucket>>
): Record<string, Record<string, NetworkAggBucket>> {
  const out: Record<string, Record<string, NetworkAggBucket>> = {};
  for (const [pk, inner] of mergedPlayer) {
    out[pk] = Object.fromEntries(inner);
  }
  return out;
}

export async function upsertGroupSiteBreakdown30dCache(
  playerNickId: string,
  payload: GroupSiteBreakdownPayloadV3
): Promise<void> {
  const filterKey30 = SHARKSCOPE_GROUP_SITE_FILTER_KEYS["30d"];
  await prisma.sharkScopeCache.upsert({
    where: {
      playerNickId_dataType_filterKey: {
        playerNickId,
        dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
        filterKey: filterKey30,
      },
    },
    update: {
      rawData: payload as unknown as Prisma.InputJsonValue,
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    },
    create: {
      playerNickId,
      dataType: SHARKSCOPE_GROUP_SITE_BREAKDOWN_30D,
      filterKey: filterKey30,
      rawData: payload as unknown as Prisma.InputJsonValue,
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    },
  });
}
