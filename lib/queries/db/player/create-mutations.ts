"use server";

import { prisma } from "@/lib/prisma";
import { assertCanWrite } from "@/lib/auth/rbac";
import { setPlayerMainGrade, syncPlayerAbiAlvoTarget } from "@/lib/data/player";
import { createPlayerFormSchema } from "@/lib/schemas/player";
import { sanitizeOptional, sanitizeText } from "@/lib/utils/text-sanitize";
import { notifyPlayerCreated } from "@/lib/queries/db/notification/notify-accounts";
import { parseAbiAlvoInput } from "@/lib/utils/player";
import { playerMutations, playerQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidatePlayers } from "@/lib/constants/revalidate-app";
import { PlayerStatus, UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types/primitives";

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
      nicksData: (formData.get("nicksData") as string | null) ?? null,
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
          parsedNicks = parsedArr
            .map((n) => ({
              network: String(n.network).trim(),
              nick: String(n.nick).trim(),
            }))
            .filter((n) => n.nick.length > 0 && n.network.length > 0);
        }
      }
    } catch (e) {
      playerQueriesLog.error("Falha ao fazer parse dos Nicks", e instanceof Error ? e : undefined, {
        nicksData: parsed.data.nicksData,
      });
    }

    playerQueriesLog.info("Criando jogador", { name, hasCoach: Boolean(coachId) });

    let player;
    try {
      player = await prisma.player.create({
        data: {
          name,
          nickname,
          email: email ?? null,
          coachId,
          status: PlayerStatus.ACTIVE,
          playerGroup,
          nicks: { create: parsedNicks.map((n) => ({ network: n.network, nick: n.nick })) },
        },
      });

      const mainGradeRaw = parsed.data.mainGradeId;
      const mainGradeId = mainGradeRaw === "none" || mainGradeRaw === "" ? null : mainGradeRaw;

      try {
        await setPlayerMainGrade(player.id, mainGradeId as string | null, { performedBy: session.userId });
      } catch (e) {
        if (e instanceof Error && e.message === ErrorTypes.GRADE_NOT_FOUND) {
          await prisma.player.delete({ where: { id: player.id } });
          throw new Error(ErrorTypes.GRADE_NOT_FOUND);
        }
        throw e;
      }

      await syncPlayerAbiAlvoTarget(player.id, abiParsed.value ?? null, abiParsed.unit ?? null);
    } catch (e) {
      if (e instanceof Error && e.message === "Grade principal inválida.") throw e;
      playerQueriesLog.error("createPlayer falhou", e instanceof Error ? e : undefined, { name });
      throw new Error("Não foi possível criar o jogador.");
    }

    void notifyPlayerCreated(name, player.id);
    playerQueriesLog.success("Jogador criado", { name });
  }, (extra) => revalidatePlayers("/admin/grades/historico", ...(extra ?? [])));
}
