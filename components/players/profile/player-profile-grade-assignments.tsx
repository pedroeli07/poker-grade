import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grid3X3 } from "lucide-react";
import { cardClassName, GRADE_TYPE_LABEL, gradeOrder } from "@/lib/constants";
import type { PlayerProfileRecord } from "@/lib/types";
import type { GradeType } from "@prisma/client";
import { memo } from "react";
import { htmlToPlainText } from "@/lib/utils";

const PlayerProfileGradeAssignments = memo(function PlayerProfileGradeAssignments({
  assignmentsByType,
  canManage,
}: {
  assignmentsByType: Record<GradeType, PlayerProfileRecord["gradeAssignments"][number] | undefined>;
  canManage: boolean;
}) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Grades Atribuídas</h3>
        {canManage && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/grades/perfis">
              <Grid3X3 className="mr-1.5 h-3.5 w-3.5" />
              Gerenciar
            </Link>
          </Button>
        )}
      </div>

      {gradeOrder.map((type) => {
        const assignment = assignmentsByType[type];
        const cfg = GRADE_TYPE_LABEL[type];
        const GradeIcon = cfg.icon;

        if (!assignment) {
          return (
            <div
              key={type}
              className="rounded-xl border border-dashed border-border/60 p-4 flex items-center gap-3 text-muted-foreground bg-blue-500/10"
            >
              <GradeIcon className="h-4 w-4 shrink-0" />
              <span className="text-sm">{cfg.label} — não atribuída</span>
            </div>
          );
        }

        const grade = assignment.gradeProfile;
        return (
          <Card key={type} className={`${cardClassName} overflow-hidden`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${cfg.color} text-xs`}>
                    <GradeIcon className="mr-1 h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 text-xs -mr-1">
                  <Link href={`/admin/grades/perfis/${grade.id}`}>Ver regras</Link>
                </Button>
              </div>
              <CardTitle className="text-base mt-2">{grade.name}</CardTitle>
              {grade.description && (
                <CardDescription className="text-xs line-clamp-2">
                  {htmlToPlainText(grade.description)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Grid3X3 className="h-3 w-3" />
                  <strong className="text-foreground">{grade._count.rules}</strong> filtros
                </span>
                <span>Atribuída em {format(assignment.assignedAt, "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
              {assignment.notes && (
                <p className="mt-2 text-xs text-muted-foreground italic border-t border-border pt-2">
                  {assignment.notes}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

PlayerProfileGradeAssignments.displayName = "PlayerProfileGradeAssignments";

export default PlayerProfileGradeAssignments;
