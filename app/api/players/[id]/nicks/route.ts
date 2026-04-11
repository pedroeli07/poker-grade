import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeMutation, limitSharkscopeRead } from "@/lib/rate-limit";
import { addNickSchema } from "@/lib/schemas";
import { ErrorTypes } from "@/lib/types";

async function resolvePlayer(
  params: Promise<{ id: string }>,
  userId: string,
  role: UserRole
) {
  const { id } = await params;
  const player = await prisma.player.findUnique({
    where: { id },
    select: { id: true, authAccount: { select: { id: true } } },
  });
  if (!player) return null;
  if (!isSharkscopeStaffRole(role) && player.authAccount?.id !== userId) {
    return null;
  }
  return player;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeRead,
    "api/players/nicks"
  );
  if (limited) return limited;

  const player = await resolvePlayer(params, session.userId, session.role);
  if (!player) {
    return NextResponse.json({ error: ErrorTypes.NOT_FOUND }, { status: 404 });
  }

  const { id } = await params;
  const nicks = await prisma.playerNick.findMany({
    where: { playerId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, nick: true, network: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, nicks });
}

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
    "api/players/nicks/post"
  );
  if (limited) return limited;

  const player = await resolvePlayer(params, session.userId, session.role);
  if (!player) {
    return NextResponse.json({ error: ErrorTypes.NOT_FOUND }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: ErrorTypes.INVALID_JSON }, { status: 400 });
  }

  const parsed = addNickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: ErrorTypes.INVALID_DATA, details: z.flattenError(parsed.error) },
      { status: 422 }
    );
  }

  const { nick, network } = parsed.data;

  try {
    const created = await prisma.playerNick.create({
      data: { playerId: player.id, nick, network },
      select: { id: true, nick: true, network: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, nick: created }, { status: 201 });
  } catch (err: unknown) {
    const isUnique =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002";

    if (isUnique) {
      return NextResponse.json(
        { error: ErrorTypes.NICK_ALREADY_EXISTS },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: ErrorTypes.INTERNAL_ERROR }, { status: 500 });
  }
}
