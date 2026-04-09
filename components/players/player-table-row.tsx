import { memo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Settings2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { PlayerDataRowProps } from "@/lib/types";
import { POKER_NETWORKS_UI } from "@/lib/constants";

function RoiCell({ roi }: { roi: number | null }) {
  if (roi === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (roi < -40) return <span className="inline-flex flex-col items-center gap-1 text-red-500 text-[13px] font-semibold leading-none tabular-nums"><TrendingDown className="h-4 w-4 shrink-0" /><span>{roi.toFixed(1)}%</span></span>;
  if (roi < -20) return <span className="inline-flex flex-col items-center gap-1 text-amber-500 text-[13px] font-semibold leading-none tabular-nums"><TrendingDown className="h-4 w-4 shrink-0" /><span>{roi.toFixed(1)}%</span></span>;
  if (roi >= 0) return <span className="inline-flex flex-col items-center gap-1 text-emerald-500 text-[13px] font-semibold leading-none tabular-nums"><TrendingUp className="h-4 w-4 shrink-0" /><span>+{roi.toFixed(1)}%</span></span>;
  return <span className="inline-flex flex-col items-center gap-1 text-muted-foreground text-[13px] font-semibold leading-none tabular-nums"><Minus className="h-4 w-4 shrink-0" /><span>{roi.toFixed(1)}%</span></span>;
}

export const PlayerTableRow = memo(function PlayerTableRow({
  player,
  canEditPlayers,
  onEdit,
}: PlayerDataRowProps) {
  return (
    <TableRow className="hover:bg-sidebar-accent/50">
      <TableCell className="font-medium max-w-[140px] truncate" title={player.name}>
        {player.name}
      </TableCell>
      <TableCell
        className="max-w-[160px] truncate text-[13px] text-muted-foreground"
        title={player.email || "Sem email"}
      >
        {player.email ? player.email : <span className="italic opacity-50">—</span>}
      </TableCell>
      <TableCell className="max-w-[320px]">
        {player.nicks && player.nicks.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 w-max">
            {player.nicks.map((n) => {
              const net = POKER_NETWORKS_UI.find((x) => x.value === n.network);
              return (
                <div
                  key={n.network + n.nick}
                  title={`${n.network}: ${n.nick}`}
                  className="bg-muted/60 px-2 py-1 rounded flex items-center gap-2 overflow-hidden w-max max-w-[120px]"
                >
                  {net?.icon && (
                    // eslint-disable-next-line @next/next/no-img-element -- small static network icons
                    <img src={net.icon} alt={net.label} className="w-4 h-4 rounded-[2px] object-contain shrink-0" />
                  )}
                  <span className="text-xs font-mono text-muted-foreground truncate leading-none">
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
      <TableCell className="max-w-[150px] truncate" title={player.playerGroup || "Sem grupo"}>
        {player.playerGroup ? (
          <span className="text-[13px] text-muted-foreground">{player.playerGroup}</span>
        ) : (
          <span className="text-[13px] text-muted-foreground italic opacity-50">—</span>
        )}
      </TableCell>
      <TableCell>
        {player.coachKey !== "__none__" ? (
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
            {player.coachLabel}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs italic">Sem Coach</span>
        )}
      </TableCell>
      <TableCell className="pr-4">
        {player.gradeKey !== "__none__" ? (
          <span className="text-sm font-medium">{player.gradeLabel}</span>
        ) : (
          <span className="text-muted-foreground text-xs">Não atribuída</span>
        )}
      </TableCell>
      <TableCell className="w-[6rem] min-w-[6rem] max-w-[6rem] pr-1.5 text-center">
        {player.abiKey !== "__none__" ? (
          <span className="font-mono text-sm font-semibold tabular-nums">{player.abiLabel}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell className="w-[5.25rem] min-w-[5.25rem] max-w-[5.25rem] px-1 text-center">
        <RoiCell roi={player.roiTenDay} />
      </TableCell>
      <TableCell className="w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem] px-1 text-center font-mono text-[13px] tabular-nums">
        {player.fpTenDay !== null ? (
          <span className={player.fpTenDay > 8 ? "text-amber-500 font-semibold" : ""}>
            {player.fpTenDay.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem] px-1 text-center font-mono text-[13px] tabular-nums">
        {player.ftTenDay !== null ? (
          <span className={player.ftTenDay < 8 ? "text-red-500 font-semibold" : ""}>
            {player.ftTenDay.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {player.status === "ACTIVE" ? (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 glow-success border-emerald-500/20">
            Ativo
          </Badge>
        ) : player.status === "SUSPENDED" ? (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/25">Suspenso</Badge>
        ) : (
          <Badge variant="secondary">Inativo</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex items-center justify-end gap-0.5">
          {canEditPlayers ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Editar jogador"
              onClick={() => onEdit(player)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" asChild title="Gerenciar perfil">
            <Link href={`/dashboard/players/${player.id}`}>
              <Settings2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
