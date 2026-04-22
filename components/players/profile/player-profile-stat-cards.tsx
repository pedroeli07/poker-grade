import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3, AlertTriangle, ShieldCheck, Target } from "lucide-react";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import type { PlayerProfileRecord } from "@/lib/types/player/index";
import { memo } from "react";

const PlayerProfileStatCards = memo(function PlayerProfileStatCards({
  player,
  onTrackCount,
  attentionCount,
  offTrackCount,
}: {
  player: PlayerProfileRecord;
  onTrackCount: number;
  attentionCount: number;
  offTrackCount: number;
}) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      <Card className={cardClassName}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Grid3X3 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grades</span>
          </div>
          <div className="text-2xl font-bold">{player.gradeAssignments.length}</div>
          <p className="text-xs text-muted-foreground">atribuídas</p>
        </CardContent>
      </Card>

      <Card className={cardClassName}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Torneios</span>
          </div>
          <div className="text-2xl font-bold">{player._count.playedTournaments}</div>
          <p className="text-xs text-muted-foreground">importados</p>
        </CardContent>
      </Card>

      <Card className={cardClassName}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revisões</span>
          </div>
          <div className="text-2xl font-bold">{player._count.reviewItems}</div>
          <p className="text-xs text-muted-foreground">pendências</p>
        </CardContent>
      </Card>

      <Card className={cardClassName}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Targets</span>
          </div>
          <div className="text-2xl font-bold">{player.targets.length}</div>
          <p className="text-xs text-muted-foreground">
            {onTrackCount > 0 && <span className="text-emerald-500">{onTrackCount} ok</span>}
            {attentionCount > 0 && <span className="text-amber-500 ml-1">{attentionCount} atenção</span>}
            {offTrackCount > 0 && <span className="text-red-500 ml-1">{offTrackCount} fora</span>}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

PlayerProfileStatCards.displayName = "PlayerProfileStatCards";

export default PlayerProfileStatCards;
