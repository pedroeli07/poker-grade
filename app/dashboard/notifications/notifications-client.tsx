"use client";

import { memo } from "react";
import type { NotificationsPageData } from "@/lib/types";
import { useNotificationsPage } from "@/hooks/notification/use-notifications-page";
import NotificationsPageHeader from "@/components/notifications/notifications-page-header";
import NotificationsErrorState from "@/components/notifications/notifications-error-state";
import NotificationsToolbar from "@/components/notifications/notifications-toolbar";
import NotificationsListSkeleton from "@/components/notifications/notifications-list-skeleton";
import NotificationsEmptyState from "@/components/notifications/notifications-empty-state";
import NotificationsList from "@/components/notifications/notifications-list";

const NotificationsClient = memo(function NotificationsClient({
  initialData,
}: {
  initialData: NotificationsPageData;
}) {
  const {
    filter,
    selected,
    dataResolved,
    loading,
    error,
    changePage,
    changeFilter,
    toggleSelect,
    toggleAll,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
    handleDeleteSelected,
    allSelected,
  } = useNotificationsPage(initialData);

  if (error) {
    return <NotificationsErrorState error={error} />;
  }

  const unreadCount = dataResolved.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <NotificationsPageHeader unreadCount={unreadCount} onMarkAllRead={handleMarkAllRead} />

      <NotificationsToolbar
        allSelected={allSelected}
        onToggleAll={toggleAll}
        filter={filter}
        onChangeFilter={changeFilter}
        unreadCount={unreadCount}
        selectedSize={selected.size}
        onDeleteSelected={handleDeleteSelected}
        page={dataResolved.page}
        totalPages={dataResolved.totalPages}
        total={dataResolved.total}
        onChangePage={changePage}
      />

      {loading ? (
        <NotificationsListSkeleton />
      ) : dataResolved.items.length === 0 ? (
        <NotificationsEmptyState filter={filter} />
      ) : (
        <NotificationsList
          items={dataResolved.items}
          selected={selected}
          onToggleSelect={toggleSelect}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
});

NotificationsClient.displayName = "NotificationsClient";

export default NotificationsClient;
