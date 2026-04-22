"use client";

import { memo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTeamOperationalRule } from "@/lib/queries/db/team/culture/delete-rule";


const DeleteRuleButton = memo(function DeleteRuleButton({
  ruleId,
  ruleTitle,
}: {
  ruleId: string;
  ruleTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteTeamOperationalRule(ruleId);
      if (res.ok) {
        toast.success("Regra excluída.");
        setOpen(false);
      } else {
        toast.error(res.error || "Erro ao excluir.");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl p-0 overflow-hidden max-w-[420px]">
          <div className="bg-destructive/10 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 border-4 border-destructive/20 shadow-sm">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground mt-2">
              A regra <span className="font-semibold text-foreground">&quot;{ruleTitle}&quot;</span> será removida permanentemente.
            </AlertDialogDescription>
          </div>
          <div className="p-4 bg-card flex gap-3">
            <AlertDialogCancel className="flex-1 rounded-xl mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold"
            >
              {pending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default DeleteRuleButton;
