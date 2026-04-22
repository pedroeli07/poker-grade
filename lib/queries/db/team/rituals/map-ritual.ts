import type { Prisma } from "@prisma/client";
import type { TeamRitualCreateInput } from "@/lib/types/team/rituals";

export function toRitualPrismaData(d: TeamRitualCreateInput): Prisma.TeamRitualCreateInput {
  return { ...d, agenda: d.agenda as Prisma.InputJsonValue };
}
