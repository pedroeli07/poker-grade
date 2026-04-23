import { requireSession } from "@/lib/auth/session";
import {
  findAuthUsersByExactDisplayNames,
  listTeamDri,
} from "@/lib/queries/db/team/governance/dri-read";
import { listTeamRituals } from "@/lib/queries/db/team/rituals/read";
import { listStaffUsersForSelect } from "@/lib/queries/db/team/staff-users";
import { mergeStaffSelectOptionsWithDriMatrix } from "@/lib/utils/team/staff-select-options-merge";

export type RitualDTO = {
  id: string;
  name: string;
  ritualType: string;
  area: string;
  description: string;
  driId: string | null;
  responsibleName: string | null;
  agenda: unknown;
  startAt: string;
  durationMin: number;
  recurrence: string;
  dri: { id: string; displayName: string | null; email: string } | null;
  executions: { id: string; executedAt: string; notes: string }[];
};

export type RitualStaffOption = { id: string; name: string };

export type RitualsPageData = {
  rituals: RitualDTO[];
  staff: RitualStaffOption[];
};

function mergeRitualStaffOptions(
  staff: Awaited<ReturnType<typeof listStaffUsersForSelect>>,
  dris: Awaited<ReturnType<typeof listTeamDri>>,
  resolvedFromFreeText: { id: string; displayName: string | null; email: string }[],
): RitualStaffOption[] {
  return mergeStaffSelectOptionsWithDriMatrix(staff, dris, resolvedFromFreeText);
}

export async function getRitualsPageData(): Promise<RitualsPageData> {
  await requireSession();
  const [rituais, staff, dris] = await Promise.all([
    listTeamRituals(),
    listStaffUsersForSelect(),
    listTeamDri(),
  ]);

  const serialized: RitualDTO[] = rituais.map((r) => ({
    id: r.id,
    name: r.name,
    ritualType: r.ritualType,
    area: r.area,
    description: r.description,
    driId: r.driId,
    responsibleName: r.responsibleName,
    agenda: r.agenda,
    startAt: r.startAt.toISOString(),
    durationMin: r.durationMin,
    recurrence: r.recurrence,
    dri: r.dri ? { id: r.dri.id, displayName: r.dri.displayName, email: r.dri.email } : null,
    executions: r.executions.map((e) => ({
      id: e.id,
      executedAt: e.executedAt.toISOString(),
      notes: e.notes,
    })),
  }));

  const driNamesOnly = dris
    .filter((d) => !d.authUserId && d.responsibleName?.trim())
    .map((d) => d.responsibleName!.trim());
  const resolvedUsers = await findAuthUsersByExactDisplayNames(driNamesOnly);
  const staffList = mergeRitualStaffOptions(staff, dris, resolvedUsers);

  return { rituals: serialized, staff: staffList };
}
