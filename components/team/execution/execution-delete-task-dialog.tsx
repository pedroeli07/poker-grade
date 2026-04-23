"use client";

import { memo } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
} from "@/lib/constants/classes";
import type { ExecutionDeleteTaskDialogProps } from "@/lib/types/team/execution";

export const ExecutionDeleteTaskDialog = memo(function ExecutionDeleteTaskDialog({
  deleteId,
  onOpenChange,
  onConfirm,
  confirmPending = false,
}: ExecutionDeleteTaskDialogProps) {
  return (
    <AlertDialog
      open={!!deleteId}
      onOpenChange={(next) => {
        if (!next && confirmPending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent size="default" className={destructiveAlertDialogContentClassName}>
        <DestructiveAlertIconHeader />
        <AlertDialogHeader className={destructiveAlertHeaderClassName}>
          <AlertDialogTitle className={destructiveAlertTitleClassName}>
            Excluir tarefa?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className={destructiveAlertDescriptionWrapClassName}>
              <p>A tarefa será removida do quadro de execução.</p>
              <DestructiveAlertWarningNote>Esta ação não pode ser desfeita.</DestructiveAlertWarningNote>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <DestructiveAlertDivider />
        <AlertDialogFooter className={destructiveAlertFooterClassName}>
          <AlertDialogCancel
            type="button"
            disabled={confirmPending}
            className={destructiveAlertCancelButtonClassName}
          >
            Voltar
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={confirmPending}
            onClick={() => {
              if (deleteId) onConfirm(deleteId);
            }}
            className={destructiveAlertConfirmButtonClassName}
          >
            {confirmPending ? "Excluindo…" : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

ExecutionDeleteTaskDialog.displayName = "ExecutionDeleteTaskDialog";
