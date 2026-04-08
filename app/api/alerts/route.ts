import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeRead } from "@/lib/rate-limit";
import { querySchema } from "@/lib/validation/schemas";


export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tooMany = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeRead,
    "api/alerts"
  );
  if (tooMany) return tooMany;

  const parsed = querySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams.entries())
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 422 });
  }

  const { severity, alertType, playerId, acknowledged } = parsed.data;
  const where: Record<string, unknown> = {};
  if (severity) where.severity = severity;
  if (alertType) where.alertType = alertType;
  if (acknowledged !== undefined) where.acknowledged = acknowledged;

  if (session.role === "COACH" && session.coachId) {
    const coachPlayers = await prisma.player.findMany({
      where: {
        OR: [{ coachId: session.coachId }, { driId: session.coachId }],
      },
      select: { id: true },
    });
    const coachPlayerIds = coachPlayers.map((p) => p.id);
    where.playerId = playerId
      ? coachPlayerIds.includes(playerId)
        ? playerId
        : "__none__"
      : { in: coachPlayerIds };
  } else if (playerId) {
    where.playerId = playerId;
  }

  const alerts = await prisma.alertLog.findMany({
    where,
    orderBy: { triggeredAt: "desc" },
    take: 200,
    include: {
      player: { select: { id: true, name: true, nickname: true } },
    },
  });

  return NextResponse.json({ ok: true, alerts });
}
