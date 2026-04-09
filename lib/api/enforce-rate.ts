import { NextResponse } from "next/server";
import { clientIp } from "@/lib/api/origin";
import { logRateLimited } from "@/lib/security-log";
import { UserLimiter } from "@/lib/types";

export async function enforceUserRate(
  req: Request,
  userId: string,
  limiter: UserLimiter,
  routeLabel: string
): Promise<NextResponse | null> {
  const { ok, retryAfterSec } = await limiter(userId);
  if (ok) return null;
  logRateLimited(routeLabel, clientIp(req));
  return NextResponse.json(
    { error: "Muitas requisições. Aguarde e tente novamente." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}
