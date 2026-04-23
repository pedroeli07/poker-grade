import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import {
  INDICATOR_AUTO_ACTION_OPTIONS,
  INDICATOR_DATA_SOURCE_OPTIONS,
  INDICATOR_FREQUENCY_OPTIONS,
  INDICATOR_RESULT_OUTCOME,
} from "@/lib/constants/team/indicators-catalog-ui";
import type { TeamIndicatorUpsert } from "@/lib/types/team/indicators";
import type { StaffSelectOption } from "@/lib/utils/team/staff-select-options-merge";

export type TeamIndicatorFormState = {
  id?: string;
  name: string;
  area: string;
  targetValue: number;
  frequency: string;
  authUserId: string | null;
  responsibleName: string;
  status: string;
  curveType: string;
  unit: string;
  currentValue: number;
  autoAction: string;
  definition: string;
  dataSource: string;
  glossary: string;
  sourceUrl: string;
  resultType: string;
};

export function emptyIndicatorForm(): TeamIndicatorFormState {
  return {
    name: "",
    area: "Geral",
    targetValue: 0,
    frequency: INDICATOR_FREQUENCY_OPTIONS[0].value,
    authUserId: null,
    responsibleName: "",
    status: "ON_TARGET",
    curveType: "RISING",
    unit: "%",
    currentValue: 0,
    autoAction: INDICATOR_AUTO_ACTION_OPTIONS[0],
    definition: "",
    dataSource: INDICATOR_DATA_SOURCE_OPTIONS[4],
    glossary: "",
    sourceUrl: "",
    resultType: INDICATOR_RESULT_OUTCOME,
  };
}

export function teamIndicatorDtoToForm(row: TeamIndicatorDTO): TeamIndicatorFormState {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    targetValue: row.targetValue,
    frequency: row.frequency,
    authUserId: row.authUserId,
    responsibleName: row.responsibleName ?? "",
    status: row.status,
    curveType: row.curveType,
    unit: row.unit,
    currentValue: row.currentValue,
    autoAction: row.autoAction,
    definition: row.definition,
    dataSource: row.dataSource,
    glossary: row.glossary ?? "",
    sourceUrl: row.sourceUrl ?? "",
    resultType: row.resultType,
  };
}

export function buildTeamIndicatorUpsert(
  form: TeamIndicatorFormState,
  staff: readonly StaffSelectOption[],
): TeamIndicatorUpsert {
  const glossary = form.glossary.trim() || null;
  const sourceUrl = form.sourceUrl.trim() || null;
  const picked = form.authUserId ? staff.find((s) => s.id === form.authUserId) : null;
  const responsibleName = (picked?.name ?? form.responsibleName).trim() || null;
  const base = {
    name: form.name.trim(),
    area: form.area.trim() || "Geral",
    targetValue: form.targetValue,
    frequency: form.frequency,
    authUserId: form.authUserId?.trim() || null,
    responsibleName,
    status: form.status,
    curveType: form.curveType,
    unit: form.unit.trim() || "%",
    currentValue: form.currentValue,
    autoAction: form.autoAction,
    definition: form.definition.trim(),
    dataSource: form.dataSource,
    glossary,
    sourceUrl,
    resultType: form.resultType,
  };
  return form.id ? { ...base, id: form.id } : base;
}
