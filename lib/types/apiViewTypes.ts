import type { PlayerStatus } from "@prisma/client";
import type { BaseEntity, EntityRef, PlayerRef, WithId, WithIdAndStatus } from "./primitives";
import type { PlayerNameFields } from "./playerTypes";

export interface GradeAssignmentView extends WithId {
  gradeType: string;
  isActive: boolean;
  gradeProfile: EntityRef & { _count: { rules: number } };
}

export interface PlayerWithRelations extends WithIdAndStatus<PlayerStatus>, PlayerNameFields {
  avatarUrl: string | null;
  coach: EntityRef | null;
  dri: EntityRef | null;
  gradeAssignments: GradeAssignmentView[];
  _count: { targets: number; playedTournaments: number; reviewItems: number };
}

export interface ReviewItemView extends BaseEntity, WithIdAndStatus<string> {
  player: PlayerRef;
  tournament: WithId & {
    date: string;
    site: string;
    buyInValue: number;
    tournamentName: string;
    speed: string | null;
    matchStatus: string;
  };
  justification: string | null;
  reviewNotes: string | null;
  isInfraction: boolean;
}

export type MatchResult = "IN_GRADE" | "SUSPECT" | "OUT_OF_GRADE";

export interface MatchDetail {
  result: MatchResult;
  matchedRuleId: string | null;
  matchedRuleName: string | null;
  reasons: string[];
}

export interface TournamentData {
  site: string;
  buyInValue: number;
  buyInCurrency?: string;
  tournamentName: string;
  speed?: string;
  date?: Date;
}

export type StatisticJson = { "@name"?: string; "@id"?: string; id?: string; $?: string | number };
