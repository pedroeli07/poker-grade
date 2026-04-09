export class BaseQueryKeys {
  constructor(public readonly base: string) {}
  get all() { return [this.base] as const; }
  protected key(...args: unknown[]) { return [...this.all, ...args] as const; }
}
