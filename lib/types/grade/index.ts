import { z } from "zod";
import { updateGradeRuleSchema } from "@/lib/schemas";
import type { BaseEntity, EntityRef, WithId } from "../primitives";
import type { GradesColumnKey } from "../columnKeys";
import type { LobbyzeFilterItem } from "../lobbyzeTypes";
import type { PlayerSelectOption } from "../imports";

type BaseGradeRule = {
  filterName: string;
  sites: LobbyzeFilterItem[];
  buyInMin: number | null;
  buyInMax: number | null;
  speed: LobbyzeFilterItem[] | null;
  variant: LobbyzeFilterItem[] | null;
  prizePoolMin: number | null;
  prizePoolMax: number | null;
  minParticipants: number | null;
  excludePattern: string | null;
  fromTime: string | null;
  toTime: string | null;
  weekDay: LobbyzeFilterItem[] | null;
};

export type GradeRuleView = WithId & BaseGradeRule;
export type GradeRuleData = GradeRuleView & { tournamentType: LobbyzeFilterItem[] | null };
export type GradeRuleCardRule = WithId & {
  lobbyzeFilterId: number | null;
  gameType: LobbyzeFilterItem[];
  playerCount: LobbyzeFilterItem[];
  timezone: number | null;
  autoOnly: boolean;
  manualOnly: boolean;
  tournamentType: LobbyzeFilterItem[];
} & Omit<BaseGradeRule, "speed" | "variant" | "weekDay"> & {
  speed: LobbyzeFilterItem[];
  variant: LobbyzeFilterItem[];
  weekDay: LobbyzeFilterItem[];
};

type GradeListCore = BaseEntity & { name: string; description: string | null; assignmentsCount: number };

export type GradeDetailQueryData = GradeListCore & {
  manageRules: boolean;
  canEditNote: boolean;
  rules: GradeRuleCardRule[];
};
export type GradeListRow = GradeListCore & { rulesCount: number; assignedPlayers: EntityRef[] };
export type UpdateGradeRuleInput = Omit<z.infer<typeof updateGradeRuleSchema>, "ruleId">;
export type GradesSetCol = (col: GradesColumnKey) => (next: Set<string> | null) => void;


export type GradesListPageProps = { rows: GradeListRow[]; manage: boolean; players: PlayerSelectOption[] };
export type { PlayerSelectOption };
export type GradeDetailClientProps = { gradeId: string; initialData: GradeDetailQueryData };

export interface GradeViewProps {
    grade: GradeListRow;
    manage: boolean;
  }
  
export type GradeCardProps = GradeViewProps;
export type GradeTableRowProps = GradeViewProps;

export interface GradeAssignmentView extends WithId {
  gradeType: string;
  isActive: boolean;
  gradeProfile: EntityRef & { _count: { rules: number } };
}
export type { GradesColumnKey, GradesColumnFilters, GradesColumnOptions } from "../columnKeys";