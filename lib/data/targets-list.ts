import type { AppSession } from "@/lib/auth/session";
import type { TargetListRow } from "@/lib/types/target-list-row";
import { getTargetsForSession } from "./queries";

export async function getTargetsListRowsForSession(
  session: AppSession
): Promise<TargetListRow[]> {
  const targets = await getTargetsForSession(session);
  return targets.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    playerId: t.player.id,
    playerName: t.player.name,
    status: t.status,
    targetType: t.targetType,
    limitAction: t.limitAction,
    numericValue: t.numericValue,
    numericCurrent: t.numericCurrent,
    textValue: t.textValue,
    textCurrent: t.textCurrent,
    unit: t.unit,
    coachNotes: t.coachNotes,
  }));
}
