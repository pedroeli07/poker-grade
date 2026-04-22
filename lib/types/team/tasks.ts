import type { Prisma } from "@prisma/client";

type TaskBase = {
  title: string;
  description: string;
  status: string;
  priority: string;
  expectedResult: string | null;
  criteria: string[];
  tags: Prisma.JsonValue;
  authUserId: string | null;
  responsibleName: string | null;
  dueAt: Date | null;
  sourceRitualId: string | null;
  sourceDecisionId: string | null;
};

export type TeamTaskCreateInput = TaskBase;
export type TeamTaskUpdateInput = TaskBase & { id: string };
export type TeamTaskUpsert = TeamTaskCreateInput & { id?: string };
