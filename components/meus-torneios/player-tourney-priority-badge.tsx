import { Badge } from "@/components/ui/badge";
import { memo } from "react";

const PlayerTourneyPriorityBadge = memo(function PlayerTourneyPriorityBadge({
  priority,
}: {
  priority: string | null;
}) {
  const p = (priority ?? "").toUpperCase();
  if (p === "HIGH")
    return <Badge className="border border-rose-500/30 bg-rose-500/15 text-rose-500 text-xs">High</Badge>;
  if (p === "MEDIUM")
    return <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-600 text-xs">Medium</Badge>;
  return <span className="text-xs text-muted-foreground">—</span>;
});

PlayerTourneyPriorityBadge.displayName = "PlayerTourneyPriorityBadge";

export default PlayerTourneyPriorityBadge;
