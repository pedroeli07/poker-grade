import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth/session";
import { getCoachesWithActiveLogin } from "@/lib/data/coaches";
import { getGradesForSession, getPlayersForSession } from "@/lib/queries/db";
import { buildAbiByPlayer, toTableRows } from "@/lib/utils";
import { extractStat, extractRoiTenDayForPlayerTable } from "@/lib/sharkscope-parse";
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

  if (rows.length > 0) {
    // Cache stats_10d: TotalROI, EarlyFinish e LateFinish (janela Date:10D — alinhado aos rótulos da tabela)
    const nickCaches10d = await prisma.sharkScopeCache.findMany({
      where: {
        dataType: "stats_10d",
        expiresAt: { gt: new Date() },
        playerNick: {
          playerId: { in: playerIds },
          isActive: true,
        },
      },
      select: { rawData: true, playerNick: { select: { playerId: true } } },
    });

    // Buscar jogadores com alerta group_not_found ativo (não reconhecido pelo SharkScope)
    const groupNotFoundAlerts = await prisma.alertLog.findMany({
      where: {
        playerId: { in: playerIds },
        alertType: "group_not_found",
        acknowledged: false,
      },
      select: { playerId: true },
      distinct: ["playerId"],
    });
    const groupNotFoundSet = new Set(groupNotFoundAlerts.map((a) => a.playerId));

    const statsMap = new Map<string, { roi: number | null; fp: number | null; ft: number | null }>();
    for (const cache of nickCaches10d) {
      const playerId = cache.playerNick.playerId;
      if (statsMap.has(playerId)) continue;
      const roi = extractRoiTenDayForPlayerTable(cache.rawData);
      const fp = extractStat(cache.rawData, "EarlyFinish");
      const ft = extractStat(cache.rawData, "LateFinish");
      statsMap.set(playerId, { roi, fp, ft });
    }

    for (const row of rows) {
      const stats = statsMap.get(row.id);
      if (stats) {
        row.roiTenDay = stats.roi;
        row.fpTenDay = stats.fp;
        row.ftTenDay = stats.ft;
      }
      // Flag de grupo não encontrado no SharkScope
      if (groupNotFoundSet.has(row.id)) {
        row.sharkGroupNotFound = true;
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
