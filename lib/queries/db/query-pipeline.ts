import { requireSession } from "@/lib/auth/session";
import { fail } from "@/lib/constants/query-result";
import { ErrorTypes, Err, RateLimitResult, ReadKey, QueryLogger } from "@/lib/types/primitives";
import { AppSession } from "@/lib/types/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { limitDashboardRead, limitGradesRead, limitImportsRead } from "@/lib/rate-limit";

export class SessionQueryPipeline {
  constructor(
    private readonly limitRead: (userId: string) => Promise<RateLimitResult>,
    private readonly rateLimitMessage: (retryAfterSec: number) => string = (s) =>
      `Muitas consultas. Aguarde ${s}s.`
  ) {}

  async readPayload<T>(fn: (session: AppSession) => Promise<T>): Promise<{ ok: true; payload: T } | Err> {
    return this.read("payload", fn);
  }

  async readRows<T>(fn: (session: AppSession) => Promise<T>): Promise<{ ok: true; rows: T } | Err> {
    return this.read("rows", fn);
  }

  async readData<T>(fn: (session: AppSession) => Promise<T>): Promise<{ ok: true; data: T } | Err> {
    return this.read("data", fn);
  }

  
  private async read<K extends ReadKey, T>(
    key: K,
    fn: (session: AppSession) => Promise<T>
  ): Promise<({ ok: true } & Record<ReadKey, T>) | Err> {
    const session = await requireSession();
    const rl = await this.limitRead(session.userId);
    if (!rl.ok) return fail(this.rateLimitMessage(rl.retryAfterSec));
    try {
      const value = await fn(session);
      return { ok: true, [key]: value } as { ok: true } & Record<ReadKey, T>;
    } catch (e) {
      return fail(e instanceof Error ? e.message : ErrorTypes.OPERATION_FAILED);
    }
  }
}

export const dashboardQueryRead = new SessionQueryPipeline(limitDashboardRead);
export const gradesQueryRead = new SessionQueryPipeline(limitGradesRead, (s) =>
  `Aguarde ${s}s e atualize a página.`
);
export const importsQueryRead = new SessionQueryPipeline(limitImportsRead);

export class ThrowingDashboardMutation {
  constructor(
    private readonly limitMut: (userId: string) => Promise<RateLimitResult>,
    private readonly log: QueryLogger,
    private readonly errorContext: string
  ) {}

  async run(
    prepare: (session: AppSession) => void,
    fn: (session: AppSession) => Promise<string[] | void>,
    revalidate: (extra: string[] | void) => void
  ): Promise<{ success: boolean }> {
    const session = await requireSession();
    prepare(session);
    const gate = await this.limitMut(session.userId);
    if (!gate.ok) throw new Error(`Aguarde ${gate.retryAfterSec}s.`);
    try {
      const extra = await fn(session);
      revalidate(extra);
      return { success: true };
    } catch (err) {
      if (isRedirectError(err)) throw err;
      this.log.error(this.errorContext, err instanceof Error ? err : undefined);
      throw err;
    }
  }
}
