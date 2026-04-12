import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getOrFetchSharkScope(
  playerNickId: string,
  dataType: string,
  filterKey: string,
  fetchFn: () => Promise<unknown>,
  ttlHours = 24,
  /** Ignora cache ainda válido e refaz GET na API (ex.: botão “Sincronizar SharkScope”). */
  forceRefresh = false
): Promise<unknown> {
  if (!forceRefresh) {
    const cached = await prisma.sharkScopeCache.findUnique({
      where: {
        playerNickId_dataType_filterKey: { playerNickId, dataType, filterKey },
      },
    });

    if (cached && cached.expiresAt > new Date()) {
      return cached.rawData;
    }
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

/** Copia todas as linhas de cache de um nick para outro (ex.: mesmo Player Group, vários jogadores). */
export async function replicateSharkScopeCachesToPlayerNick(
  fromPlayerNickId: string,
  toPlayerNickId: string
): Promise<void> {
  const rows = await prisma.sharkScopeCache.findMany({
    where: { playerNickId: fromPlayerNickId },
  });
  for (const row of rows) {
    await prisma.sharkScopeCache.upsert({
      where: {
        playerNickId_dataType_filterKey: {
          playerNickId: toPlayerNickId,
          dataType: row.dataType,
          filterKey: row.filterKey,
        },
      },
      update: {
        rawData: row.rawData as Prisma.InputJsonValue,
        fetchedAt: row.fetchedAt,
        expiresAt: row.expiresAt,
      },
      create: {
        playerNickId: toPlayerNickId,
        dataType: row.dataType,
        filterKey: row.filterKey,
        rawData: row.rawData as Prisma.InputJsonValue,
        fetchedAt: row.fetchedAt,
        expiresAt: row.expiresAt,
      },
    });
  }
}
