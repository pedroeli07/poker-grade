"use client";

import { memo } from "react";
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
import {
  DestructiveAlertDivider,
  DestructiveAlertIconHeader,
  DestructiveAlertWarningNote,
} from "@/components/modals/primitives/destructive-alert-dialog";
import { destructiveAlertDialogContentClassName, destructiveAlertHeaderClassName, destructiveAlertTitleClassName, destructiveAlertDescriptionWrapClassName, destructiveAlertFooterClassName, destructiveAlertCancelButtonClassName, destructiveAlertConfirmButtonClassName } from "@/lib/constants/classes";
const AlertsBulkDeleteDialog = memo(function AlertsBulkDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={destructiveAlertDialogContentClassName}>
        <DestructiveAlertIconHeader />
        <AlertDialogHeader className={destructiveAlertHeaderClassName}>
          <AlertDialogTitle className={destructiveAlertTitleClassName}>
            Excluir alertas selecionados?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className={destructiveAlertDescriptionWrapClassName}>
              <p>
                {selectedCount === 1
                  ? "Este alerta será removido permanentemente."
                  : `Os ${selectedCount} alertas selecionados serão removidos permanentemente.`}
              </p>
              <DestructiveAlertWarningNote>Não é possível desfazer.</DestructiveAlertWarningNote>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <DestructiveAlertDivider />
        <AlertDialogFooter className={destructiveAlertFooterClassName}>
          <AlertDialogCancel disabled={isPending} className={destructiveAlertCancelButtonClassName}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className={destructiveAlertConfirmButtonClassName}
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? "Excluindo…" : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

AlertsBulkDeleteDialog.displayName = "AlertsBulkDeleteDialog";

export default AlertsBulkDeleteDialog;
