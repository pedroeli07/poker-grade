"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import { assertCanWrite } from "@/lib/auth/rbac";
import { createPlayerFormSchema } from "@/lib/validation/schemas";
import { sanitizeOptional, sanitizeText } from "@/lib/sanitize";

const log = createLogger("players.actions");

export async function createPlayer(formData: FormData) {
  const session = await requireSession();
  assertCanWrite(session);

  const parsed = createPlayerFormSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || null,
    email: formData.get("email") || "",
    coachId: formData.get("coachId") || "none",
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

  log.info("Criando jogador", { name, hasCoach: Boolean(coachId) });

  await prisma.player.create({
    data: {
      name,
      nickname,
      email: email ?? null,
      coachId,
      status: "ACTIVE",
    },
  });

  revalidatePath("/dashboard/players");
  log.success("Jogador criado", { name });
  return { success: true };
}
