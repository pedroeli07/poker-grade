import type { Prisma } from "@prisma/client";
import type { RuleType } from "@/lib/constants/team/rule-type";

export type TeamCultureValue = {
  title: string;
  description: string;
  whatWeDo?: string;
  whatWeDont?: string;
  metrics?: { title: string; description: string; source: string }[];
};

export type TeamCultureForm = {
  purpose: string;
  vision: string;
  mission: string;
  values: Prisma.JsonValue;
};

type RuleBase = {
  title: string;
  description: string;
  type: RuleType;
  monitoring: boolean;
  severity: string;
  source: string;
  limit: string;
  consequence: string;
};

export type TeamOperationalRuleCreateInput = RuleBase;

export type TeamOperationalRuleUpdateInput = RuleBase & { id: string };

/** Com `id` atualiza; sem `id` cria. */
export type TeamOperationalRuleUpsert = TeamOperationalRuleCreateInput & { id?: string };
