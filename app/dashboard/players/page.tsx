import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { STAFF_WRITE_ROLES } from "@/lib/auth/rbac";
import { getCoachesWithActiveLogin } from "@/lib/data/coaches";
import { getGradesForSession, getPlayersForSession } from "@/lib/data/queries";
import { prisma } from "@/lib/prisma";
import { syncOrphanCoachProfiles } from "@/lib/auth/ensure-coach-profile";
import { NewPlayerModal } from "@/components/new-player-modal";
import {
  PlayersTableClient,
  type PlayerTableRow,
} from "./players-table-client";

const NONE = "__none__";

function formatAbiAlvo(value: number, unit: string | null): string {
  const u = unit?.trim() ?? "";
  if (u === "$" || u === "€" || u === "¥") return `${u}${value}`;
  if (u) return `${value} ${u}`.trim();
  return String(value);
}

function buildAbiByPlayer(
  targets: Array<{
    playerId: string;
    name: string;
    numericValue: number | null;
    unit: string | null;
  }>
): Map<string, { numericValue: number; unit: string | null }> {
  const map = new Map<string, { numericValue: number; unit: string | null }>();
  for (const t of targets) {
    if (t.numericValue == null) continue;
    if (!/\babi\b/i.test(t.name.trim())) continue;
    if (!map.has(t.playerId)) {
      map.set(t.playerId, { numericValue: t.numericValue, unit: t.unit });
    }
  }
  return map;
}

function toTableRows(
  players: Awaited<ReturnType<typeof getPlayersForSession>>,
  abiByPlayer: Map<string, { numericValue: number; unit: string | null }>
): PlayerTableRow[] {
  return players.map((player) => {
    const mainGrade = player.gradeAssignments[0]?.gradeProfile;
    const abi = abiByPlayer.get(player.id);
    const abiKey = abi ? `v-${abi.numericValue}` : NONE;
    const abiLabel = abi ? formatAbiAlvo(abi.numericValue, abi.unit) : "—";
    return {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      email: player.email ?? null,
      coachKey: player.coachId ?? NONE,
      coachLabel: player.coach?.name ?? "Sem Coach",
      gradeKey: mainGrade?.id ?? NONE,
      gradeLabel: mainGrade?.name ?? "Não atribuída",
      abiKey,
      abiLabel,
      abiNumericValue: abi?.numericValue ?? null,
      abiUnit: abi?.unit ?? null,
      status: player.status,
    };
  });
}

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

  const canCreate = STAFF_WRITE_ROLES.includes(session.role);
  const canEditPlayers = STAFF_WRITE_ROLES.includes(session.role);
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
        {canCreate ? (
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
              canEditPlayers={canEditPlayers}
              allowCoachSelect={allowCoachSelect}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
