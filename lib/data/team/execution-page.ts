import { requireSession } from "@/lib/auth/session";
import { listTeamTasks } from "@/lib/queries/db/team/tasks/read";
import { listStaffUsersForSelect } from "@/lib/queries/db/team/staff-users";
import type { Prisma } from "@prisma/client";

function coercePriority(p: string) {
  const m: Record<string, string> = {
    Baixa: "LOW",
    Média: "MEDIUM",
    Alta: "HIGH",
    Crítica: "CRITICAL",
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
  };
  return m[p] ?? "MEDIUM";
}

export type ExecutionAuthorDTO = { id: string; displayName: string | null; email: string };

export type ExecutionTaskDTO = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  expectedResult: string | null;
  criteria: string[];
  tags: Prisma.JsonValue;
  dueAt: string | null;
  authUserId: string | null;
  responsibleName: string | null;
  assignee: ExecutionAuthorDTO | null;
};

export type ExecutionStaffOption = { id: string; name: string };

export type ExecutionPageData = {
  tasks: ExecutionTaskDTO[];
  staff: ExecutionStaffOption[];
};

export async function getExecutionPageData(): Promise<ExecutionPageData> {
  await requireSession();
  const [tasks, staff] = await Promise.all([listTeamTasks(), listStaffUsersForSelect()]);

  const serialized: ExecutionTaskDTO[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: coercePriority(t.priority),
    expectedResult: t.expectedResult,
    criteria: t.criteria,
    tags: t.tags,
    dueAt: t.dueAt ? t.dueAt.toISOString() : null,
    authUserId: t.authUserId,
    responsibleName: t.responsibleName,
    assignee: t.assignee
      ? {
          id: t.assignee.id,
          displayName: t.assignee.displayName,
          email: t.assignee.email,
        }
      : null,
  }));

  const staffList: ExecutionStaffOption[] = staff.map((u) => ({
    id: u.id,
    name: u.displayName || u.email,
  }));

  return { tasks: serialized, staff: staffList };
}
