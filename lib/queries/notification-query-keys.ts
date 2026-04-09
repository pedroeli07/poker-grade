import { NotificationFilterType } from "@/lib/types";
import { BaseQueryKeys } from "./query-keys";

class NotificationKeys extends BaseQueryKeys {
  constructor() { super("notifications"); }
  list(page: number, filter: NotificationFilterType) { return this.key("list", page, filter); }
}
export const notificationKeys = new NotificationKeys();
