import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeMutation } from "@/lib/rate-limit";
import { updateNickSchema } from "@/lib/schemas/player";
import { ErrorTypes } from "@/lib/types/primitives";
import { ResolveNickProps } from "@/lib/types/player/index";
async function resolveNick(
  props: ResolveNickProps
) {
  const { playerId, nickId, userId, role } = props;
  const nick = await prisma.playerNick.findFirst({
    where: { id: nickId, playerId },
    include: { player: { select: { authAccount: { select: { id: true } } } } },
  });
  if (!nick) return null;
  if (!isSharkscopeStaffRole(role) && nick.player.authAccount?.id !== userId) {
    return null;
  }
  return nick;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; nickId: string }> }
) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeMutation,
    "api/players/nicks/put"
  );
  if (limited) return limited;

  const { id, nickId } = await params;
  const nick = await resolveNick({ playerId: id, nickId, userId: session.userId, role: session.role });
  if (!nick) {
    return NextResponse.json({ error: ErrorTypes.NOT_FOUND }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: ErrorTypes.INVALID_JSON }, { status: 400 });
  }

  const parsed = updateNickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: ErrorTypes.INVALID_DATA, details: z.flattenError(parsed.error) },
      { status: 422 }
    );
  }

  try {
    const updated = await prisma.playerNick.update({
      where: { id: nickId },
      data: parsed.data,
      select: { id: true, nick: true, network: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, nick: updated });
  } catch {
    return NextResponse.json({ error: ErrorTypes.INTERNAL_ERROR }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; nickId: string }> }
) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeMutation,
    "api/players/nicks/delete"
  );
  if (limited) return limited;

  const { id, nickId } = await params;
  const nick = await resolveNick({ playerId: id, nickId, userId: session.userId, role: session.role });
  if (!nick) {
    return NextResponse.json({ error: ErrorTypes.NOT_FOUND }, { status: 404 });
  }

  await prisma.playerNick.delete({ where: { id: nickId } });
  return NextResponse.json({ ok: true });
}
