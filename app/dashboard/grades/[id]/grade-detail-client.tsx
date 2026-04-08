"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target } from "lucide-react";
import Link from "next/link";
import { getGradeDetailQueryAction } from "@/app/dashboard/grades/actions";
import { GradeCoachNoteSection } from "@/components/grade-coach-note";
import { GradeRuleCard } from "@/components/grade-rule-card";
import { gradeKeys } from "@/lib/queries/grade-query-keys";
import type { GradeDetailQueryData } from "@/lib/types";
import { STALE_TIME } from "@/lib/constants";


export function GradeDetailClient({
  gradeId,
  initialData,
}: {
  gradeId: string;
  initialData: GradeDetailQueryData;
}) {
  const { data = initialData } = useQuery<GradeDetailQueryData>({
    queryKey: gradeKeys.detail(gradeId),
    queryFn: async () => {
      const r = await getGradeDetailQueryAction(gradeId);
      if (!r.ok) throw new Error(r.error);
      return r.data;
    },
    initialData,
    staleTime: STALE_TIME,
  });

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
            <h2 className="text-4xl font-bold tracking-tight">{data.name}</h2>
            <Badge
              variant="outline"
              className="border-blue-500/30 text-blue-600 bg-blue-500/8 text-sm px-3"
            >
              {data.rules.length} filtro{data.rules.length !== 1 ? "s" : ""}
            </Badge>
            <Badge
              variant="outline"
              className="border-blue-500/30 text-blue-600 bg-blue-500/8 text-sm px-3"
            >
              {data.assignmentsCount} jogador
              {data.assignmentsCount !== 1 ? "es" : ""}
            </Badge>
          </div>
        </div>
      </div>

      <GradeCoachNoteSection
        gradeId={data.id}
        initialDescription={data.description}
        canEdit={data.canEditNote}
      />

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-blue-500/30" />
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider px-3">
          Filtros da grade
        </span>
        <div className="h-px flex-1 bg-blue-500/30" />
      </div>

      {data.manageRules && (
        <p className="text-sm text-muted-foreground -mt-4">
          Admin/Manager: clique em{" "}
          <span className="font-medium text-foreground">Editar</span> no cartão,
          ajuste os campos e salve.
        </p>
      )}

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {data.rules.map((rule, idx) => (
          <GradeRuleCard
            key={rule.id}
            rule={rule}
            idx={idx}
            manage={data.manageRules}
            gradeProfileId={gradeId}
          />
        ))}
      </div>

      {data.rules.length === 0 && (
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
