import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { STAFF_WRITE_ROLES } from "@/lib/auth/rbac";
import { getPlayersForSession } from "@/lib/data/queries";
import { prisma } from "@/lib/prisma";
import { NewPlayerModal } from "@/components/new-player-modal";
import {
  PlayersTableClient,
  type PlayerTableRow,
} from "./players-table-client";

const NONE = "__none__";

function toTableRows(
  players: Awaited<ReturnType<typeof getPlayersForSession>>
): PlayerTableRow[] {
  return players.map((player) => {
    const mainGrade = player.gradeAssignments[0]?.gradeProfile;
    return {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      coachKey: player.coachId ?? NONE,
      coachLabel: player.coach?.name ?? "Sem Coach",
      gradeKey: mainGrade?.id ?? NONE,
      gradeLabel: mainGrade?.name ?? "Não atribuída",
      status: player.status,
    };
  });
}

export default async function PlayersPage() {
  const session = await requireSession();
  const [players, coaches] = await Promise.all([
    getPlayersForSession(session),
    session.role === "COACH" && session.coachId
      ? prisma.coach.findMany({
          where: { id: session.coachId },
          orderBy: { name: "asc" },
        })
      : prisma.coach.findMany({ orderBy: { name: "asc" } }),
  ]);
  const canCreate = STAFF_WRITE_ROLES.includes(session.role);
  const rows = toTableRows(players);

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
        {canCreate ? <NewPlayerModal coaches={coaches} /> : null}
      </div>

      <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
              Nenhum jogador cadastrado ainda.
            </div>
          ) : (
            <PlayersTableClient rows={rows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
