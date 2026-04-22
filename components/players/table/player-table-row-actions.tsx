"use client";

import { memo, useState, useTransition } from "react";
import Link from "next/link";
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
import { TableCell } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Settings2, Trash } from "lucide-react";
import { deletePlayer } from "@/lib/queries/db/player/delete-mutations";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import type { PlayerTableRowActionsProps } from "@/lib/types/player/index";
import { deletePlayerActionErrorMessage } from "@/lib/utils/player";
import { cn } from "@/lib/utils/cn";
import { destructiveAlertDialogContentClassName, destructiveAlertHeaderClassName, destructiveAlertTitleClassName, destructiveAlertDescriptionWrapClassName, destructiveAlertFooterClassName, destructiveAlertCancelButtonClassName, destructiveAlertConfirmButtonClassName, playersTableCol } from "@/lib/constants/classes";
const PlayerTableRowActions = memo(function PlayerTableRowActions({
  player,
  canEditPlayers,
  onEdit,
}: PlayerTableRowActionsProps) {
  const router = useRouter();
  const invalidatePlayers = useInvalidate("players");
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDeleteConfirm() {
    const fd = new FormData();
    fd.set("id", player.id);
    startTransition(() => {
      void (async () => {
        try {
          await deletePlayer(fd);
          toast.success(
            "Jogador excluído",
            `${player.name} e dados vinculados foram removidos.`
          );
          setDeleteOpen(false);
          invalidatePlayers();
          router.refresh();
        } catch (err) {
          toast.error("Erro ao excluir", deletePlayerActionErrorMessage(err));
        }
      })();
    });
  }

  return (
    <TableCell className={cn(playersTableCol.actions, "py-3 text-right align-middle")}>
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
            <AlertDialogTitle className={destructiveAlertTitleClassName}>Excluir jogador?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={destructiveAlertDescriptionWrapClassName}>
                <p>
                  Isso remove{" "}
                  <span className="font-semibold text-foreground">{player.name}</span> do sistema, incluindo
                  grades, targets, importações de torneios e revisões.
                </p>
                <p>Se existir conta de login vinculada, ela será desvinculada.</p>
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
      <div className="flex min-h-[1.5rem] items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="Ações">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {canEditPlayers ? (
              <>
                <DropdownMenuItem onClick={() => onEdit(player)} className="cursor-pointer">
                  <Pencil className="h-4 w-4" />
                  Editar jogador
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={() => setDeleteOpen(true)}>
                  <Trash className="h-4 w-4" />
                  Excluir jogador
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/jogadores/${player.id}`}>
                <Settings2 className="h-4 w-4" />
                Gerenciar perfil
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  );
});

PlayerTableRowActions.displayName = "PlayerTableRowActions";

export default PlayerTableRowActions;
