"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { importsQueryRead } from "@/lib/queries/db/query-pipeline";
import { getImportsListRowsForSession } from "@/lib/data/imports";
import { ImportListRow } from "@/lib/types/imports/index";
import { AppSession } from "@/lib/types/auth";
import { Err } from "@/lib/types/primitives";
import { coachPlayerFilter } from "../shared";
import { UserRole } from "@prisma/client";

export async function getImportsForSession(session: AppSession) {
  const take = 50;
  const orderBy = { createdAt: "desc" as const };
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER || session.role === UserRole.VIEWER) {
    return prisma.tournamentImport.findMany({ orderBy, take });
  }
  if (session.role === UserRole.COACH && session.coachId) {
    const players = await prisma.player.findMany({
      where: coachPlayerFilter(session.coachId),
      select: { name: true, nickname: true },
    });
    const names = [...new Set(players.flatMap((p) => [p.name, p.nickname].filter(Boolean) as string[]))];
    if (names.length === 0) return [];
    return prisma.tournamentImport.findMany({
      where: { OR: names.map((n) => ({ playerName: { equals: n, mode: "insensitive" as const } })) },
      orderBy,
      take,
    });
  }
  if (session.role === UserRole.PLAYER && session.playerId) {
    const p = await prisma.player.findUnique({
      where: { id: session.playerId },
      select: { name: true, nickname: true },
    });
    if (!p) return [];
    const or: Prisma.TournamentImportWhereInput[] = [
      { playerName: { equals: p.name, mode: "insensitive" as const } },
    ];
    if (p.nickname) or.push({ playerName: { equals: p.nickname, mode: "insensitive" as const } });
    return prisma.tournamentImport.findMany({ where: { OR: or }, orderBy, take });
  }
  return [];
}

export async function filterImportIdsDeletableBySession(session: AppSession, ids: string[]): Promise<string[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER) {
    const rows = await prisma.tournamentImport.findMany({ where: { id: { in: unique } }, select: { id: true } });
    return rows.map((r) => r.id);
  }
  if (session.role === UserRole.COACH && session.coachId) {
    const players = await prisma.player.findMany({
      where: coachPlayerFilter(session.coachId),
      select: { name: true, nickname: true },
    });
    const nameSet = new Set(
      players
        .flatMap((p) => [p.name, p.nickname].filter(Boolean) as string[])
        .map((n) => n.toLowerCase())
    );
    if (nameSet.size === 0) return [];
    const imports = await prisma.tournamentImport.findMany({
      where: {
        id: { in: unique },
        OR: [...nameSet].map((n) => ({ playerName: { equals: n, mode: "insensitive" as const } })),
      },
      select: { id: true },
    });
    return imports.map((i) => i.id);
  }
  return [];
}

export async function getImportDetailForSession(session: AppSession, importId: string) {
  const importRecord = await prisma.tournamentImport.findUnique({
    where: { id: importId },
    include: {
      tournaments: {
        include: { reviewItem: { select: { id: true, status: true, isInfraction: true } } },
        orderBy: { date: "asc" },
      },
    },
  });
  if (!importRecord) return null;
  if (session.role === UserRole.PLAYER && session.playerId) {
    const player = await prisma.player.findUnique({
      where: { id: session.playerId },
      select: { name: true, nickname: true },
    });
    if (!player) return null;
    const pn = importRecord.playerName?.toLowerCase() ?? "";
    if (pn !== player.name?.toLowerCase() && pn !== player.nickname?.toLowerCase()) return null;
  }
  if (session.role === UserRole.COACH && session.coachId) {
    const players = await prisma.player.findMany({
      where: coachPlayerFilter(session.coachId),
      select: { name: true, nickname: true },
    });
    const names = players
      .flatMap((p) => [p.name, p.nickname].filter(Boolean) as string[])
      .map((n) => n.toLowerCase());
    const pn = importRecord.playerName?.toLowerCase() ?? "";
    if (!names.includes(pn)) return null;
  }
  return importRecord;
}

export async function getImportsListRowsAction(): Promise<{ ok: true; rows: ImportListRow[] } | Err> {
  const result = await importsQueryRead.readData(getImportsListRowsForSession);
  return result.ok ? { ok: true, rows: result.data } : result;
}
