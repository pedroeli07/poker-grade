import { BaseQueryKeys } from "./query-keys";

class TargetKeys extends BaseQueryKeys {
  constructor() { super("targets"); }
  list() { return this.key("list"); }
}
export const targetKeys = new TargetKeys();
