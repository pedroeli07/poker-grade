import Link from "next/link";
import { ArrowLeft, User, Mail, AtSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlayerProfileRecord } from "@/lib/types";
import { PlayerStatus } from "@prisma/client";
import { memo } from "react";

const PlayerProfileHeader = memo(function PlayerProfileHeader({ player }: { player: PlayerProfileRecord }) {
  return (
    <div className="flex items-start gap-4">
      <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
        <Link href="/dashboard/players">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h2 className="text-3xl font-bold tracking-tight truncate">{player.name}</h2>
          <Badge
            className={
              player.status === PlayerStatus.ACTIVE
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            }
          >
            {player.status === PlayerStatus.ACTIVE
              ? "Ativo"
              : player.status === PlayerStatus.INACTIVE
                ? "Inativo"
                : "Suspenso"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {player.nickname && (
            <span className="flex items-center gap-1">
              <AtSign className="h-3.5 w-3.5" />
              {player.nickname}
            </span>
          )}
          {player.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {player.email}
            </span>
          )}
          {player.coach && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Coach: <strong className="text-foreground ml-0.5">{player.coach.name}</strong>
            </span>
          )}
          {player.playerGroup && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Grupo: <strong className="text-foreground ml-0.5">{player.playerGroup}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

PlayerProfileHeader.displayName = "PlayerProfileHeader";

export default PlayerProfileHeader;
