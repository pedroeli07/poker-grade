import { cardClassName } from "@/lib/constants/sharkscope/ui";
import React, { memo } from "react";

const UserStatCard = memo(function UserStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card/60 p-4 ${cardClassName}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
});

UserStatCard.displayName = "UserStatCard";

export default UserStatCard;

