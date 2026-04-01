import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { getCoachesWithActiveLogin } from "@/lib/data/coaches";
import { getGradesForSession, getPlayersForSession } from "@/lib/data/queries";
import { prisma } from "@/lib/prisma";
import { syncOrphanCoachProfiles } from "@/lib/auth/ensure-coach-profile";
import { NewPlayerModal } from "@/components/new-player-modal";
import { toTableRows, buildAbiByPlayer } from "@/lib/utils";
import { canCreate, canEditPlayers } from "@/lib/constants";
import { PlayersTableClient } from "./players-table-client";

export default async function PlayersPage() {
  const session = await requireSession();
  await syncOrphanCoachProfiles();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Jogadores
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o time de jogadores e aloque coaches responsáveis.
          </p>
        </div>
        {canCreate(session) ? (
          <NewPlayerModal coaches={coaches} grades={grades} />
        ) : null}
      </div>

      <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
              Nenhum jogador cadastrado ainda.
            </div>
          ) : (
            <PlayersTableClient
              rows={rows}
              coaches={coaches}
              grades={grades}
              canEditPlayers={canEditPlayers(session)}
              allowCoachSelect={allowCoachSelect}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
