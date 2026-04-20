"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  DestructiveAlertDivider,
  DestructiveAlertIconHeader,
  DestructiveAlertWarningNote,
} from "@/components/modals/primitives/destructive-alert-dialog";
import {
  destructiveAlertCancelButtonClassName,
  destructiveAlertConfirmButtonClassName,
  destructiveAlertDescriptionWrapClassName,
  destructiveAlertDialogContentClassName,
  destructiveAlertFooterClassName,
  destructiveAlertHeaderClassName,
  destructiveAlertTitleClassName,
} from "@/lib/constants";

const TargetsDeleteDialog = memo(function TargetsDeleteDialog({
  isOpen,
  idsToDelete,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  idsToDelete: string[] | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const count = idsToDelete?.length ?? 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className={destructiveAlertDialogContentClassName}>
        <DestructiveAlertIconHeader icon={AlertTriangle} iconClassName="text-amber-600" />
        <AlertDialogHeader className={destructiveAlertHeaderClassName}>
          <AlertDialogTitle className={destructiveAlertTitleClassName}>
            Excluir {count === 1 ? "target" : "targets"}?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className={destructiveAlertDescriptionWrapClassName}>
              {count === 1 ? (
                <p>Tem certeza de que deseja excluir este target?</p>
              ) : (
                <p>
                  Tem certeza de que deseja excluir{" "}
                  <strong className="text-foreground">{count}</strong> targets? As metas selecionadas
                  serão removidas.
                </p>
              )}
              <DestructiveAlertWarningNote>Esta ação não pode ser desfeita.</DestructiveAlertWarningNote>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <DestructiveAlertDivider />
        <AlertDialogFooter className={destructiveAlertFooterClassName}>
          <AlertDialogCancel disabled={isPending} className={destructiveAlertCancelButtonClassName}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className={cn(
              destructiveAlertConfirmButtonClassName,
              "inline-flex items-center justify-center gap-2"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                Excluindo…
              </>
            ) : (
              "Sim, excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

TargetsDeleteDialog.displayName = "TargetsDeleteDialog";

export default TargetsDeleteDialog;
