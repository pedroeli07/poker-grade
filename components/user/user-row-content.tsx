import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { ROLE_OPTIONS } from "@/lib/constants/session-rbac";
import { RoleBadge, StatusBadge } from "./user-badges";
import { UserDirectoryRow } from "@/lib/types/user/index";
export function UserRowContent({
  editing,
  email,
  setEmail,
  role,
  setRole,
  isBootstrap,
  row,
}: {
  editing: boolean;
  email: string;
  setEmail: (v: string) => void;
  role: UserRole;
  setRole: (v: UserRole) => void;
  isBootstrap: boolean;
  row: UserDirectoryRow;
}) {
  return editing ? (
    <div className="space-y-2 flex-1">
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-8 bg-background text-sm"
        disabled={isBootstrap}
      />
      <Select
        value={role}
        onValueChange={(v) => setRole(v as UserRole)}
        disabled={isBootstrap}
      >
        <SelectTrigger className="h-8 bg-background text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <div className="flex-1 min-w-0">
      <p className="truncate font-mono text-sm text-foreground" title={row.email}>
        {row.email}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <RoleBadge role={row.role} />
        <StatusBadge registered={row.isRegistered} />
      </div>
    </div>
  );
}