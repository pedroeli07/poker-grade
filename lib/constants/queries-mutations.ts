import { UserRole } from "@prisma/client";
import { createLogger } from "@/lib/logger";
import { limitDashboardMutation } from "@/lib/rate-limit";
import { ThrowingDashboardMutation } from "@/lib/queries/db/query-pipeline";

export const notificationsQueriesLog = createLogger("notifications.queries");
export const insertLog = createLogger("notifications");

export const importsQueriesLog = createLogger("imports.queries");

export const gradesQueriesLog = createLogger("grades.queries");

export const userQueriesLog = createLogger("users.queries");

export const USERS_MANAGE_ROLES = [UserRole.ADMIN, UserRole.MANAGER] as const;

export const targetsQueriesLog = createLogger("targets.queries");

export const targetMutations = new ThrowingDashboardMutation(
  limitDashboardMutation,
  targetsQueriesLog,
  "Erro na mutation de target"
);

export const reviewQueriesLog = createLogger("review.queries");

export const reviewMutations = new ThrowingDashboardMutation(
  limitDashboardMutation,
  reviewQueriesLog,
  "Erro na mutation de review"
);

export const playerQueriesLog = createLogger("players.queries");
export const playerMutations = new ThrowingDashboardMutation(
  limitDashboardMutation,
  playerQueriesLog,
  "Erro na mutation de player"
);
