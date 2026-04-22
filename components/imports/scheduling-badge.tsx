import { Badge } from "@/components/ui/badge";
import { schedulingCategory } from "@/lib/utils/player";
import { memo } from "react";

const SchedulingBadge = memo(function SchedulingBadge({ scheduling }: { scheduling: string | null }) {
  const cat = schedulingCategory(scheduling);
  if (cat === "extra")
    return (
      <Badge className="bg-red-500/15 text-red-500 border-red-500/30 border text-xs">
        Extra Play
      </Badge>
    );
  if (cat === "played")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 border text-xs">
        Played
      </Badge>
    );
  return (
    <Badge className="bg-zinc-500/15 text-zinc-500 border-zinc-500/30 border text-xs">
      Didn&apos;t play
    </Badge>
  );
});

SchedulingBadge.displayName = "SchedulingBadge";

export default SchedulingBadge;