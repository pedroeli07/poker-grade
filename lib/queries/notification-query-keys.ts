export const notificationKeys = {
  all: ["notifications"] as const,
  list: (page: number, filter: "all" | "unread" | "read") =>
    [...notificationKeys.all, "list", page, filter] as const,
};
