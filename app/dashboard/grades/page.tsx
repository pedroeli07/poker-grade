import { Archive } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { canManageGrades } from "@/lib/auth/rbac";
import { getGradesForSession } from "@/lib/data/queries";
import { prisma } from "@/lib/prisma";
import { NewGradeModal, ImportGradeModal } from "@/components/grade-modals";
import { GradesPageClient } from "./grades-page-client";

function buildAssignedPlayersByGrade(
  assignments: {
    gradeId: string;
    player: { id: string; name: string };
  }[]
) {
  const m = new Map<string, Map<string, { id: string; name: string }>>();
  for (const a of assignments) {
    if (!m.has(a.gradeId)) m.set(a.gradeId, new Map());
    m.get(a.gradeId)!.set(a.player.id, {
      id: a.player.id,
      name: a.player.name,
    });
  }
  const out = new Map<string, { id: string; name: string }[]>();
  for (const [gradeId, pmap] of m) {
    out.set(
      gradeId,
      [...pmap.values()].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR")
      )
    );
  }
  return out;
}

export default async function GradesPage() {
  const session = await requireSession();
  const grades = await getGradesForSession(session);
  const manage = canManageGrades(session);

  const gradeIds = grades.map((g) => g.id);
  const activeAssignments =
    gradeIds.length === 0
      ? []
      : await prisma.playerGradeAssignment.findMany({
          where: { gradeId: { in: gradeIds }, isActive: true },
          select: {
            gradeId: true,
            player: { select: { id: true, name: true } },
          },
        });
  const byGrade = buildAssignedPlayersByGrade(activeAssignments);

  const rows = grades.map((g) => {
    const assignedPlayers = byGrade.get(g.id) ?? [];
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      rulesCount: g._count.rules,
      assignmentsCount: assignedPlayers.length,
      assignedPlayers,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Grades</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os perfis de grades e filtros da Lobbyze.
          </p>
        </div>
        {manage ? (
          <div className="flex gap-2">
            <ImportGradeModal />
            <NewGradeModal />
          </div>
        ) : null}
      </div>

      {grades.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-lg text-muted-foreground">
          <Archive className="h-10 w-10 mx-auto mb-4 opacity-50" />
          <p>Nenhuma grade cadastrada.</p>
          <p className="text-sm">Importe um JSON da Lobbyze para começar.</p>
        </div>
      ) : (
        <GradesPageClient rows={rows} manage={manage} />
      )}
    </div>
  );
}
