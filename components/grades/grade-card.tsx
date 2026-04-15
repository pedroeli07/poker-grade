import Link from "next/link";
import { Archive } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradeCardProps } from "@/lib/types";
import { cardClassName } from "@/lib/constants";
import GradePlayersHover from "./grade-players-hover";
import { DeleteGradeButton } from "@/components/delete-grade-button";
import EditGradeDialog from "@/components/modals/edit-grade-modal";
import { memo } from "react";

const GradeCard = memo(function GradeCard({ grade, manage }: GradeCardProps) {
  return (
    <Card className={cardClassName}>
      <CardHeader className="space-y-2 pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold leading-snug line-clamp-2 pr-1">
            {grade.name}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-0.5">
            {manage && (
              <>
                <EditGradeDialog
                  gradeId={grade.id}
                  initialName={grade.name}
                  initialDescription={grade.description}
                  className="opacity-100"
                />
                <DeleteGradeButton
                  gradeId={grade.id}
                  gradeName={grade.name}
                  className="opacity-100"
                />
              </>
            )}
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed line-clamp-3 min-h-[3.75rem]">
          {grade.description?.trim() || "Sem descrição."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary shrink-0 opacity-80" />
            <span>
              <span className="font-semibold tabular-nums text-foreground">
                {grade.rulesCount}
              </span>{" "}
              regras
            </span>
          </div>
          <GradePlayersHover
            count={grade.assignmentsCount}
            players={grade.assignedPlayers}
            gradeName={grade.name}
            variant="card"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs border-primary/20"
          >
            <Link href={`/dashboard/grades/${grade.id}`}>Ver regras</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

GradeCard.displayName = "GradeCard";

export default GradeCard;