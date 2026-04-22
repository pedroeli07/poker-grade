import { NotificationFilterType } from "@/lib/types/primitives";
import { BaseQueryKeys } from "./query-keys";

class NotificationKeys extends BaseQueryKeys {
  constructor() { super("notifications"); }
  list(page: number, filter: NotificationFilterType, pageSize: number) { return this.key("list", page, filter, pageSize); }
}
export const notificationKeys = new NotificationKeys();
