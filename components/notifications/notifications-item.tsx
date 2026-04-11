import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_CONFIG } from "@/lib/constants";
import type { NotificationItem } from "@/lib/types";
import { memo } from "react";

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

  return (
    <div
      className={cn(
        "flex items-start gap-4 px-6 py-5 transition-colors group hover:bg-muted/30",
        !notif.read && "bg-primary/2.5",
        isSelected && "bg-primary/5"
      )}
    >
      <button
        type="button"
        onClick={onToggleSelect}
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
          isSelected ? "bg-primary border-primary" : "border-border hover:border-red-500/60"
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </button>

      <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
        <Icon className={cn("h-5 w-5", cfg.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  "text-[15px] font-semibold",
                  notif.read ? "text-foreground/70" : "text-foreground"
                )}
              >
                {notif.title}
              </p>
              {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                🕐 {format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {notif.link && (
              <Link
                href={notif.link}
                title="Abrir"
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-40 group-hover:opacity-100"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
            {!notif.read && (
              <button
                type="button"
                title="Marcar como lida"
                onClick={onMarkRead}
                className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              title="Excluir"
              onClick={onDelete}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationsItem.displayName = "NotificationsItem";

export default NotificationsItem;
