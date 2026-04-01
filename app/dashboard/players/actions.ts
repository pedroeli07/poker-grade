"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import { assertCanWrite } from "@/lib/auth/rbac";
import { limitDashboardMutation, limitDashboardRead } from "@/lib/rate-limit";
import { getPlayersTablePayloadForSession } from "@/lib/data/players-table";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  createPlayerFormSchema,
  idParamSchema,
  updatePlayerFormSchema,
} from "@/lib/validation/schemas";
import { sanitizeOptional, sanitizeText } from "@/lib/sanitize";
import { notifyPlayerCreated } from "@/lib/notifications";
import { setPlayerMainGrade } from "@/lib/data/player-main-grade";
import {
  parseAbiAlvoInput,
  syncPlayerAbiAlvoTarget,
} from "@/lib/data/player-abi-target";

const log = createLogger("players.actions");

export async function getPlayersTableDataAction() {
  const session = await requireSession();
  const rl = await limitDashboardRead(session.userId);
  if (!rl.ok) {
    return {
      ok: false as const,
      error: `Muitas consultas. Aguarde ${rl.retryAfterSec}s.`,
    };
  }
  const payload = await getPlayersTablePayloadForSession(session);
  return { ok: true as const, payload };
}

export async function createPlayer(formData: FormData) {
  const session = await requireSession();
  assertCanWrite(session);
  const gate = await limitDashboardMutation(session.userId);
  if (!gate.ok) {
    throw new Error(`Aguarde ${gate.retryAfterSec}s.`);
  }

  const parsed = createPlayerFormSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || null,
    email: formData.get("email") || "",
    coachId: formData.get("coachId") || "none",
    mainGradeId: formData.get("mainGradeId") || "none",
    abiAlvoValue: String(formData.get("abiAlvoValue") ?? ""),
    abiAlvoUnit: String(formData.get("abiAlvoUnit") ?? ""),
  });

  if (!parsed.success) {
    log.warn("createPlayer validação Zod falhou");
    throw new Error("Dados inválidos");
  }

  let coachId =
    parsed.data.coachId === "none" || parsed.data.coachId === ""
      ? null
      : parsed.data.coachId;

  if (session.role === "COACH") {
    coachId = session.coachId;
  }

  const name = sanitizeText(parsed.data.name, 200);
  const nickname = sanitizeOptional(parsed.data.nickname, 120);
  let email = parsed.data.email;
  if (email === "") email = undefined;
  if (email) email = sanitizeText(email, 320);

  const abiParsed = parseAbiAlvoInput(
    parsed.data.abiAlvoValue,
    parsed.data.abiAlvoUnit
  );
  if (!abiParsed.ok) {
    throw new Error(abiParsed.message);
  }

  log.info("Criando jogador", { name, hasCoach: Boolean(coachId) });

  let player;
  try {
    player = await prisma.player.create({
      data: {
        name,
        nickname,
        email: email ?? null,
        coachId,
        status: "ACTIVE",
      },
    });

    const mainGradeRaw = parsed.data.mainGradeId;
    const mainGradeId =
      mainGradeRaw === "none" || mainGradeRaw === "" ? null : mainGradeRaw;
    try {
      await setPlayerMainGrade(player.id, mainGradeId);
    } catch (e) {
      if (e instanceof Error && e.message === "GRADE_NOT_FOUND") {
        await prisma.player.delete({ where: { id: player.id } });
        throw new Error("Grade principal inválida.");
      }
      throw e;
    }

    await syncPlayerAbiAlvoTarget(
      player.id,
      abiParsed.value,
      abiParsed.unit
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (e instanceof Error && e.message === "Grade principal inválida.") throw e;
    log.error(
      "createPlayer falhou",
      e instanceof Error ? e : undefined,
      { name }
    );
    throw new Error("Não foi possível criar o jogador.");
  }

  void notifyPlayerCreated(name, player.id);

  revalidatePath("/dashboard/players");
  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard/targets");
  log.success("Jogador criado", { name });
  return { success: true };
}

