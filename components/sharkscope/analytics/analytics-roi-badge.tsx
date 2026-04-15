"use client";

import { memo } from "react";
import PlayerRoiCell from "@/components/players/table/player-roi-cell";

/** Mesmas faixas visuais da tabela de jogadores (`PlayerRoiCell`). */
const AnalyticsRoiBadge = memo(function AnalyticsRoiBadge({
  roi,
}: {
  roi: number | null;
}) {
  return <PlayerRoiCell roi={roi} />;
});

AnalyticsRoiBadge.displayName = "AnalyticsRoiBadge";

export default AnalyticsRoiBadge;
