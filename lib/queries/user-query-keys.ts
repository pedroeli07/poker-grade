import { BaseQueryKeys } from "./query-keys";

class UserKeys extends BaseQueryKeys {
  constructor() { super("users"); }
  list() { return this.key("list"); }
  detail(id: string) { return this.key("detail", id); }
}
export const userKeys = new UserKeys();
