import { requireSession } from "@/lib/auth/session";
import { getCulturaEmAcaoDataForSession, type CulturaEmAcaoData } from "@/lib/data/team/cultura-em-acao";
import { getTeamCulture, listTeamOperationalRules } from "@/lib/queries/db/team/culture/read";
import {
  RULE_TYPE_MANDATORY,
  RULE_TYPE_RECOMMENDATION,
  coerceRuleType,
} from "@/lib/constants/team/rule-type";
import type { TeamCultureValue } from "@/lib/types/team/identity";
import type { TeamCulture } from "@prisma/client";
import type { TeamOperationalRule } from "@prisma/client";

function parseCultureValues(v: unknown): TeamCultureValue[] {
  return Array.isArray(v) ? (v as TeamCultureValue[]) : [];
}

export type IdentityPageData = {
  cultura: TeamCulture | null;
  valores: TeamCultureValue[];
  mandatoryRules: TeamOperationalRule[];
  recommendationRules: TeamOperationalRule[];
  culturaEmAcao: CulturaEmAcaoData;
};

export async function getIdentityPageData(): Promise<IdentityPageData> {
  const session = await requireSession();
  const [cultura, regras, culturaEmAcao] = await Promise.all([
    getTeamCulture(),
    listTeamOperationalRules(),
    getCulturaEmAcaoDataForSession(session),
  ]);
  const valores = parseCultureValues(cultura?.values);
  const mandatoryRules = regras.filter((r) => coerceRuleType(r.type) === RULE_TYPE_MANDATORY);
  const recommendationRules = regras.filter(
    (r) => coerceRuleType(r.type) === RULE_TYPE_RECOMMENDATION,
  );
  return { cultura, valores, mandatoryRules, recommendationRules, culturaEmAcao };
}
