import { prisma } from "@/lib/prisma";
import { getGradesForSession, getGradeIdsAndNamesForSession } from "@/lib/queries/db/grade";
import { getPlayersForSession } from "@/lib/queries/db/player";
import { ABI_ALVO_TARGET_NAME } from "@/lib/constants";
import { buildAbiByPlayer, isAbiAlvoTargetName, toTableRows } from "@/lib/utils";
import { SHARKSCOPE_STATS_FILTER_10D } from "@/lib/constants/sharkscope-type-filters";
import { extractStat, extractRoiTenDayForPlayerTable } from "@/lib/sharkscope-parse";
import { PlayersTablePayload, AppSession } from "@/lib/types";
import { UserRole } from "@prisma/client";

/** Coaches com conta de login ativa. */
export async function getCoachesWithActiveLogin() {
  return prisma.coach.findMany({
    where: { authAccount: { isNot: null } },
    orderBy: { name: "asc" },
  });
}

export async function setPlayerMainGrade(
  playerId: string,
  gradeProfileId: string | null
): Promise<void> {
  const active = await prisma.playerGradeAssignment.findFirst({
    where: { playerId, gradeType: "MAIN", isActive: true },
  });

  const none =
    gradeProfileId == null || gradeProfileId === "" || gradeProfileId === "none";

  if (none) {
    if (active) {
      await prisma.playerGradeAssignment.update({
        where: { id: active.id },
        data: { isActive: false, removedAt: new Date() },
      });
    }
    return;
  }

  const grade = await prisma.gradeProfile.findUnique({
    where: { id: gradeProfileId },
    select: { id: true },
  });
  if (!grade) throw new Error("GRADE_NOT_FOUND");

  if (active) {
    if (active.gradeId === gradeProfileId) return;
    await prisma.playerGradeAssignment.update({
      where: { id: active.id },
      data: { gradeId: gradeProfileId },
    });
    return;
  }

  const inactive = await prisma.playerGradeAssignment.findFirst({
    where: { playerId, gradeType: "MAIN", isActive: false },
  });

  if (inactive) {
    await prisma.playerGradeAssignment.update({
      where: { id: inactive.id },
      data: {
        isActive: true,
        removedAt: null,
        gradeId: gradeProfileId,
        assignedAt: new Date(),
      },
    });
    return;
  }

  await prisma.playerGradeAssignment.create({
    data: {
      playerId,
      gradeId: gradeProfileId,
      gradeType: "MAIN",
      isActive: true,
      notes: "Grade principal definida no cadastro do jogador.",
    },
  });
}

export async function syncPlayerAbiAlvoTarget(
  playerId: string,
  value: number | null,
  unit: string | null
): Promise<void> {
  const activeAbis = (
    await prisma.playerTarget.findMany({
      where: { playerId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
  ).filter((t) => isAbiAlvoTargetName(t.name));

  if (value == null) {
    if (activeAbis.length === 0) return;
    await prisma.playerTarget.updateMany({
      where: { id: { in: activeAbis.map((r) => r.id) } },
      data: { isActive: false },
    });
    return;
  }

  const primary = activeAbis[0];
  if (primary) {
    await prisma.playerTarget.update({
      where: { id: primary.id },
      data: {
        name: ABI_ALVO_TARGET_NAME,
        category: "performance",
        targetType: "NUMERIC",
        numericValue: value,
        unit: unit ?? null,
        numericCurrent:
          primary.numericCurrent != null ? primary.numericCurrent : value,
      },
    });
    const extraIds = activeAbis.slice(1).map((r) => r.id);
    if (extraIds.length > 0) {
      await prisma.playerTarget.updateMany({
        where: { id: { in: extraIds } },
        data: { isActive: false },
      });
    }
    return;
  }

  await prisma.playerTarget.create({
    data: {
      playerId,
      name: ABI_ALVO_TARGET_NAME,
      category: "performance",
      targetType: "NUMERIC",
      numericValue: value,
      numericCurrent: value,
      unit: unit ?? null,
      status: "ATTENTION",
      isActive: true,
    },
  });
}

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
      (b.playerNick.network === "PlayerGroup" ? 0 : 1)
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
          where: { id: session.coachId, authAccount: { isNot: null } },
          orderBy: { name: "asc" },
        })
      : getCoachesWithActiveLogin(),
    getGradeIdsAndNamesForSession(session),
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
    const [nickCaches10d, groupNotFoundAlerts] = await Promise.all([
      prisma.sharkScopeCache.findMany({
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
      }),
      prisma.alertLog.findMany({
        where: {
          playerId: { in: playerIds },
          alertType: "group_not_found",
          acknowledged: false,
        },
        select: { playerId: true },
        distinct: ["playerId"],
      }),
    ]);
    const groupNotFoundSet = new Set(groupNotFoundAlerts.map((a) => a.playerId));

    const by10 = groupCachesByPlayerId(
      nickCaches10d.map((c) => ({
        rawData: c.rawData,
        playerNick: c.playerNick,
      }))
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

export * from "./cached-by-id";
