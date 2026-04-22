import { Badge } from "@/components/ui/badge";
import { schedulingCategory } from "@/lib/utils/player";
import { memo } from "react";

const PlayerTourneySchedulingBadge = memo(function PlayerTourneySchedulingBadge({
  scheduling,
}: {
  scheduling: string | null;
}) {
  const cat = schedulingCategory(scheduling);
  if (cat === "extra")
    return <Badge className="border border-red-500/30 bg-red-500/15 text-red-500 text-xs">Extra play</Badge>;
  if (cat === "played")
    return <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 text-xs">Played</Badge>;
  return <Badge className="border border-zinc-500/30 bg-zinc-500/15 text-zinc-500 text-xs">Didn&apos;t play</Badge>;
});

PlayerTourneySchedulingBadge.displayName = "PlayerTourneySchedulingBadge";

export default PlayerTourneySchedulingBadge;
