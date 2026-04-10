import { UserRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export const ROLE_VISUAL = {
  ADMIN: { label: "Admin", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  MANAGER: { label: "Manager", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  COACH: { label: "Coach", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  PLAYER: { label: "Player", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  VIEWER: { label: "Viewer", className: "bg-muted text-muted-foreground border-border/50" },
};

export const RoleBadge = ({ role }: { role: UserRole }) => (
  <Badge variant="outline" className={ROLE_VISUAL[role].className}>
    {ROLE_VISUAL[role].label}
  </Badge>
);

export const StatusBadge = ({ registered }: { registered: boolean }) => (
  <Badge
    variant="outline"
    className={
      registered
        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
    }
  >
    {registered ? "Ativo" : "Pendente"}
  </Badge>
);