export type TargetListRow = {
  id: string;
  name: string;
  category: string;
  playerId: string;
  playerName: string;
  status: "ON_TRACK" | "ATTENTION" | "OFF_TRACK";
  targetType: "NUMERIC" | "TEXT";
  limitAction: "UPGRADE" | "MAINTAIN" | "DOWNGRADE" | null;
  numericValue: number | null;
  numericCurrent: number | null;
  textValue: string | null;
  textCurrent: string | null;
  unit: string | null;
  coachNotes: string | null;
};
