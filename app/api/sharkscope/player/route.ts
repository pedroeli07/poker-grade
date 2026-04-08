import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { sharkScopeGet } from "@/lib/sharkscope";
import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeRead } from "@/lib/rate-limit";
import { playerQuerySchema } from "@/lib/validation/schemas";

/** pathSuffix: após /players/{nick} — doc §3.3.15 insights em …/players/{nick}/insights */
const DATA_TYPE_CONFIG: Record<
  string,
  { pathSuffix: string; defaultQuery: string; ttlHours: number }
> = {
  stats_10d: { pathSuffix: "", defaultQuery: "?filter=Date:10D", ttlHours: 24 },
  stats_30d: { pathSuffix: "", defaultQuery: "?filter=Date:30D", ttlHours: 24 },
  stats_90d: { pathSuffix: "", defaultQuery: "?filter=Date:90D", ttlHours: 24 },
  summary: { pathSuffix: "", defaultQuery: "", ttlHours: 12 },
  insights: { pathSuffix: "/insights", defaultQuery: "", ttlHours: 24 },
};

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeRead,
    "api/sharkscope/player"
  );
  if (limited) return limited;

  const parsed = playerQuerySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams.entries())
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", details: z.flattenError(parsed.error) },
      { status: 422 }
    );
  }

  const { nickId, dataType, filter } = parsed.data;

  const playerNick = await prisma.playerNick.findUnique({
    where: { id: nickId },
    select: { id: true, nick: true, network: true, isActive: true },
  });

  if (!playerNick) {
    return NextResponse.json({ error: "Nick não encontrado." }, { status: 404 });
  }

  if (!playerNick.isActive) {
    return NextResponse.json({ error: "Nick inativo." }, { status: 400 });
  }

  const appName = process.env.SHARKSCOPE_APP_NAME;
  if (!appName || !process.env.SHARKSCOPE_APP_KEY) {
    return NextResponse.json(
      { error: "SharkScope não configurado. Aguardando credenciais." },
      { status: 503 }
    );
  }

  const cfg = DATA_TYPE_CONFIG[dataType] ?? {
    pathSuffix: "",
    defaultQuery: "",
    ttlHours: 24,
  };
  const query = filter
    ? `?filter=${encodeURIComponent(filter)}`
    : cfg.defaultQuery;

  const filterKey = `${cfg.pathSuffix}|${query || "default"}`;
  const apiPath = `/networks/${playerNick.network}/players/${encodeURIComponent(playerNick.nick)}${cfg.pathSuffix}${query}`;

  try {
    const data = await getOrFetchSharkScope(
      playerNick.id,
      dataType,
      filterKey,
      () => sharkScopeGet(apiPath),
      cfg.ttlHours
    );

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[sharkscope/player] fetch error", err);
    return NextResponse.json(
      { error: "Erro ao consultar SharkScope." },
      { status: 502 }
    );
  }
}
