import type { Prisma } from "@prisma/client";

type RitualBase = {
  name: string;
  ritualType: string;
  area: string;
  description: string;
  driId: string | null;
  responsibleName: string | null;
  agenda: Prisma.JsonValue;
  startAt: Date;
  durationMin: number;
  recurrence: string;
};

export type TeamRitualCreateInput = RitualBase;
export type TeamRitualUpdateInput = RitualBase & { id: string };
export type TeamRitualUpsert = TeamRitualCreateInput & { id?: string };

export type TeamRitualExecutionInput = {
  ritualId: string;
  checklist: Prisma.JsonValue;
  notes: string;
  attendance: Prisma.JsonValue;
};
