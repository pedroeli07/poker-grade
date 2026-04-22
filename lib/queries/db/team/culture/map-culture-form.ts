import type { Prisma } from "@prisma/client";
import type { TeamCultureForm } from "@/lib/types/team/identity";

export function cultureFormToPrisma(d: TeamCultureForm): Prisma.TeamCultureCreateInput {
  return {
    purpose: d.purpose,
    vision: d.vision,
    mission: d.mission,
    values: d.values as Prisma.InputJsonValue,
  };
}
