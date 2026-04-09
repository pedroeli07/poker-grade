import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeSearch } from "@/lib/rate-limit";
import { bodySchema } from "@/lib/schemas";
import { sharkScopeGet } from "@/lib/utils";
import { sharkScopeAppKey, sharkScopeAppName } from "@/lib/constants";
import { ErrorTypes } from "@/lib/types";

const log = createLogger("sharkscope.nlq");

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeSearch,
    "api/sharkscope/nlq"
  );
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: ErrorTypes.INVALID_JSON }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: ErrorTypes.INVALID_DATA, details: z.flattenError(parsed.error) },
      { status: 422 }
    );
  }

  const { playerNickId, question, timezone } = parsed.data;

  
  if (!sharkScopeAppName || !sharkScopeAppKey) {
    return NextResponse.json(
      { error: "SharkScope não configurado. Aguardando credenciais." },
      { status: 503 }
    );
  }

  const playerNick = await prisma.playerNick.findUnique({
    where: { id: playerNickId },
    select: { id: true, nick: true, network: true, isActive: true },
  });

  if (!playerNick || !playerNick.isActive) {
    return NextResponse.json({ error: "Nick não encontrado ou inativo." }, { status: 404 });
  }

  const path = `/networks/${playerNick.network}/players/${encodeURIComponent(playerNick.nick)}?nlq=${encodeURIComponent(question)}&timezone=${encodeURIComponent(timezone)}`;

  try {
    log.info("NLQ SharkScope", { nick: playerNick.nick, question });
    const data = await sharkScopeGet(path);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    log.error("NLQ SharkScope falhou", err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "Erro ao consultar SharkScope." },
      { status: 502 }
    );
  }
}
