import type { UserRole } from "@prisma/client";

export type IssueSessionUser = {
  id: string;
  role: UserRole;
  playerId: string | null;
  coachId: string | null;
  displayName: string | null;
  email: string;
};
