"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteGrade } from "@/lib/queries/db/grade";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { useInvalidate } from "@/hooks/use-invalidate";

const log = createLogger("grades.ui");

export function DeleteGradeButton({
  gradeId,
  gradeName,
  className,
  trigger,
}: {
  gradeId: string;
  gradeName: string;
  className?: string;
  trigger?: React.ReactNode;
}) {
  const invalidateGrades = useInvalidate("grades");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    if (pending) return;
    setPending(true);
    try {
      log.info("UsuÃ¡rio confirmou exclusÃ£o de grade", {
        id: gradeId,
        name: gradeName,
      });
      const res = await deleteGrade(gradeId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Grade removida", gradeName);
      setOpen(false);
      invalidateGrades();
    } catch {
      log.error("Falha ao excluir grade no cliente", undefined, {
        id: gradeId,
      });
      toast.error("NÃ£o foi possÃ­vel remover a grade");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Excluir grade"
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity",
              className
            )}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent size="default" className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir grade?</AlertDialogTitle>
          <AlertDialogDescription>
            A grade{" "}
            <span className="font-semibold text-foreground">{gradeName}</span>{" "}
            serÃ¡ removida com todas as regras. Esta aÃ§Ã£o nÃ£o pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={pending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? "Excluindoâ€¦" : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
