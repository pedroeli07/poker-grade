import { BaseQueryKeys } from "./query-keys";

class GradeKeys extends BaseQueryKeys {
  constructor() { super("grades"); }
  list() { return this.key("list"); }
  detail(id: string) { return this.key("detail", id); }
}
export const gradeKeys = new GradeKeys();
