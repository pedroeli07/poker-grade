import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeMutation } from "@/lib/rate-limit";
import { ErrorTypes } from "@/lib/types";
import { UserRole } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeMutation,
    "api/alerts/acknowledge"
  );
  if (limited) return limited;

  const { id } = await params;

  const alert = await prisma.alertLog.findUnique({
    where: { id },
    select: { id: true, playerId: true },
  });

  if (!alert) {
    return NextResponse.json({ error: ErrorTypes.NOT_FOUND }, { status: 404 });
  }

  if (session.role === UserRole.COACH && session.coachId) {
    const player = await prisma.player.findFirst({
      where: {
        id: alert.playerId,
        OR: [{ coachId: session.coachId }, { driId: session.coachId }],
      },
      select: { id: true },
    });
    if (!player) {
      return NextResponse.json({ error: ErrorTypes.FORBIDDEN }, { status: 403 });
    }
  }

  await prisma.alertLog.update({
    where: { id },
    data: {
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: session.userId,
    },
  });

  return NextResponse.json({ ok: true });
}
