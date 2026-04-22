"use client";

import { memo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { deleteTarget } from "@/lib/queries/db/target/delete-mutations";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import type { TargetListRow } from "@/lib/types/target/index";
import { destructiveAlertDialogContentClassName, destructiveAlertHeaderClassName, destructiveAlertTitleClassName, destructiveAlertDescriptionWrapClassName, destructiveAlertFooterClassName, destructiveAlertCancelButtonClassName, destructiveAlertConfirmButtonClassName } from "@/lib/constants/classes";
import EditTargetModal from "@/components/modals/edit-target-modal";

const TargetTableRowActions = memo(function TargetTableRowActions({
  target,
}: {
  target: TargetListRow;
}) {
  const router = useRouter();
  const invalidateTargets = useInvalidate("targets");
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  function handleDeleteConfirm() {
    startTransition(() => {
      void (async () => {
        try {
          await deleteTarget(target.id);
          toast.success(
            "Target excluído",
            `"${target.name}" foi removido.`,
          );
          setDeleteOpen(false);
          invalidateTargets();
          router.refresh();
        } catch (err) {
          toast.error(
            "Erro ao excluir",
            err instanceof Error ? err.message : "Tente novamente.",
          );
        }
      })();
    });
  }

  return (
    <>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (!o && isPending) return;
          setDeleteOpen(o);
        }}
      >
        <AlertDialogContent className={destructiveAlertDialogContentClassName}>
          <DestructiveAlertIconHeader />
          <AlertDialogHeader className={destructiveAlertHeaderClassName}>
            <AlertDialogTitle className={destructiveAlertTitleClassName}>
              Excluir target?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={destructiveAlertDescriptionWrapClassName}>
                <p>
                  Isso remove a meta{" "}
                  <span className="font-semibold text-foreground">{target.name}</span>{" "}
                  de{" "}
                  <span className="font-semibold text-foreground">{target.playerName}</span>.
                </p>
                <DestructiveAlertWarningNote>
                  Esta ação não pode ser desfeita.
                </DestructiveAlertWarningNote>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DestructiveAlertDivider />
          <AlertDialogFooter className={destructiveAlertFooterClassName}>
            <AlertDialogCancel
              disabled={isPending}
              className={destructiveAlertCancelButtonClassName}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isPending}
              className={destructiveAlertConfirmButtonClassName}
            >
              {isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editOpen && (
        <EditTargetModal target={target} open={editOpen} onOpenChange={setEditOpen} />
      )}

      <div className="flex min-h-[1.5rem] items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="Ações">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setEditOpen(true)}
              className="cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              Editar target
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash className="h-4 w-4" />
              Excluir target
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
});

TargetTableRowActions.displayName = "TargetTableRowActions";

export default TargetTableRowActions;
