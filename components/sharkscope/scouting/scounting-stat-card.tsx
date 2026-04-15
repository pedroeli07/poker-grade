import { memo, ReactNode } from "react";

const ScoutingStatCard = memo(function ScoutingStatCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
});

ScoutingStatCard.displayName = "ScoutingStatCard";

export default ScoutingStatCard;