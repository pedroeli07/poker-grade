import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth/session";
import { getCoachesWithActiveLogin } from "@/lib/data/coaches";
import { getGradesForSession, getPlayersForSession } from "@/lib/data/queries";
import { buildAbiByPlayer, toTableRows } from "@/lib/utils";
import { extractStat } from "@/lib/sharkscope-parse";
import type { PlayersTablePayload } from "@/lib/types";

export async function getPlayersTablePayloadForSession(
  session: AppSession
): Promise<PlayersTablePayload> {
  const [players, coaches, gradeProfiles] = await Promise.all([
    getPlayersForSession(session),
    session.role === "COACH" && session.coachId
      ? prisma.coach.findMany({
          where: {
            id: session.coachId,
            authAccount: { isNot: null },
          },
          orderBy: { name: "asc" },
        })
      : getCoachesWithActiveLogin(),
    getGradesForSession(session),
  ]);

  const grades = gradeProfiles.map((g) => ({ id: g.id, name: g.name }));
  const playerIds = players.map((p) => p.id);
  const abiTargets =
    playerIds.length === 0
      ? []
      : await prisma.playerTarget.findMany({
          where: {
            playerId: { in: playerIds },
            isActive: true,
            targetType: "NUMERIC",
            numericValue: { not: null },
          },
          select: {
            playerId: true,
            name: true,
            numericValue: true,
            unit: true,
          },
          orderBy: [{ playerId: "asc" }, { name: "asc" }],
        });

  const abiByPlayer = buildAbiByPlayer(abiTargets);
  const allowCoachSelect =
    session.role === "ADMIN" || session.role === "MANAGER";
  const rows = toTableRows(players, abiByPlayer);

  // Enriquecer com ROI 10d do cache SharkScope (sem chamada à API)
  if (rows.length > 0) {
    const nickCaches = await prisma.sharkScopeCache.findMany({
      where: {
        dataType: "stats_10d",
        expiresAt: { gt: new Date() },
        playerNick: {
          playerId: { in: rows.map((r) => r.id) },
          isActive: true,
        },
      },
      select: { rawData: true, playerNick: { select: { playerId: true } } },
    });

    const statsMap = new Map<string, { roi: number; fp: number | null; ft: number | null }>();
    for (const cache of nickCaches) {
      const playerId = cache.playerNick.playerId;
      if (statsMap.has(playerId)) continue; // simplificação
      
      const roi = extractStat(cache.rawData, "AvROI");
      const fp = extractStat(cache.rawData, "EarlyFinish");
      const ft = extractStat(cache.rawData, "LateFinish");
      
      if (roi !== null) {
        statsMap.set(playerId, { roi, fp, ft });
      }
    }

    for (const row of rows) {
      const stats = statsMap.get(row.id);
      if (stats) {
        row.roiTenDay = stats.roi;
        row.fpTenDay = stats.fp;
        row.ftTenDay = stats.ft;
      }
    }
  }

  return {
    rows,
    coaches: coaches.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
    })),
    grades,
    allowCoachSelect,
  };
}
