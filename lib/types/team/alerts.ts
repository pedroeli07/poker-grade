type AlertBase = {
  name: string;
  area: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: string;
  authUserId: string | null;
  responsibleName: string | null;
};

export type TeamAlertRuleCreateInput = AlertBase;
export type TeamAlertRuleUpdateInput = AlertBase & { id: string };
export type TeamAlertRuleUpsert = TeamAlertRuleCreateInput & { id?: string };
