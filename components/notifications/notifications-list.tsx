import type { NotificationItem } from "@/lib/types";
import NotificationsItem from "@/components/notifications/notifications-item";
import { memo } from "react";
import { NotificationType } from "@prisma/client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Check, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_CONFIG } from "@/lib/constants";
import ColumnFilter from "@/components/column-filter";
import { TYPE_LABELS } from "@/lib/constants/notification";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import {
  NotificationTextSearchFilter,
  NotificationDateRangeFilter,
} from "@/components/notifications/notifications-table-column-filters";
import { normalizeNotificationLink } from "@/lib/utils/notification";

const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

const NotificationsList = memo(function NotificationsList({
  items,
  viewMode,
  selected,
  allSelected,
  onToggleAll,
  onToggleSelect,
  onMarkRead,
  onDelete,
  typeFilters,
  onChangeTypeFilters,
  searchText,
  onApplySearch,
  dateFrom,
  dateTo,
  onApplyDateRange,
}: {
  items: NotificationItem[];
  viewMode: "cards" | "table";
  selected: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  typeFilters: Set<NotificationType>;
  onChangeTypeFilters: (next: Set<NotificationType> | null) => void;
  searchText: string | null;
  onApplySearch: (next: string | null) => void;
  dateFrom: string | null;
  dateTo: string | null;
  onApplyDateRange: (next: { dateFrom: string | null; dateTo: string | null }) => void;
}) {
  if (viewMode === "table") {
    return (
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border bg-blue-500/20 text-left text-base font-semibold text-foreground">
              <tr>
                <th className="w-10 px-4 py-3 text-center align-middle">
                  <button
                    type="button"
                    onClick={onToggleAll}
                    disabled={items.length === 0}
                    className={cn(
                      "mx-auto flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors shadow-sm",
                      allSelected && items.length > 0
                        ? "border-primary bg-primary shadow-none"
                        : "border-foreground/35 bg-white hover:border-primary/70",
                      items.length === 0 && "cursor-not-allowed opacity-40"
                    )}
                    aria-label={
                      allSelected && items.length > 0
                        ? "Desmarcar todas nesta página"
                        : "Selecionar todas nesta página"
                    }
                  >
                    {allSelected && items.length > 0 ? (
                      <Check className="h-3 w-3 text-white" />
                    ) : null}
                  </button>
                </th>
                <th className="px-4 py-3 align-middle normal-case">
                  <div className="flex items-center gap-0.5">
                    <ColumnFilter
                      columnId="type"
                      ariaLabel="Tipo"
                      label={
                        <FilteredColumnTitle active={typeFilters.size > 0}>Tipo</FilteredColumnTitle>
                      }
                      options={typeOptions}
                      applied={typeFilters.size > 0 ? typeFilters : null}
                      onApply={onChangeTypeFilters as (next: Set<string> | null) => void}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 align-middle normal-case">
                  <NotificationTextSearchFilter applied={searchText} onApply={onApplySearch} />
                </th>
                <th className="px-4 py-3 align-middle normal-case">
                  <NotificationDateRangeFilter
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onApply={onApplyDateRange}
                  />
                </th>
                <th className="px-4 py-3 text-right align-middle font-semibold tracking-wide text-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type];
                const Icon = cfg.icon;
                const isSelected = selected.has(notif.id);
                const resolvedLink = normalizeNotificationLink(notif.link);

                return (
                  <tr
                    key={notif.id}
                    className={cn(
                      "transition-colors group rounded-xl border-2",
                      !notif.read && !isSelected && "bg-blue-200/20 border-blue-200 border-2",
                      isSelected &&
                        "border-destructive/35 bg-red-50 dark:bg-destructive/15 dark:border-destructive/40"
                    )}
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(notif.id)}
                        className={cn(
                          "mx-auto flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border shadow-sm transition-colors",
                          isSelected
                            ? "border-primary bg-primary shadow-none"
                            : "border-foreground/35 bg-white hover:border-primary/70"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap", cfg.bg, cfg.color)}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", notif.read ? "text-foreground/80" : "text-foreground")}>
                            {notif.title}
                          </span>
                          {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <span className="text-muted-foreground line-clamp-1">{notif.message}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {format(new Date(notif.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {resolvedLink && (
                          <Link
                            href={resolvedLink}
                            title="Abrir"
                            className="p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        {!notif.read && (
                          <button
                            type="button"
                            title="Marcar como lida"
                            onClick={() => onMarkRead(notif.id)}
                            className="p-1.5 rounded-md hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors cursor-pointer"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Excluir"
                          onClick={() => onDelete(notif.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((notif) => (
        <NotificationsItem
          key={notif.id}
          notif={notif}
          isSelected={selected.has(notif.id)}
          onToggleSelect={() => onToggleSelect(notif.id)}
          onMarkRead={() => onMarkRead(notif.id)}
          onDelete={() => onDelete(notif.id)}
        />
      ))}
    </div>
  );
});

NotificationsList.displayName = "NotificationsList";

export default NotificationsList;
