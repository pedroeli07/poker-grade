import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isScoutingStaffRole } from "@/lib/auth/rbac";
import { sharkScopeGet } from "@/lib/utils";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeSearch } from "@/lib/rate-limit";
import { scoutSearchQuerySchema } from "@/lib/schemas";
import { ErrorTypes } from "@/lib/types";
import { sharkscopeApiNetworkSegment } from "@/lib/constants";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !isScoutingStaffRole(session.role)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeSearch,
    "api/sharkscope/scouting-search"
  );
  if (limited) return limited;

  const parsed = scoutSearchQuerySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams.entries())
  );
  if (!parsed.success) {
    return NextResponse.json({ error: ErrorTypes.INVALID_DATA }, { status: 422 });
  }

  const { nick, network } = parsed.data;

  const appName = process.env.SHARKSCOPE_APP_NAME;
  if (!appName || !process.env.SHARKSCOPE_APP_KEY) {
    return NextResponse.json(
      { error: "SharkScope não configurado. Aguardando credenciais." },
      { status: 503 }
    );
  }

  const path = `/networks/${sharkscopeApiNetworkSegment(network)}/players/${encodeURIComponent(nick)}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants`;

  try {
    const data = await sharkScopeGet(path);
    return NextResponse.json({ ok: true, data, nickId: null });
  } catch (err) {
    console.error("[scouting-search] error", err);
    return NextResponse.json({ error: "Erro ao consultar SharkScope." }, { status: 502 });
  }
}
