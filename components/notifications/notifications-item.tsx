import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_CONFIG } from "@/lib/constants";
import type { NotificationItem } from "@/lib/types";
import { memo } from "react";
import { normalizeNotificationLink } from "@/lib/utils/notification";

const NotificationsItem = memo(function NotificationsItem({
  notif,
  isSelected,
  onToggleSelect,
  onMarkRead,
  onDelete,
}: {
  notif: NotificationItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  const Icon = cfg.icon;
  const resolvedLink = normalizeNotificationLink(notif.link);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-5 rounded-xl border shadow-sm transition-all group hover:shadow-md relative",
        notif.read ? "bg-white border-border" : "bg-slate-200 border-primary/30",
        isSelected &&
          "border-destructive/35 bg-red-50 ring-2 ring-destructive/25 dark:bg-destructive/15 dark:border-destructive/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSelect}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
              isSelected ? "bg-primary border-primary" : "border-border hover:border-primary/60"
            )}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </button>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
            <Icon className={cn("h-5 w-5", cfg.color)} />
          </div>
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider", cfg.bg, cfg.color)}>
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 bg-muted/30 rounded-lg p-1">
          {resolvedLink && (
            <Link
              href={resolvedLink}
              title="Abrir"
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          {!notif.read && (
            <button
              type="button"
              title="Marcar como lida"
              onClick={onMarkRead}
              className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            title="Excluir"
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
          <p
            className={cn(
              "text-[15px] font-semibold leading-tight",
              notif.read ? "text-foreground/80" : "text-foreground"
            )}
          >
            {notif.title}
          </p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1 mt-1">
          {notif.message}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <span className="text-[10px]">🕒</span> {format(new Date(notif.createdAt), "dd MMM yyyy • HH:mm", { locale: ptBR })}
        </span>
      </div>
    </div>
  );
});

NotificationsItem.displayName = "NotificationsItem";

export default NotificationsItem;
