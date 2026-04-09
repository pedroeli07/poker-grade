import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getOrFetchSharkScope(
  playerNickId: string,
  dataType: string,
  filterKey: string,
  fetchFn: () => Promise<unknown>,
  ttlHours = 24
): Promise<unknown> {
  const cached = await prisma.sharkScopeCache.findUnique({
    where: {
      playerNickId_dataType_filterKey: { playerNickId, dataType, filterKey },
    },
  });

  if (cached && cached.expiresAt > new Date()) {
    return cached.rawData;
  }

  const data = await fetchFn();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  await prisma.sharkScopeCache.upsert({
    where: {
      playerNickId_dataType_filterKey: { playerNickId, dataType, filterKey },
    },
    update: {
      rawData: data as Prisma.InputJsonValue,
      fetchedAt: new Date(),
      expiresAt,
    },
    create: {
      playerNickId,
      dataType,
      filterKey,
      rawData: data as Prisma.InputJsonValue,
      expiresAt,
    },
  });

  return data;
}
