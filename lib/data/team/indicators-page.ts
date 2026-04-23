import "server-only";

import { getStaffSelectOptionsWithDriMatrix } from "@/lib/data/team/staff-select-options";
import { listTeamIndicators } from "@/lib/queries/db/team/indicators/read";

export type TeamIndicatorOwnerDTO = {
  id: string;
  displayName: string | null;
  email: string;
};

export type TeamIndicatorDTO = {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  owner: TeamIndicatorOwnerDTO | null;
};

function toDto(row: Awaited<ReturnType<typeof listTeamIndicators>>[number]): TeamIndicatorDTO {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    targetValue: row.targetValue,
    frequency: row.frequency,
    authUserId: row.authUserId,
    responsibleName: row.responsibleName,
    status: row.status,
    curveType: row.curveType,
    unit: row.unit,
    currentValue: row.currentValue,
    autoAction: row.autoAction,
    definition: row.definition,
    dataSource: row.dataSource,
    glossary: row.glossary,
    sourceUrl: row.sourceUrl,
    resultType: row.resultType,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    owner: row.owner
      ? {
          id: row.owner.id,
          displayName: row.owner.displayName,
          email: row.owner.email,
        }
      : null,
  };
}

export type IndicatorsPageData = {
  indicators: TeamIndicatorDTO[];
  staffOptions: Awaited<ReturnType<typeof getStaffSelectOptionsWithDriMatrix>>;
};

export async function getIndicatorsPageData(): Promise<IndicatorsPageData> {
  const [rows, staffOptions] = await Promise.all([
    listTeamIndicators(),
    getStaffSelectOptionsWithDriMatrix(),
  ]);
  return { indicators: rows.map(toDto), staffOptions };
}
