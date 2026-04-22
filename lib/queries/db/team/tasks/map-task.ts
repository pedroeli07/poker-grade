import type { Prisma } from "@prisma/client";
import type { TeamTaskCreateInput } from "@/lib/types/team/tasks";

export function toTaskPrismaData(d: TeamTaskCreateInput): Prisma.TeamTaskCreateInput {
  return { ...d, tags: d.tags as Prisma.InputJsonValue };
}
