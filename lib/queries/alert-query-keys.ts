import { BaseQueryKeys } from "./query-keys";

class AlertKeys extends BaseQueryKeys {
  constructor() { super("alerts"); }
  list() { return this.key("list"); }
  detail(id: string) { return this.key("detail", id); }
}
export const alertKeys = new AlertKeys();
