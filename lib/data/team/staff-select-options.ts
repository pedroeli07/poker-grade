import "server-only";

import { listAssignableStaffUsersForSelect } from "@/lib/queries/db/team/staff-users";
import { findAuthUsersByExactDisplayNames, listTeamDri } from "@/lib/queries/db/team/governance/dri-read";
import {
  mergeStaffSelectOptionsWithDriMatrix,
  type StaffSelectOption,
} from "@/lib/utils/team/staff-select-options-merge";

export type { StaffSelectOption };

export async function getStaffSelectOptionsWithDriMatrix(): Promise<StaffSelectOption[]> {
  const [staff, dris] = await Promise.all([
    listAssignableStaffUsersForSelect(),
    listTeamDri(),
  ]);
  const driNamesOnly = dris
    .filter((d) => !d.authUserId && d.responsibleName?.trim())
    .map((d) => d.responsibleName!.trim());
  const resolvedUsers = await findAuthUsersByExactDisplayNames(driNamesOnly);
  return mergeStaffSelectOptionsWithDriMatrix(staff, dris, resolvedUsers);
}
