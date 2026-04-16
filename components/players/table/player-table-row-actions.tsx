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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import { MoreVertical, Pencil, Settings2, Trash } from "lucide-react";
import { deletePlayer } from "@/lib/queries/db/player";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import { playersTableCol } from "@/lib/constants/classes";
import type { PlayerTableRowActionsProps } from "@/lib/types/player";
import { deletePlayerActionErrorMessage } from "@/lib/utils/player";
import { cn } from "@/lib/utils";

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
            "Jogador excluÃ­do",
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
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir jogador?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove {player.name} do sistema, incluindo grades, targets, importaÃ§Ãµes de torneios e revisÃµes. Se
              existir conta de login vinculada, ela serÃ¡ desvinculada. NÃ£o dÃ¡ para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-600/90"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex min-h-[1.5rem] items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="AÃ§Ãµes">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
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
              <Link href={`/dashboard/players/${player.id}`}>
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
