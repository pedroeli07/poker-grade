"use client";

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
import type { GovernanceConfirmDeleteDialogProps } from "@/lib/types/team/governance";
import {
  destructiveAlertCancelButtonClassName,
  destructiveAlertConfirmButtonClassName,
  destructiveAlertDescriptionWrapClassName,
  destructiveAlertDialogContentClassName,
  destructiveAlertFooterClassName,
  destructiveAlertHeaderClassName,
  destructiveAlertTitleClassName,
} from "@/lib/constants/classes";

export function GovernanceConfirmDeleteDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmPending = false,
}: GovernanceConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent size="default" className={destructiveAlertDialogContentClassName}>
        <DestructiveAlertIconHeader />
        <AlertDialogHeader className={destructiveAlertHeaderClassName}>
          <AlertDialogTitle className={destructiveAlertTitleClassName}>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className={destructiveAlertDescriptionWrapClassName}>
              {description}
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
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={confirmPending}
            onClick={onConfirm}
            className={destructiveAlertConfirmButtonClassName}
          >
            {confirmPending ? "Excluindo…" : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
