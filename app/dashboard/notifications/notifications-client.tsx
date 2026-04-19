"use client";

import { memo, useState } from "react";
import type { NotificationsPageData } from "@/lib/types";
import { useNotificationsPage } from "@/hooks/notification/use-notifications-page";
import NotificationsPageHeader from "@/components/notifications/notifications-page-header";
import NotificationsErrorState from "@/components/notifications/notifications-error-state";
import NotificationsToolbar from "@/components/notifications/notifications-toolbar";
import NotificationsListSkeleton from "@/components/notifications/notifications-list-skeleton";
import NotificationsEmptyState from "@/components/notifications/notifications-empty-state";
import NotificationsList from "@/components/notifications/notifications-list";
import NotificationsDeleteDialog from "@/components/notifications/notifications-delete-dialog";

const NotificationsClient = memo(function NotificationsClient({
  initialData,
}: {
  initialData: NotificationsPageData;
}) {
  const {
    page,
    pageSize,
    filter,
    typeFilters,
    searchText,
    dateFrom,
    dateTo,
    viewMode,
    selected,
    dataResolved,
    loading,
    error,
    changePage,
    changePageSize,
    changeFilter,
    changeTypeFilters,
    changeSearchText,
    changeDateRange,
    changeViewMode,
    toggleSelect,
    toggleAll,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
    handleDeleteSelected,
    allSelected,
    isPending,
  } = useNotificationsPage(initialData);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single'; id: string } | { type: 'multiple' } | null>(null);

  if (error) {
    return <NotificationsErrorState error={error} />;
  }

  const unreadCount = dataResolved?.unreadCount ?? initialData.unreadCount ?? 0;

  const toolbarPage = dataResolved?.page ?? page;
  const toolbarPageSize = dataResolved?.pageSize ?? pageSize;
  const toolbarTotalPages = dataResolved?.totalPages ?? 1;
  const toolbarTotal = dataResolved?.total ?? 0;

  return (
    <div className="space-y-6">
      <NotificationsPageHeader unreadCount={unreadCount} onMarkAllRead={handleMarkAllRead} />

      <NotificationsToolbar
        allSelected={allSelected}
        onToggleAll={toggleAll}
        filter={filter}
        onChangeFilter={changeFilter}
        typeFilters={typeFilters}
        onChangeTypeFilters={changeTypeFilters}
        unreadCount={unreadCount}
        selectedSize={selected.size}
        onDeleteSelected={() => setDeleteConfirm({ type: "multiple" })}
        page={toolbarPage}
        pageSize={toolbarPageSize}
        totalPages={toolbarTotalPages}
        total={toolbarTotal}
        onChangePage={changePage}
        onChangePageSize={changePageSize}
        viewMode={viewMode}
        onChangeViewMode={changeViewMode}
        showTypeFilterInToolbar={viewMode === "cards"}
      />

      {loading || dataResolved === null ? (
        <NotificationsListSkeleton />
      ) : dataResolved.items.length === 0 ? (
        <NotificationsEmptyState filter={filter} />
      ) : (
        <NotificationsList
          items={dataResolved.items}
          viewMode={viewMode}
          selected={selected}
          onToggleSelect={toggleSelect}
          onMarkRead={handleMarkRead}
          onDelete={(id) => setDeleteConfirm({ type: "single", id })}
          typeFilters={typeFilters}
          onChangeTypeFilters={changeTypeFilters}
          searchText={searchText}
          onApplySearch={changeSearchText}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onApplyDateRange={changeDateRange}
        />
      )}

      <NotificationsDeleteDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
        count={deleteConfirm?.type === "multiple" ? selected.size : 1}
        disabled={isPending}
        onConfirm={() => {
          if (deleteConfirm?.type === "single") {
            handleDelete(deleteConfirm.id, () => setDeleteConfirm(null));
          } else if (deleteConfirm?.type === "multiple") {
            handleDeleteSelected(() => setDeleteConfirm(null));
          }
        }}
      />
    </div>
  );
});

NotificationsClient.displayName = "NotificationsClient";

export default NotificationsClient;
