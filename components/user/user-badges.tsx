import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

export const ROLE_VISUAL = {
  ADMIN: { label: "Admin", color: "text-red-500" },
  MANAGER: { label: "Manager", color: "text-blue-500" },
  COACH: { label: "Coach", color: "text-violet-500" },
  PLAYER: { label: "Player", color: "text-emerald-500" },
  VIEWER: { label: "Viewer", color: "text-muted-foreground" },
};

export const RoleBadge = ({ role }: { role: UserRole }) => (
  <span className={cn("text-xs font-semibold", ROLE_VISUAL[role].color)}>
    {ROLE_VISUAL[role].label}
  </span>
);

export const StatusBadge = ({ registered }: { registered: boolean }) => (
  <span className={cn("text-xs", registered ? "text-emerald-500" : "text-amber-500")}>
    {registered ? "Ativo" : "Pendente"}
  </span>
);