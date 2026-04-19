import { prisma } from "@/lib/prisma";
import { getGradesForSession, getGradeIdsAndNamesForSession } from "@/lib/queries/db/grade";
import { getPlayersForSession } from "@/lib/queries/db/player";
import { ABI_ALVO_TARGET_NAME } from "@/lib/constants";
import { buildAbiByPlayer, isAbiAlvoTargetName, toTableRows } from "@/lib/utils";
import { SHARKSCOPE_STATS_FILTER_10D } from "@/lib/constants/sharkscope-type-filters";
import { extractStat, extractRoiTenDayForPlayerTable } from "@/lib/sharkscope-parse";
import { notifyLimitChanged } from "@/lib/queries/db/notification";
import { PlayersTablePayload, AppSession } from "@/lib/types";
import { GradeType, TargetStatus, TargetType, UserRole } from "@prisma/client";
import { GradeChangeAction, GradeChangeActionType } from "@/lib/types/history";

/** Coaches com conta de login ativa. */
export async function getCoachesWithActiveLogin() {
  return prisma.coach.findMany({
    where: { authAccount: { isNot: null } },
    orderBy: { name: "asc" },
  });
}

/**
 * Extrai o nível numérico de um nome de grade.
 * Suporta padrões como "(+1)", "(-2)", "(0)", "+1", "-1", etc.
 * Retorna null se não encontrar um padrão reconhecível.
 */
function parseGradeLevel(name: string): number | null {
  // Procura padrões como (+1), (-2), (0) no nome
  const parenMatch = name.match(/\(([+-]?\d+)\)/);
  if (parenMatch) return parseInt(parenMatch[1], 10);

  // Procura sufixo +N ou -N no final do nome
  const suffixMatch = name.match(/([+-]\d+)\s*$/);
  if (suffixMatch) return parseInt(suffixMatch[1], 10);

  return null;
}

/**
 * Determina a ação de mudança de grade comparando os nomes da grade anterior e nova.
 * Usa o nível numérico extraído dos nomes (ex: "(+1)" > "(0)" = UPGRADE).
 * Quando não consegue extrair nível de ambas, retorna MAINTAIN.
 */
function determineGradeAction(
  fromName: string,
  toName: string
): GradeChangeActionType {
  const fromLevel = parseGradeLevel(fromName);
  const toLevel = parseGradeLevel(toName);

  if (fromLevel !== null && toLevel !== null) {
    if (toLevel > fromLevel) return GradeChangeAction.UPGRADE;
    if (toLevel < fromLevel) return GradeChangeAction.DOWNGRADE;
    return GradeChangeAction.MAINTAIN;
  } 

  // Se os nomes são diferentes mas não têm nível, registra como MAINTAIN
  return GradeChangeAction.MAINTAIN;
}

export type SetGradeContext = {
  performedBy?: string;
  reason?: string;
};

export async function setPlayerMainGrade(
  playerId: string,
  gradeProfileId: string | null,
  context?: SetGradeContext
): Promise<void> {
  const active = await prisma.playerGradeAssignment.findFirst({
    where: { playerId, gradeType: GradeType.MAIN, isActive: true },
    include: { gradeProfile: { select: { name: true } } },
  });

  const none =
    gradeProfileId == null || gradeProfileId === "" || gradeProfileId === "none";

  if (none) {
    if (active) {
      // Removendo grade — registra como DOWNGRADE com "Sem grade" como destino
      await prisma.playerGradeAssignment.update({
        where: { id: active.id },
        data: { isActive: false, removedAt: new Date() },
      });

      if (context?.performedBy) {
        const fromName = active.gradeProfile.name;
        await prisma.limitChangeHistory.create({
          data: {
            playerId,
            action: GradeChangeAction.DOWNGRADE,
            fromGrade: fromName,
            toGrade: "Sem grade",
            reason: context.reason ?? "Grade removida",
            decidedBy: context.performedBy,
          },
        });
        void notifyLimitChanged(playerId, GradeChangeAction.DOWNGRADE, fromName, "Sem grade");
      }
    }
    return;
  }

  const grade = await prisma.gradeProfile.findUnique({
    where: { id: gradeProfileId },
    select: { id: true, name: true },
  });
  if (!grade) throw new Error("Grade não encontrada");

  if (active) {
    if (active.gradeId === gradeProfileId) return; // Mesma grade, nada a fazer

    const fromName = active.gradeProfile.name;
    const toName = grade.name;
    const action = determineGradeAction(fromName, toName);

    await prisma.playerGradeAssignment.update({
      where: { id: active.id },
      data: { gradeId: gradeProfileId },
    });

    // Registrar histórico de mudança de grade
    if (context?.performedBy) {
      await prisma.limitChangeHistory.create({
        data: {
          playerId,
          action,
          fromGrade: fromName,
          toGrade: toName,
          reason: context.reason ?? null,
          decidedBy: context.performedBy,
        },
      });
      void notifyLimitChanged(playerId, action, fromName, toName);
    }
    return;
  }

  const inactive = await prisma.playerGradeAssignment.findFirst({
    where: { playerId, gradeType: GradeType.MAIN, isActive: false },
    include: { gradeProfile: { select: { name: true } } },
  });

  if (inactive) {
    const fromName = inactive.gradeProfile.name;
    const toName = grade.name;
    const action = fromName !== toName ? determineGradeAction(fromName, toName) : GradeChangeAction.MAINTAIN;

    await prisma.playerGradeAssignment.update({
      where: { id: inactive.id },
      data: {
        isActive: true,
        removedAt: null,
        gradeId: gradeProfileId,
        assignedAt: new Date(),
      },
    });

    // Registrar se a grade mudou
    if (context?.performedBy && fromName !== toName) {
      await prisma.limitChangeHistory.create({
        data: {
          playerId,
          action,
          fromGrade: fromName,
          toGrade: toName,
          reason: context.reason ?? null,
          decidedBy: context.performedBy,
        },
      });
      void notifyLimitChanged(playerId, action, fromName, toName);
    }
    return;
  }

  // Primeira atribuição de grade — registrar como UPGRADE (promoção inicial)
  await prisma.playerGradeAssignment.create({
    data: {
      playerId,
      gradeId: gradeProfileId,
      gradeType: GradeType.MAIN,
      isActive: true,
      notes: "Grade principal definida no cadastro do jogador.",
    },
  });

  if (context?.performedBy) {
    await prisma.limitChangeHistory.create({
      data: {
        playerId,
        action: GradeChangeAction.UPGRADE,
        fromGrade: null,
        toGrade: grade.name,
        reason: context.reason ?? "Primeira grade atribuída",
        decidedBy: context.performedBy,
      },
    });
    void notifyLimitChanged(playerId, GradeChangeAction.UPGRADE, "Sem grade", grade.name);
  }
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
        targetType: TargetType.NUMERIC,
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
      targetType: TargetType.NUMERIC,
      numericValue: value,
      numericCurrent: value,
      unit: unit ?? null,
      status: TargetStatus.ATTENTION,
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
            targetType: TargetType.NUMERIC,
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
