import { BaseQueryKeys } from "./query-keys";

class ImportKeys extends BaseQueryKeys {
  constructor() { super("imports"); }
  list() { return this.key("list"); }
}
export const importKeys = new ImportKeys();
