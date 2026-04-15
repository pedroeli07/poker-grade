import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth/session";
import { getCoachesWithActiveLogin } from "@/lib/data/coaches";
import { getGradesForSession, getPlayersForSession } from "@/lib/queries/db";
import { buildAbiByPlayer, toTableRows } from "@/lib/utils";
import { SHARKSCOPE_STATS_FILTER_10D } from "@/lib/constants/sharkscope-type-filters";
import { extractStat, extractRoiTenDayForPlayerTable } from "@/lib/sharkscope-parse";
import type { PlayersTablePayload } from "@/lib/types";
import { UserRole } from "@prisma/client";

type NickCacheRow = {
  rawData: unknown;
  playerNick: { playerId: string; network: string };
};

function pickRoiFpFtFromNickCaches(caches: NickCacheRow[]): {
  roi: number | null;
  fp: number | null;
  ft: number | null;
} {
  const sorted = [...caches].sort(
    (a, b) =>
      (a.playerNick.network === "PlayerGroup" ? 0 : 1) -
      (b.playerNick.network === "PlayerGroup" ? 0 : 1),
  );
  let roi: number | null = null;
  let fp: number | null = null;
  let ft: number | null = null;
  for (const cache of sorted) {
    roi = extractRoiTenDayForPlayerTable(cache.rawData);
    fp = extractStat(cache.rawData, "EarlyFinish");
    ft = extractStat(cache.rawData, "LateFinish");
    if (roi !== null || fp !== null || ft !== null) break;
  }
  return { roi, fp, ft };
}

function groupCachesByPlayerId(rows: NickCacheRow[]): Map<string, NickCacheRow[]> {
  const m = new Map<string, NickCacheRow[]>();
  for (const c of rows) {
    const pid = c.playerNick.playerId;
    if (!m.has(pid)) m.set(pid, []);
    m.get(pid)!.push(c);
  }
  return m;
}

export async function getPlayersTablePayloadForSession(
  session: AppSession
): Promise<PlayersTablePayload> {
  const [players, coaches, gradeProfiles] = await Promise.all([
    getPlayersForSession(session),
    session.role === UserRole.COACH && session.coachId
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
    session.role === UserRole.ADMIN || session.role === UserRole.MANAGER;
  const rows = toTableRows(players, abiByPlayer);

  if (rows.length > 0) {
    // Só stats_10d (Date:10D); sem fallback 30d — rótulos da tabela são explicitamente 10d.
    const nickCaches10d = await prisma.sharkScopeCache.findMany({
      where: {
        dataType: "stats_10d",
        filterKey: SHARKSCOPE_STATS_FILTER_10D,
        expiresAt: { gt: new Date() },
        playerNick: {
          playerId: { in: playerIds },
          isActive: true,
        },
      },
      select: { rawData: true, playerNick: { select: { playerId: true, network: true } } },
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

    const by10 = groupCachesByPlayerId(
      nickCaches10d.map((c) => ({
        rawData: c.rawData,
        playerNick: c.playerNick,
      })),
    );

    const statsMap = new Map<string, { roi: number | null; fp: number | null; ft: number | null }>();
    for (const playerId of playerIds) {
      statsMap.set(playerId, pickRoiFpFtFromNickCaches(by10.get(playerId) ?? []));
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
