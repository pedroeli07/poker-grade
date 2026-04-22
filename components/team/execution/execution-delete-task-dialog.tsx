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
import type { ExecutionDeleteTaskDialogProps } from "@/lib/types/team/execution";

export const ExecutionDeleteTaskDialog = memo(function ExecutionDeleteTaskDialog({
  deleteId,
  onOpenChange,
  onConfirm,
}: ExecutionDeleteTaskDialogProps) {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (deleteId) onConfirm(deleteId);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

ExecutionDeleteTaskDialog.displayName = "ExecutionDeleteTaskDialog";
