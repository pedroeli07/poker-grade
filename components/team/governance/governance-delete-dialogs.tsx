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
import type { GovernanceDeleteDialogsProps } from "@/lib/types/team/governance-forms";

const GovernanceDeleteDialogs = memo(function GovernanceDeleteDialogs({
  deleteDecisionId,
  onDeleteDecisionIdChange,
  onConfirmDeleteDecision,
  deleteAlertId,
  onDeleteAlertIdChange,
  onConfirmDeleteAlert,
}: GovernanceDeleteDialogsProps) {
  return (
    <>
      <AlertDialog open={!!deleteDecisionId} onOpenChange={() => onDeleteDecisionIdChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir decisão?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onConfirmDeleteDecision}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteAlertId} onOpenChange={() => onDeleteAlertIdChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onConfirmDeleteAlert}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

GovernanceDeleteDialogs.displayName = "GovernanceDeleteDialogs";

export default GovernanceDeleteDialogs;
