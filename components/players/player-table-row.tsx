"use client";

import { memo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
import { TableCell, TableRow } from "@/components/ui/table";
import {
  MoreVertical,
  Pencil,
  Settings2,
  TrendingDown,
  TrendingUp,
  Minus,
  Trash,
  AlertTriangle,
} from "lucide-react";
import { deletePlayer } from "@/lib/queries/db/player-queries";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import type { PlayerDataRowProps } from "@/lib/types";
import { POKER_NETWORKS_UI } from "@/lib/constants";

const RoiClass = "inline-flex flex-row items-center gap-1.5 tabular-nums px-2.5 py-1 rounded-md border text-xs font-bold"
const RoiIconClass = "h-3.5 w-3.5 shrink-0"
const RoiValue = (roi: number) => `${roi.toFixed(1)}%`

function RoiCell({ roi }: { roi: number | null }) {
  if (roi === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (roi < -40) return <span className={`${RoiClass} bg-red-500/10 text-red-600 border-red-500/20`}><TrendingDown className={RoiIconClass} /><span>{RoiValue(roi)}</span></span>;
  if (roi < -20) return <span className={`${RoiClass} bg-amber-500/10 text-amber-600 border-amber-500/20`}><TrendingDown className={RoiIconClass} /><span>{RoiValue(roi)}</span></span>;
  if (roi >= 0) return <span className={`${RoiClass} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`}><TrendingUp className={RoiIconClass} /><span>+{RoiValue(roi)}</span></span>;
  return <span className={`${RoiClass} bg-muted text-muted-foreground border-border/50`}><Minus className={RoiIconClass} /><span>{RoiValue(roi)}</span></span>;
}

export const PlayerTableRow = memo(function PlayerTableRow({
  player,
  canEditPlayers,
  onEdit,
}: PlayerDataRowProps) {
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
          const msg =
            err instanceof Error && err.message === "FORBIDDEN"
              ? "Sem permissão para excluir este jogador."
              : err instanceof Error && err.message === "NOT_FOUND"
                ? "Jogador não encontrado."
                : "Não foi possível excluir. Tente novamente.";
          toast.error("Erro ao excluir", msg);
        }
      })();
    });
  }

  return (
    <TableRow className="hover:bg-sidebar-accent/50">
        <TableCell className="w-[11%] min-w-0 font-medium truncate align-top" title={player.name}>
          {player.name}
        </TableCell>
        <TableCell
          className="w-[10%] min-w-0 truncate align-top text-[12px] text-muted-foreground"
          title={player.email || "Sem email"}
        >
          {player.email ? player.email : <span className="italic opacity-50">—</span>}
        </TableCell>
        <TableCell className="w-[18%] min-w-0 whitespace-normal align-top">
          {player.nicks && player.nicks.filter(n => n.network !== "PlayerGroup").length > 0 ? (
            <div className="grid grid-cols-2 gap-x-1 gap-y-1">
              {player.nicks.filter(n => n.network !== "PlayerGroup").map((n) => {
                const net = POKER_NETWORKS_UI.find((x) => x.value === n.network);
                return (
                  <div
                    key={n.network + n.nick}
                    title={`${n.network}: ${n.nick}`}
                    className="bg-muted/60 flex min-w-0 items-center gap-1 rounded px-1 py-0.5"
                  >
                    {net?.icon && (
                      // eslint-disable-next-line @next/next/no-img-element -- small static network icons
                      <img src={net.icon} alt={net.label} className="h-4 w-4 shrink-0 rounded-[2px] object-contain" />
                    )}
                    <span className="min-w-0 truncate font-mono text-[12px] leading-tight text-muted-foreground">
                      {n.nick}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </TableCell>
        <TableCell
          className="w-[12%] min-w-0 whitespace-normal align-top"
          title={player.playerGroup || "Sem grupo"}
        >
          {player.playerGroup ? (
            <div className="flex flex-col gap-1">
              <span className="line-clamp-2 break-words text-[12px] text-muted-foreground">{player.playerGroup}</span>
              {player.sharkGroupNotFound && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-600">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  Não encontrado
                </span>
              )}
            </div>
          ) : (
            <span className="text-[12px] text-muted-foreground italic opacity-50">—</span>
          )}
        </TableCell>
        <TableCell className="w-[9%] min-w-0 whitespace-normal align-top">
          {player.coachKey !== "__none__" ? (
            <Badge
              variant="outline"
              title={player.coachLabel}
              className="inline-flex max-w-full border-primary/20 bg-primary/5 px-1.5 py-0 text-[11px] text-primary"
            >
              <span className="truncate">{player.coachLabel}</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              title={player.coachLabel}
              className="inline-flex max-w-full border-primary/20 bg-primary/5 px-1.5 py-0 text-[11px] text-primary"
            >
              <span className="truncate">Sem Coach</span>
            </Badge>
          )}
        </TableCell>
        <TableCell className="w-[9%] min-w-0 whitespace-normal align-top pr-2">
          {player.gradeKey !== "__none__" ? (
            <Badge
              variant="outline"
              title={player.gradeLabel}
              className="inline-flex max-w-full border-primary/20 bg-primary/5 px-1.5 py-0 text-[11px] text-primary"
            >
              <span className="truncate">{player.gradeLabel}</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              title={player.gradeLabel}
              className="inline-flex max-w-full border-primary/20 bg-primary/5 px-1.5 py-0 text-[11px] text-primary"
            >
              <span className="truncate">Não atribuída</span>
            </Badge>
          )}
        </TableCell>
        <TableCell className="w-[6%] min-w-0 px-0.5 text-center align-top">
          {player.abiKey !== "__none__" ? (
            <span className="font-mono text-sm font-bold tabular-nums">{player.abiLabel}</span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </TableCell>
        <TableCell className="w-[5%] min-w-0 px-0.5 text-center align-top pt-2">
          <RoiCell roi={player.roiTenDay} />
        </TableCell>
        <TableCell className="w-[5%] min-w-0 px-0.5 text-center align-top pt-2">
          {player.fpTenDay !== null ? (
            <span className={`inline-flex items-center tabular-nums px-2.5 py-1 rounded-md border text-xs font-bold ${
              player.fpTenDay > 8 
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            }`}>
              {player.fpTenDay.toFixed(1)}%
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </TableCell>
        <TableCell className="w-[5%] min-w-0 px-0.5 text-center align-top pt-2">
          {player.ftTenDay !== null ? (
            <span className={`inline-flex items-center tabular-nums px-2.5 py-1 rounded-md border text-xs font-bold ${
              player.ftTenDay < 8 
                ? "bg-red-500/10 text-red-600 border-red-500/20" 
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            }`}>
              {player.ftTenDay.toFixed(1)}%
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </TableCell>
        <TableCell className="w-[5%] min-w-0 whitespace-normal px-1.5 py-2 text-right align-top">
          <div className="flex justify-end">
            {player.status === "ACTIVE" ? (
              <Badge className="glow-success border-emerald-500/20 bg-emerald-500/10 px-1.5 text-[11px] text-emerald-500 hover:bg-emerald-500/20">
                Ativo
              </Badge>
            ) : player.status === "SUSPENDED" ? (
              <Badge className="border-amber-500/25 bg-amber-500/10 px-1.5 text-[11px] text-amber-700">Suspenso</Badge>
            ) : (
              <Badge variant="secondary" className="px-1.5 text-[11px]">
                Inativo
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="w-[5%] min-w-0 px-1.5 py-2 text-right align-top">
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
                  Isso remove {player.name} do sistema, incluindo grades, targets,
                  importações de torneios e revisões. Se existir conta de login
                  vinculada, ela será desvinculada. Não dá para desfazer.
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
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" title="Ações">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {canEditPlayers ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => onEdit(player)}
                      className="cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar jogador
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => setDeleteOpen(true)}
                    >
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
      </TableRow>
  );
});
