import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth/session";
import { coachNestedPlayerWhere } from "../shared";

export async function getAlertLogsForSharkscopeDashboard(session: AppSession) {
  const where = coachNestedPlayerWhere(session);
  return prisma.alertLog.findMany({
    where,
    orderBy: { triggeredAt: "desc" },
    take: 300,
    include: { player: { select: { id: true, name: true, nickname: true } } },
  });
}