export async function updatePlayer(formData: FormData) {
  const session = await requireSession();
  assertCanWrite(session);
  const gate = await limitDashboardMutation(session.userId);
  if (!gate.ok) {
    throw new Error(`Aguarde ${gate.retryAfterSec}s.`);
  }

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
  });

  if (!parsed.success) {
    log.warn("updatePlayer validação Zod falhou");
    throw new Error("Dados inválidos");
  }

  const abiParsed = parseAbiAlvoInput(
    parsed.data.abiAlvoValue,
    parsed.data.abiAlvoUnit
  );
  if (!abiParsed.ok) {
    throw new Error(abiParsed.message);
  }

  const existing = await prisma.player.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, coachId: true, driId: true },
  });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (session.role === "COACH") {
    if (!session.coachId) throw new Error("FORBIDDEN");
    if (
      existing.coachId !== session.coachId &&
      existing.driId !== session.coachId
    ) {
      throw new Error("FORBIDDEN");
    }
  }

  let coachId =
    parsed.data.coachId === "none" || parsed.data.coachId === ""
      ? null
      : parsed.data.coachId;
  if (session.role === "COACH") {
    coachId = existing.coachId;
  }

  if (coachId) {
    const coachRow = await prisma.coach.findUnique({
      where: { id: coachId },
      select: { id: true },
    });
    if (!coachRow) throw new Error("Coach inválido");
  }

  const name = sanitizeText(parsed.data.name, 200);
  const nickname = sanitizeOptional(parsed.data.nickname, 120);
  let email = parsed.data.email;
  if (email === "") email = undefined;
  if (email) email = sanitizeText(email, 320);

  try {
    await prisma.player.update({
      where: { id: parsed.data.id },
      data: {
        name,
        nickname,
        email: email ?? null,
        coachId,
        status: parsed.data.status,
      },
    });

    const mainGradeRaw = parsed.data.mainGradeId;
    const mainGradeId =
      mainGradeRaw === "none" || mainGradeRaw === "" ? null : mainGradeRaw;
    try {
      await setPlayerMainGrade(parsed.data.id, mainGradeId);
    } catch (e) {
      if (e instanceof Error && e.message === "GRADE_NOT_FOUND") {
        throw new Error("Grade principal inválida.");
      }
      throw e;
    }

    await syncPlayerAbiAlvoTarget(
      parsed.data.id,
      abiParsed.value,
      abiParsed.unit
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (
      e instanceof Error &&
      (e.message === "Grade principal inválida." ||
        e.message === "NOT_FOUND" ||
        e.message === "FORBIDDEN")
    ) {
      throw e;
    }
    log.error(
      "updatePlayer falhou",
      e instanceof Error ? e : undefined,
      { id: parsed.data.id }
    );
    throw new Error("Não foi possível atualizar o jogador.");
  }

  revalidatePath("/dashboard/players");
  revalidatePath(`/dashboard/players/${parsed.data.id}`);
  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard/targets");
  log.success("Jogador atualizado", { id: parsed.data.id });
  return { success: true };
}

export async function deletePlayer(formData: FormData) {
  const session = await requireSession();
  assertCanWrite(session);
  const gate = await limitDashboardMutation(session.userId);
  if (!gate.ok) {
    throw new Error(`Aguarde ${gate.retryAfterSec}s.`);
  }

  const parsed = idParamSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) {
    log.warn("deletePlayer validação Zod falhou");
    throw new Error("Dados inválidos");
  }

  const existing = await prisma.player.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, coachId: true, driId: true, name: true },
  });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (session.role === "COACH") {
    if (!session.coachId) throw new Error("FORBIDDEN");
    if (
      existing.coachId !== session.coachId &&
      existing.driId !== session.coachId
    ) {
      throw new Error("FORBIDDEN");
    }
  }

  try {
    await prisma.player.delete({ where: { id: parsed.data.id } });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    log.error(
      "deletePlayer falhou",
      e instanceof Error ? e : undefined,
      { id: parsed.data.id }
    );
    throw new Error("Não foi possível excluir o jogador.");
  }

  revalidatePath("/dashboard/players");
  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard/targets");
  revalidatePath("/dashboard");
  log.success("Jogador excluído", { id: parsed.data.id, name: existing.name });
  return { success: true };
}
