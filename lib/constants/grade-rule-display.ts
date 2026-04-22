import type { GradeRuleCardRule } from "@/lib/types/grade/index";
/** Chaves de `GradeRuleCardRule` mostradas como linhas com pills (ícones no componente). */
export type GradeRuleDisplayFieldKey = keyof Pick<
  GradeRuleCardRule,
  | "sites"
  | "speed"
  | "variant"
  | "tournamentType"
  | "gameType"
  | "playerCount"
  | "weekDay"
>;

export const GRADE_RULE_DISPLAY_FIELD_ROWS: ReadonlyArray<{
  key: GradeRuleDisplayFieldKey;
  label: string;
}> = [
  { key: "sites", label: "Sites" },
  { key: "speed", label: "Velocidade" },
  { key: "variant", label: "Variante" },
  { key: "tournamentType", label: "Tipo" },
  { key: "gameType", label: "Game" },
  { key: "playerCount", label: "Mesas" },
  { key: "weekDay", label: "Dia" },
];

/** Título acessível no sufixo GTD quando não há máximo. */
export const GRADE_RULE_GTD_OPEN_MAX_TITLE = "Sem limite máximo de garantido";
