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
import type { GovernanceDeleteDialogsProps } from "@/lib/types/team/governance-forms";
import {
  destructiveAlertCancelButtonClassName,
  destructiveAlertConfirmButtonClassName,
  destructiveAlertDescriptionWrapClassName,
  destructiveAlertDialogContentClassName,
  destructiveAlertFooterClassName,
  destructiveAlertHeaderClassName,
  destructiveAlertTitleClassName,
} from "@/lib/constants/classes";

const GovernanceDeleteDialogs = memo(function GovernanceDeleteDialogs({
  deleteAlertId,
  onDeleteAlertIdChange,
  onConfirmDeleteAlert,
  deleteAlertRuleName,
  confirmPending = false,
}: GovernanceDeleteDialogsProps) {
  return (
    <AlertDialog open={!!deleteAlertId} onOpenChange={(o) => !o && onDeleteAlertIdChange(null)}>
      <AlertDialogContent size="default" className={destructiveAlertDialogContentClassName}>
        <DestructiveAlertIconHeader />
        <AlertDialogHeader className={destructiveAlertHeaderClassName}>
          <AlertDialogTitle className={destructiveAlertTitleClassName}>Excluir regra?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className={destructiveAlertDescriptionWrapClassName}>
              <p>
                A regra{" "}
                <span className="font-semibold text-foreground">
                  {deleteAlertRuleName ? `"${deleteAlertRuleName}"` : "selecionada"}
                </span>{" "}
                será removida.
              </p>
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
            onClick={onConfirmDeleteAlert}
            className={destructiveAlertConfirmButtonClassName}
          >
            {confirmPending ? "Excluindo…" : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

GovernanceDeleteDialogs.displayName = "GovernanceDeleteDialogs";

export default GovernanceDeleteDialogs;
