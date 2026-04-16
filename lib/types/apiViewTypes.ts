
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

export type StatisticJson = {
  "@name"?: string;
  "@id"?: string;
  id?: string;
  /** Algumas respostas JSON usam `name` em vez de `@id`. */
  name?: string;
  $?: string | number;
};
