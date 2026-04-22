type IndBase = {
  name: string;
  area: string;
  targetValue: number;
  frequency: string;
  authUserId: string | null;
  responsibleName: string | null;
  status: string;
  curveType: string;
  unit: string;
  currentValue: number;
  autoAction: string;
  definition: string;
  dataSource: string;
  glossary: string | null;
  sourceUrl: string | null;
  resultType: string;
};

export type TeamIndicatorCreateInput = IndBase;
export type TeamIndicatorUpdateInput = IndBase & { id: string };
export type TeamIndicatorUpsert = TeamIndicatorCreateInput & { id?: string };
