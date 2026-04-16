import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { minhaGradePlayerInclude, playerProfileInclude } from "@/lib/constants/player";

/**
 * Deduplica `player.findUnique` por `id` no mesmo request RSC (mesmo include que o perfil).
 */
export const getCachedPlayerWithProfileInclude = cache(async (playerId: string) => {
  return prisma.player.findUnique({
    where: { id: playerId },
    include: playerProfileInclude,
  });
});

/**
 * Deduplica a query da página "Minha grade" (include distinto do perfil).
 */
export const getCachedPlayerWithMinhaGradeInclude = cache(async (playerId: string) => {
  return prisma.player.findUnique({
    where: { id: playerId },
    include: minhaGradePlayerInclude,
  });
});
