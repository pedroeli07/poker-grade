"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { parseExcelBuffer, parseLobbyzeDate } from "@/lib/excel-parser";
import { matchTournamentToGrade } from "@/lib/grade-matcher";
import { IMPORT_ROLES } from "@/lib/auth/rbac";
import { notifyImportDone } from "@/lib/queries/db/notification/notify-imports";
import { notifyImportBatchExternal } from "@/lib/notify-import-external";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { limitImportsUpload } from "@/lib/rate-limit";
import { requireSession } from "@/lib/auth/session";
import { ErrorTypes } from "@/lib/types/primitives";
import { MAX_UPLOAD_BYTES } from "@/lib/constants/query-result";
import { importsQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateImports } from "@/lib/constants/revalidate-app";
import { GradeType, ReviewStatus, TournamentMatchStatus, UserRole } from "@prisma/client";

type UploadResult =
  | { success: true; processed: number; summary: string[] }
  | { success: false; error: string };

function classifyScheduling(scheduling: string | null) {
  const s = (scheduling ?? "").toLowerCase().trim();
  if (s.includes("extra")) return "extra" as const;
  if (s === "played") return "played" as const;
  return "missed" as const;
}

export async function uploadTournaments(formData: FormData): Promise<UploadResult> {
  const session = await requireSession();

  if (!IMPORT_ROLES.includes(session.role)) {
    return { success: false, error: "Sem permissão para importar torneios." };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: ErrorTypes.NOT_FOUND };

  const playerId = formData.get("playerId") as string | null;
  if (!playerId) return { success: false, error: "Selecione um jogador antes de importar." };

  if (file.size > MAX_UPLOAD_BYTES) {
    return { success: false, error: "Arquivo muito grande (máx. 12 MB)." };
  }

  const uploadRl = await limitImportsUpload(session.userId);
  if (!uploadRl.ok) {
    return {
      success: false,
      error: `Limite de importações por hora. Aguarde ${uploadRl.retryAfterSec}s.`,
    };
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      gradeAssignments: {
        where: { isActive: true },
        include: { gradeProfile: { include: { rules: true } } },
      },
    },
  });

  if (!player) return { success: false, error: "Jogador não encontrado." };

  if (session.role === UserRole.PLAYER && session.playerId !== player.id) {
    return { success: false, error: "Sem permissão para importar para este jogador." };
  }
  if (session.role === UserRole.COACH && session.coachId) {
    if (player.coachId !== session.coachId && player.driId !== session.coachId) {
      return { success: false, error: "Sem permissão para importar para este jogador." };
    }
  }

  importsQueriesLog.sep("INÍCIO DA IMPORTAÇÃO");
  importsQueriesLog.info("Arquivo recebido", {
    fileName: file.name,
    sizeKB: Math.round(file.size / 1024),
    player: player.name,
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parseResults = parseExcelBuffer(arrayBuffer);

    const allTournaments = parseResults.flatMap((r) => r.tournaments);

    importsQueriesLog.info("Excel parseado", {
      abas: parseResults.length,
      totalLinhas: allTournaments.length,
    });

    const mainGrade = player.gradeAssignments.find((a) => a.gradeType === GradeType.MAIN)?.gradeProfile;

    if (!mainGrade) {
      importsQueriesLog.warn("Sem grade principal", { player: player.name });
    } else {
      importsQueriesLog.info("Grade principal", {
        player: player.name,
        grade: mainGrade.name,
        regras: mainGrade.rules.length,
      });
    }

    const importRecord = await prisma.tournamentImport.create({
      data: { fileName: file.name, importType: "excel", playerName: player.name, importedBy: session.userId },
    });

    let playedCount = 0;
    let extraPlayCount = 0;
    let didntPlayCount = 0;

    const tournamentRows: Array<{
      id: string;
      playerId: string;
      importId: string;
      date: Date;
      site: string;
      buyInCurrency: string;
      buyInValue: number;
      buyInUsd: number;
      tournamentName: string;
      scheduling: string;
      rebuy: boolean;
      rebuys: number;
      speed: string;
      sharkId: string | null;
      priority: string;
      matchStatus: TournamentMatchStatus;
      matchedRuleId: string | null;
    }> = [];

    const reviewRows: Array<{
      playerId: string;
      tournamentId: string;
      status: ReviewStatus;
      isInfraction: boolean;
    }> = [];

    for (const t of allTournaments) {
      const dateObj = parseLobbyzeDate(t.date) ?? new Date();
      const buyInNumeric = Number(t.buyInValue) || 0;
      const schedulingCat = classifyScheduling(t.scheduling);

      if (schedulingCat === "played") playedCount++;
      else if (schedulingCat === "extra") extraPlayCount++;
      else didntPlayCount++;

      let matchStatus: TournamentMatchStatus = schedulingCat === "played" ? TournamentMatchStatus.IN_GRADE : TournamentMatchStatus.OUT_OF_GRADE;
      let matchedRuleId: string | null = null;

      if (mainGrade && mainGrade.rules.length > 0 && schedulingCat === "played") {
        const matchResult = matchTournamentToGrade(
          { site: t.site, buyInValue: buyInNumeric, tournamentName: t.tournamentName, speed: t.speed },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mainGrade.rules as any
        );
        matchStatus = matchResult.result;
        matchedRuleId = matchResult.matchedRuleId;
      }

      const tournamentId = randomUUID();

      tournamentRows.push({
        id: tournamentId,
        playerId: player.id,
        importId: importRecord.id,
        date: dateObj,
        site: t.site,
        buyInCurrency: t.buyInCurrency,
        buyInValue: buyInNumeric,
        buyInUsd: Number(t.buyInUsd) || buyInNumeric,
        tournamentName: t.tournamentName,
        scheduling: t.scheduling ?? "",
        rebuy: t.rebuy,
        rebuys: t.rebuys ?? 0,
        speed: t.speed,
        sharkId: t.sharkId || null,
        priority: t.priority,
        matchStatus,
        matchedRuleId,
      });

      if (schedulingCat === "extra") {
        reviewRows.push({
          playerId: player.id,
          tournamentId,
          status: ReviewStatus.PENDING,
          isInfraction: false,
        });
      }
    }

    await prisma.playedTournament.createMany({ data: tournamentRows });

    if (reviewRows.length > 0) {
      await prisma.gradeReviewItem.createMany({ data: reviewRows });
    }

    await prisma.tournamentImport.update({
      where: { id: importRecord.id },
      data: {
        totalRows: allTournaments.length,
        matchedInGrade: playedCount,
        outOfGrade: extraPlayCount,
        suspect: didntPlayCount,
      },
    });

    revalidateImports();

    void notifyImportDone(player.name, player.id, importRecord.id, extraPlayCount);
    void notifyImportBatchExternal({
      fileName: file.name,
      sheetsProcessed: parseResults.length,
      totalExtraPlays: extraPlayCount,
      summaryLines: [
        `${player.name}: ${allTournaments.length} torneios — ${playedCount} jogados, ${extraPlayCount} extra play, ${didntPlayCount} não jogados`,
      ],
    });

    importsQueriesLog.success("Importação finalizada", { file: file.name, processed: tournamentRows.length });
    return {
      success: true,
      processed: tournamentRows.length,
      summary: [
        `${player.name}: ${allTournaments.length} torneios — ${playedCount} jogados, ${extraPlayCount} extra play, ${didntPlayCount} não jogados`,
      ],
    };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    importsQueriesLog.error("Falha na importação", err instanceof Error ? err : undefined, { file: file.name });
    return {
      success: false,
      error: "Não foi possível processar o arquivo. Verifique o formato e tente novamente.",
    };
  }
}
