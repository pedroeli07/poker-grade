import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { getOrFetchSharkScope } from "@/lib/sharkscope-cache";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeRead } from "@/lib/rate-limit";
import { playerQuerySchema } from "@/lib/schemas";
import { sharkScopeGet } from "@/lib/utils";
import { DATA_TYPE_CONFIG } from "@/lib/constants";
import { ErrorTypes } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role))
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });

  const limited = await enforceUserRate(req, session.userId, limitSharkscopeRead, "api/sharkscope/player");
  if (limited) return limited;

  const parsed = playerQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success)
    return NextResponse.json({ error: ErrorTypes.INVALID_DATA, details: z.flattenError(parsed.error) }, { status: 422 });

  const { nickId, dataType, filter } = parsed.data;

  const nick = await prisma.playerNick.findUnique({ where: { id: nickId }, select: { id: true, nick: true, network: true, isActive: true } });
  if (!nick) return NextResponse.json({ error: "Nick não encontrado." }, { status: 404 });
  if (!nick.isActive) return NextResponse.json({ error: "Nick inativo." }, { status: 400 });
  if (!process.env.SHARKSCOPE_APP_NAME || !process.env.SHARKSCOPE_APP_KEY)
    return NextResponse.json({ error: "SharkScope não configurado. Aguardando credenciais." }, { status: 503 });

  const cfg = DATA_TYPE_CONFIG[dataType] ?? { pathSuffix: "", defaultQuery: "", ttlHours: 24 };
  const query = filter ? `?filter=${encodeURIComponent(filter)}` : cfg.defaultQuery;
  const apiPath = `/networks/${nick.network}/players/${encodeURIComponent(nick.nick)}${cfg.pathSuffix}${query}`;

  try {
    const data = await getOrFetchSharkScope(nick.id, dataType, `${cfg.pathSuffix}|${query || "default"}`, () => sharkScopeGet(apiPath), cfg.ttlHours);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[sharkscope/player] fetch error", err);
    return NextResponse.json({ error: "Erro ao consultar SharkScope." }, { status: 502 });
  }
}
