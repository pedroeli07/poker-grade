import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LobbyzeFilterItem } from "@/lib/types";
import { requireSession } from "@/lib/auth/session";
import { canEditGradeCoachNote, canManageGrades } from "@/lib/auth/rbac";
import { getGradeByIdForSession } from "@/lib/data/queries";
import { GradeCoachNoteSection } from "@/components/grade-coach-note";
import {
  GradeRuleCard,
  type GradeRuleCardRule,
} from "@/components/grade-rule-card";

function parseJson<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toRuleCard(rule: {
  id: string;
  filterName: string;
  lobbyzeFilterId: number | null;
  sites: unknown;
  buyInMin: number | null;
  buyInMax: number | null;
  speed: unknown;
  variant: unknown;
  tournamentType: unknown;
  gameType: unknown;
  playerCount: unknown;
  weekDay: unknown;
  prizePoolMin: number | null;
  prizePoolMax: number | null;
  minParticipants: number | null;
  fromTime: string | null;
  toTime: string | null;
  excludePattern: string | null;
  timezone: number | null;
  autoOnly: boolean;
  manualOnly: boolean;
}): GradeRuleCardRule {
  return {
    id: rule.id,
    filterName: rule.filterName,
    lobbyzeFilterId: rule.lobbyzeFilterId,
    sites: parseJson<LobbyzeFilterItem>(rule.sites),
    buyInMin: rule.buyInMin,
    buyInMax: rule.buyInMax,
    speed: parseJson<LobbyzeFilterItem>(rule.speed),
    variant: parseJson<LobbyzeFilterItem>(rule.variant),
    tournamentType: parseJson<LobbyzeFilterItem>(rule.tournamentType),
    gameType: parseJson<LobbyzeFilterItem>(rule.gameType),
    playerCount: parseJson<LobbyzeFilterItem>(rule.playerCount),
    weekDay: parseJson<LobbyzeFilterItem>(rule.weekDay),
    prizePoolMin: rule.prizePoolMin,
    prizePoolMax: rule.prizePoolMax,
    minParticipants: rule.minParticipants,
    fromTime: rule.fromTime,
    toTime: rule.toTime,
    excludePattern: rule.excludePattern,
    timezone: rule.timezone,
    autoOnly: rule.autoOnly,
    manualOnly: rule.manualOnly,
  };
}

export default async function GradeRulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const grade = await getGradeByIdForSession(session, id);

  if (!grade) notFound();

  const canEditNote = canEditGradeCoachNote(session);
  const manageRules = canManageGrades(session);

  return (
    <div className="space-y-8 w-full max-w-[min(100%,92rem)] mx-auto px-1 sm:px-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/grades">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-bold tracking-tight">{grade.name}</h2>
            <Badge
              variant="outline"
              className="border-blue-500/30 text-blue-600 bg-blue-500/8 text-sm px-3"
            >
              {grade.rules.length} filtro{grade.rules.length !== 1 ? "s" : ""}
            </Badge>
            <Badge
              variant="outline"
              className="border-blue-500/30 text-blue-600 bg-blue-500/8 text-sm px-3"
            >
              {grade._count.assignments} jogador
              {grade._count.assignments !== 1 ? "es" : ""}
            </Badge>
          </div>
        </div>
      </div>

      <GradeCoachNoteSection
        gradeId={grade.id}
        initialDescription={grade.description}
        canEdit={canEditNote}
      />

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-blue-500/30" />
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider px-3">
          Filtros da grade
        </span>
        <div className="h-px flex-1 bg-blue-500/30" />
      </div>

      {manageRules && (
        <p className="text-sm text-muted-foreground -mt-4">
          Admin/Manager: clique em{" "}
          <span className="font-medium text-foreground">Editar</span> no cartão,
          ajuste os campos e salve.
        </p>
      )}

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {grade.rules.map((rule, idx) => (
          <GradeRuleCard
            key={rule.id}
            rule={toRuleCard(rule)}
            idx={idx}
            manage={manageRules}
          />
        ))}
      </div>

      {grade.rules.length === 0 && (
        <div className="bg-blue-500/10 flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <Target className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-xl">Nenhum filtro definido para esta grade.</p>
          <p className="text-base mt-1 text-muted-foreground/80">
            Faça o upload de um JSON da Lobbyze para importar os filtros.
          </p>
        </div>
      )}
    </div>
  );
}
