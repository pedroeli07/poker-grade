import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth/session";
import { getCoachesWithActiveLogin } from "@/lib/data/coaches";
import { getGradesForSession, getPlayersForSession } from "@/lib/data/queries";
import { buildAbiByPlayer, toTableRows } from "@/lib/utils";
import type { PlayerTableRow } from "@/lib/types/player-table-row";

export type PlayersTablePayload = {
  rows: PlayerTableRow[];
  coaches: { id: string; name: string; role: string }[];
  grades: { id: string; name: string }[];
  allowCoachSelect: boolean;
};

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
