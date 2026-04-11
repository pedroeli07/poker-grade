"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useGradeDetailPage } from "@/hooks/grades/use-grade-detail-page";
import type { GradeDetailQueryData } from "@/lib/types";
import { cardClassName } from "@/lib/constants";
import GradeRuleCard from "@/components/grades/grade-rule-card";
import { Button } from "@/components/ui/button";
import { memo } from "react";

const GradeDetailClient = memo(({
  gradeId,
  initialData,
}: {
  gradeId: string;
  initialData: GradeDetailQueryData;
}) => {
  const { data } = useGradeDetailPage(gradeId, initialData);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/grades" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">{data.name}</h2>
        {data.description ? (
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{data.description}</p>
        ) : null}
        <p className="text-muted-foreground mt-2 text-sm">
          {data.assignmentsCount} jogador(es) com esta grade · {data.rules.length} regra(s)
        </p>
      </div>

      <div className="space-y-4">
        {data.rules.length === 0 ? (
          <div className={`${cardClassName} py-10 text-center text-muted-foreground text-sm`}>
            Nenhuma regra nesta grade.
          </div>
        ) : (
          data.rules.map((rule, idx) => (
            <GradeRuleCard
              key={rule.id}
              rule={rule}
              idx={idx}
              manage={data.manageRules}
              gradeProfileId={gradeId}
            />
          ))
        )}
      </div>
    </div>
  );
});

GradeDetailClient.displayName = "GradeDetailClient";

export default GradeDetailClient;
