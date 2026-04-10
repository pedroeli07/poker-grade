"use server";

import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth/session";
import { assertCanWrite } from "@/lib/auth/rbac";
import { dashboardQueryRead } from "@/lib/queries/db/query-pipeline";
import { getPlayersTablePayloadForSession } from "@/lib/data/players-table";
import { createPlayerFormSchema, updatePlayerFormSchema, idParamSchema } from "@/lib/schemas";
import { sanitizeOptional, sanitizeText } from "@/lib/utils";
import { notifyPlayerCreated } from "@/lib/queries/db/notification-queries";
import { setPlayerMainGrade } from "@/lib/data/player-main-grade";
import { syncPlayerAbiAlvoTarget } from "@/lib/data/player-abi-target";
import { parseAbiAlvoInput } from "@/lib/utils";
import { coachPlayerFilter } from "./shared";
import { playerMutations, playerQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidatePlayers } from "@/lib/constants/revalidate-app";
import { GradeType, PlayerStatus, UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types";

export async function getPlayersForSession(session: AppSession) {
  const base = {
    include: {
      coach: true,
      gradeAssignments: {
        where: { isActive: true, gradeType: GradeType.MAIN },
        include: { gradeProfile: true },
      },
      nicks: true,
    },
    orderBy: { name: "asc" as const },
  };

  switch (session.role) {
    case UserRole.ADMIN: case UserRole.MANAGER: case UserRole.VIEWER:
      return prisma.player.findMany({ ...base, where: {} });
    case UserRole.COACH:
      if (!session.coachId) return [];
      return prisma.player.findMany({ ...base, where: coachPlayerFilter(session.coachId) });
    case UserRole.PLAYER:
      if (!session.playerId) return [];
      return prisma.player.findMany({ ...base, where: { id: session.playerId } });
    default: return [];
  }
}

export async function getPlayersTableDataAction() {
  return dashboardQueryRead.readPayload(getPlayersTablePayloadForSession);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createPlayer(formData: FormData) {
  return playerMutations.run(assertCanWrite, async (session) => {
    const parsed = createPlayerFormSchema.safeParse({
      name: formData.get("name"),
      nickname: formData.get("nickname") || null,
      email: formData.get("email") || "",
      coachId: formData.get("coachId") || "none",
      mainGradeId: formData.get("mainGradeId") || "none",
      abiAlvoValue: String(formData.get("abiAlvoValue") ?? ""),
      abiAlvoUnit: String(formData.get("abiAlvoUnit") ?? ""),
      playerGroup: formData.get("playerGroup") || null,
    });

    if (!parsed.success) {
      playerQueriesLog.warn("createPlayer validação Zod falhou");
      throw new Error(ErrorTypes.INVALID_DATA);
    }

    let coachId = parsed.data.coachId === "none" || parsed.data.coachId === "" ? null : parsed.data.coachId;
    if (session.role === UserRole.COACH) coachId = session.coachId;

    const name = sanitizeText(parsed.data.name, 200);
    const nickname = sanitizeOptional(parsed.data.nickname, 120);
    const playerGroup = sanitizeOptional(parsed.data.playerGroup, 120);
    let email = parsed.data.email;
    if (email === "") email = undefined;
    if (email) email = sanitizeText(email, 320);

    const abiParsed = parseAbiAlvoInput(parsed.data.abiAlvoValue, parsed.data.abiAlvoUnit);
    if (!abiParsed.ok) throw new Error(abiParsed.message);

    let parsedNicks: { network: string; nick: string }[] = [];
    try {
      if (parsed.data.nicksData) {
        const parsedArr = JSON.parse(parsed.data.nicksData);
        if (Array.isArray(parsedArr)) {
          parsedNicks = parsedArr.map((n) => ({
            network: String(n.network).trim(),
            nick: String(n.nick).trim(),
          })).filter(n => n.nick.length > 0 && n.network.length > 0);
        }
      }
    } catch (e) {
      playerQueriesLog.error("Falha ao fazer parse dos Nicks", e instanceof Error ? e : undefined, { nicksData: parsed.data.nicksData });
    }

    playerQueriesLog.info("Criando jogador", { name, hasCoach: Boolean(coachId) });

    let player;
    try {
      player = await prisma.player.create({
        data: {
          name, nickname, email: email ?? null,
          coachId, status: PlayerStatus.ACTIVE, playerGroup,
          nicks: { create: parsedNicks.map((n) => ({ network: n.network, nick: n.nick })) },
        },
      });

      const mainGradeRaw = parsed.data.mainGradeId;
      const mainGradeId = mainGradeRaw === "none" || mainGradeRaw === "" ? null : mainGradeRaw;
      
      try {
        await setPlayerMainGrade(player.id, mainGradeId as string | null);
      } catch (e) {
        if (e instanceof Error && e.message === ErrorTypes.GRADE_NOT_FOUND) {
          await prisma.player.delete({ where: { id: player.id } });
          throw new Error(ErrorTypes.GRADE_NOT_FOUND);
        }
        throw e;
      }

      await syncPlayerAbiAlvoTarget(player.id, abiParsed.value, abiParsed.unit);
    } catch (e) {
      if (e instanceof Error && e.message === "Grade principal inválida.") throw e;
      playerQueriesLog.error("createPlayer falhou", e instanceof Error ? e : undefined, { name });
      throw new Error("Não foi possível criar o jogador.");
    }

    void notifyPlayerCreated(name, player.id);
    playerQueriesLog.success("Jogador criado", { name });
  }, (extra) => revalidatePlayers(...(extra ?? [])));
}

export async function updatePlayer(formData: FormData) {
  return playerMutations.run(assertCanWrite, async (session) => {
    const parsed = updatePlayerFormSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      nickname: formData.get("nickname") || null,
      email: formData.get("email") || "",
      coachId: formData.get("coachId") || "none",
      mainGradeId: formData.get("mainGradeId") || "none",
      abiAlvoValue: String(formData.get("abiAlvoValue") ?? ""),
      abiAlvoUnit: String(formData.get("abiAlvoUnit") ?? ""),
      status: formData.get("status"),
      playerGroup: formData.get("playerGroup") || null,
      nicksData: formData.get("nicksData") || null,
    });

    if (!parsed.success) {
      playerQueriesLog.warn("updatePlayer validação Zod falhou");
      throw new Error("Dados inválidos");
    }

    const abiParsed = parseAbiAlvoInput(parsed.data.abiAlvoValue, parsed.data.abiAlvoUnit);
    if (!abiParsed.ok) throw new Error(abiParsed.message);

    const existing = await prisma.player.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, coachId: true, driId: true },
    });
    if (!existing) throw new Error(ErrorTypes.NOT_FOUND);

    if (session.role === UserRole.COACH) {
      if (!session.coachId) throw new Error(ErrorTypes.FORBIDDEN);
      if (existing.coachId !== session.coachId && existing.driId !== session.coachId) throw new Error(ErrorTypes.FORBIDDEN);
    }

    let coachId = parsed.data.coachId === "none" || parsed.data.coachId === "" ? null : parsed.data.coachId;
    if (session.role === UserRole.COACH) coachId = existing.coachId;

    if (coachId) {
      const coachRow = await prisma.coach.findUnique({ where: { id: coachId }, select: { id: true } });
      if (!coachRow) throw new Error(ErrorTypes.COACH_NOT_FOUND);
    }

    const name = sanitizeText(parsed.data.name, 200);
    const nickname = sanitizeOptional(parsed.data.nickname, 120);
    const playerGroup = sanitizeOptional(parsed.data.playerGroup, 120);
    let email = parsed.data.email;
    if (email === "") email = undefined;
    if (email) email = sanitizeText(email, 320);

    let parsedNicks: { network: string; nick: string }[] | null = null;
    if (parsed.data.nicksData !== undefined && parsed.data.nicksData !== null) {
      try {
        const parsedArr = JSON.parse(parsed.data.nicksData);
        if (Array.isArray(parsedArr)) {
          parsedNicks = parsedArr.map((n) => ({
            network: String(n.network).trim(),
            nick: String(n.nick).trim(),
          })).filter(n => n.nick.length > 0 && n.network.length > 0);
        }
      } catch (e) {
        playerQueriesLog.error("Falha ao fazer parse dos Nicks", e instanceof Error ? e : undefined, { nicksData: parsed.data.nicksData });
      }
    }

    try {
      await prisma.player.update({
        where: { id: parsed.data.id },
        data: { name, nickname, email: email ?? null, coachId, status: parsed.data.status, playerGroup },
      });

      if (parsedNicks !== null) {
        // Ignora nicks sintéticos (como PlayerGroup) para que não sejam apagados acidentalmente pelo form
        const currentNicks = await prisma.playerNick.findMany({ 
          where: { playerId: parsed.data.id, network: { not: "PlayerGroup" } } 
        });
        const toKeep = parsedNicks.map(n => n.network + ':' + n.nick);
        const nicksToDelete = currentNicks.filter(c => !toKeep.includes(c.network + ':' + c.nick));
        const newNicks = parsedNicks.filter(n => !currentNicks.some(c => c.network === n.network && c.nick === n.nick));

        if (nicksToDelete.length > 0) {
          await prisma.playerNick.deleteMany({ where: { id: { in: nicksToDelete.map(n => n.id) } } });
        }
        if (newNicks.length > 0) {
          await prisma.playerNick.createMany({
            data: newNicks.map(n => ({ playerId: parsed.data.id, network: n.network, nick: n.nick })),
          });
        }
      }

      const mainGradeRaw = parsed.data.mainGradeId;
      const mainGradeId = mainGradeRaw === "none" || mainGradeRaw === "" ? null : mainGradeRaw;
      try {
        await setPlayerMainGrade(parsed.data.id, mainGradeId as string | null);
      } catch (e) {
        if (e instanceof Error && e.message === ErrorTypes.GRADE_NOT_FOUND) throw new Error(ErrorTypes.GRADE_NOT_FOUND);
        throw e;
      }

      await syncPlayerAbiAlvoTarget(parsed.data.id, abiParsed.value, abiParsed.unit);
    } catch (e) {
      if (e instanceof Error && (e.message === ErrorTypes.GRADE_NOT_FOUND || e.message === ErrorTypes.NOT_FOUND || e.message === ErrorTypes.FORBIDDEN)) {
        throw e;
      }
      playerQueriesLog.error("updatePlayer falhou", e instanceof Error ? e : undefined, { id: parsed.data.id });
      throw new Error("Não foi possível atualizar o jogador.");
    }

    playerQueriesLog.success("Jogador atualizado", { id: parsed.data.id });
    return [`/dashboard/players/${parsed.data.id}`];
  }, (extra) => revalidatePlayers(...(extra ?? [])));
}

export async function deletePlayer(formData: FormData) {
  return playerMutations.run(assertCanWrite, async (session) => {
    const parsed = idParamSchema.safeParse({ id: formData.get("id") });
    if (!parsed.success) {
      playerQueriesLog.warn("deletePlayer validação Zod falhou");
      throw new Error(ErrorTypes.INVALID_DATA);
    }

    const existing = await prisma.player.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, coachId: true, driId: true, name: true },
    });
    if (!existing) throw new Error(ErrorTypes.NOT_FOUND);

    if (session.role === UserRole.COACH) {
      if (!session.coachId) throw new Error(ErrorTypes.FORBIDDEN);
      if (existing.coachId !== session.coachId && existing.driId !== session.coachId) throw new Error(ErrorTypes.FORBIDDEN);
    }

    try {
      await prisma.player.delete({ where: { id: parsed.data.id } });
    } catch (e) {
      playerQueriesLog.error("deletePlayer falhou", e instanceof Error ? e : undefined, { id: parsed.data.id });
      throw new Error("Não foi possível excluir o jogador.");
    }

    playerQueriesLog.success("Jogador excluído", { id: parsed.data.id, name: existing.name });
  }, (extra) => revalidatePlayers(...(extra ?? [])));
}
