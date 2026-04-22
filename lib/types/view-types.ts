import type { ComponentProps, ReactNode } from "react";

export type MatchResult = "IN_GRADE" | "SUSPECT" | "OUT_OF_GRADE";

export type MatchDetail = {
  result: MatchResult;
  matchedRuleId: string | null;
  matchedRuleName: string | null;
  reasons: string[];
};

export type TournamentData = {
  site: string;
  buyInValue: number;
  buyInCurrency?: string;
  tournamentName: string;
  speed?: string;
  date?: Date;
};

/** Nó JSON de estatística SharkScope (várias formas de id/nome). */
export type StatisticJson = {
  "@name"?: string;
  "@id"?: string;
  id?: string;
  name?: string;
  $?: string | number;
};

export type RoleVisual = { label: string; text: string; bg: string; icon: ReactNode };

export type PasswordStrengthProps = { password: string; className?: string; compact?: boolean };
export type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & { containerClassName?: string };
