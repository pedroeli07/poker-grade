import type { TargetStatus, TargetType } from "@prisma/client";
import type { PlayerRef, WithIdAndStatus } from "./primitives";

export type TargetLimitAction = "UPGRADE" | "MAINTAIN" | "DOWNGRADE" | null;

export type TargetListRow = WithIdAndStatus<TargetStatus> & {
  name: string;
  category: string;
  playerId: string;
  playerName: string;
  targetType: TargetType;
  limitAction: TargetLimitAction;
  numericValue: number | null;
  numericCurrent: number | null;
  textValue: string | null;
  textCurrent: string | null;
  unit: string | null;
  coachNotes: string | null;
};

export type TargetsPagePlayerOption = PlayerRef;
