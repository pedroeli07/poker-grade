"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { deleteGrade } from "@/app/dashboard/grades/actions";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";

const log = createLogger("grades.ui");

export function DeleteGradeButton({
  gradeId,
  gradeName,
  className,
}: {
  gradeId: string;
  gradeName: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    if (pending) return;
    setPending(true);
    try {
      log.info("Usuário confirmou exclusão de grade", {
        id: gradeId,
        name: gradeName,
      });
      await deleteGrade(gradeId);
      toast.success("Grade removida", gradeName);
      setOpen(false);
      router.refresh();
    } catch {
      log.error("Falha ao excluir grade no cliente", undefined, {
        id: gradeId,
      });
      toast.error("Não foi possível remover a grade");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
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
      </AlertDialogTrigger>
      <AlertDialogContent size="default" className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir grade?</AlertDialogTitle>
          <AlertDialogDescription>
            A grade{" "}
            <span className="font-semibold text-foreground">{gradeName}</span>{" "}
            será removida com todas as regras. Esta ação não pode ser desfeita.
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
            {pending ? "Excluindo…" : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
