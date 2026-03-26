"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGrade } from "@/app/dashboard/grades/actions";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";

const log = createLogger("grades.ui");

export function DeleteGradeButton({
  gradeId,
  gradeName,
}: {
  gradeId: string;
  gradeName: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      title="Excluir grade"
      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={async () => {
        try {
          log.info("Usuário solicitou exclusão de grade", {
            id: gradeId,
            name: gradeName,
          });
          await deleteGrade(gradeId);
          toast.success("Grade removida", gradeName);
          router.refresh();
        } catch {
          log.error("Falha ao excluir grade no cliente", undefined, {
            id: gradeId,
          });
          toast.error("Não foi possível remover a grade");
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
