"use client";

import { memo } from "react";
import NewTargetModal from "@/components/modals/new-target-modal";
import type { TargetsPagePlayerOption } from "@/lib/types/target/index";
const TargetsPageHeader = memo(function TargetsPageHeader({
  canCreate,
  players,
}: {
  canCreate: boolean;
  players: TargetsPagePlayerOption[];
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Targets e Metas</h2>
        <p className="mt-1 text-muted-foreground">
          Acompanhe ABI, ROI, Volume e gatilhos de subida/descida de limite.
        </p>
      </div>
      {canCreate && players.length > 0 ? <NewTargetModal players={players} /> : null}
    </div>
  );
});

TargetsPageHeader.displayName = "TargetsPageHeader";

export default TargetsPageHeader;
