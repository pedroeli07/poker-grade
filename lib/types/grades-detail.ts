import type { GradeRuleCardRule } from "@/lib/types/grade-rule-card";

export type GradeDetailQueryData = {
  id: string;
  name: string;
  description: string | null;
  assignmentsCount: number;
  manageRules: boolean;
  canEditNote: boolean;
  rules: GradeRuleCardRule[];
};
