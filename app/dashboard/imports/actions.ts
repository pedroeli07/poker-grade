"use server";

import { prisma } from "@/lib/prisma";
import { parseExcelBuffer, parseLobbyzeDate } from "@/lib/excel-parser";
import { matchTournamentToGrade } from "@/lib/grade-matcher";
import { revalidatePath } from "next/cache";
import { MatchResult } from "@/lib/types";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import { assertCanImport } from "@/lib/auth/rbac";

const log = createLogger("imports.actions");

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export async function uploadTournaments(formData: FormData) {
  const session = await requireSession();
  assertCanImport(session);

  const file = formData.get("file") as File;
  if (!file) {
    log.warn("Upload chamado sem arquivo");
    throw new Error("Arquivo não encontrado");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    log.warn("Arquivo excede tamanho máximo", { size: file.size });
    throw new Error("Arquivo muito grande (máx. 12 MB)");
  }

  log.info("Iniciando processamento de importação", {
    fileName: file.name,
    size: file.size,
  });

  try {
  const arrayBuffer = await file.arrayBuffer();
  // We process the Excel file using our parser logic (handles multiple sheets/players)
  const parseResults = parseExcelBuffer(arrayBuffer);
  log.info("Excel parseado", { sheets: parseResults.length });

  let totalProcessed = 0;
  let summary = [];

  for (const sheetResult of parseResults) {
    if (sheetResult.tournaments.length === 0) continue;

    // 1. Find player by matching sheet name to either player nickname or name
    // Lobbyze uses the PokerStars/PartyPoker screen name usually
    const player = await prisma.player.findFirst({
      where: {
        OR: [
          { nickname: { equals: sheetResult.playerName, mode: "insensitive" } },
          { name: { equals: sheetResult.playerName, mode: "insensitive" } },
        ]
      },
      include: {
        gradeAssignments: {
          where: { isActive: true },
          include: {
            gradeProfile: {
              include: { rules: true }
            }
          }
        }
      }
    });

    if (!player) {
      log.warn("Jogador não encontrado para aba da planilha", {
        sheet: sheetResult.playerName,
      });
      summary.push(`Jogador não encontrado para a aba: ${sheetResult.playerName}`);
      continue;
    }

    if (session.role === "PLAYER") {
      if (!session.playerId || player.id !== session.playerId) {
        log.warn("PLAYER tentou importar aba de outro jogador", {
          sheet: sheetResult.playerName,
        });
        summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
        continue;
      }
    } else if (session.role === "COACH" && session.coachId) {
      const allowed =
        player.coachId === session.coachId || player.driId === session.coachId;
      if (!allowed) {
        log.warn("Coach tentou importar jogador fora da carteira", {
          sheet: sheetResult.playerName,
        });
        summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
        continue;
      }
    }

    // 2. Identify the active main grade
    const mainGrade = player.gradeAssignments.find(a => a.gradeType === "MAIN")?.gradeProfile;
    // (Future: Could also load ABOVE/BELOW grades to run secondary matching)

    if (mainGrade && mainGrade.rules.length === 0) {
      log.warn("Grade principal sem regras; matching desativado", {
        player: player.name,
        gradeId: mainGrade.id,
      });
    }

    let matchedInGrade = 0;
    let suspect = 0;
    let outOfGrade = 0;

    // Create the import record
    const importRecord = await prisma.tournamentImport.create({
      data: {
        fileName: file.name,
        importType: "excel",
        playerName: player.name,
        importedBy: session.userId,
      }
    });

    const playedTournamentsData = [];
    const reviewItemsData = [];

    // 3. Process each row
    for (const t of sheetResult.tournaments) {
      // Clean date
      const dateObj = parseLobbyzeDate(t.date) || new Date();

      let matchStatus: MatchResult = "OUT_OF_GRADE";
      let matchedRuleId = null;

      // Ensure buyIn is numeric to avoid type issues (Excel parser handles this but let's double check)
      const buyInNumeric = Number(t.buyInValue) || 0;

      if (mainGrade && mainGrade.rules.length > 0) {
        // Convert rules to the format grade-matcher expects
        // (For Prisma we just pass them directly, they map 1:1 if types are aligned)
        const matchResult = matchTournamentToGrade({
          site: t.site,
          buyInValue: buyInNumeric,
          tournamentName: t.tournamentName,
          speed: t.speed,
        }, mainGrade.rules as any);

        matchStatus = matchResult.result;
        matchedRuleId = matchResult.matchedRuleId;
      }

      if (matchStatus === "IN_GRADE") matchedInGrade++;
      else if (matchStatus === "SUSPECT") suspect++;
      else outOfGrade++;

      // 4. Save to Database
      const playedTournament = await prisma.playedTournament.create({
        data: {
          playerId: player.id,
          importId: importRecord.id,
          date: dateObj,
          site: t.site,
          buyInCurrency: t.buyInCurrency,
          buyInValue: buyInNumeric,
          buyInUsd: Number(t.buyInUsd) || buyInNumeric,
          tournamentName: t.tournamentName,
          scheduling: t.scheduling,
          rebuy: t.rebuy,
          speed: t.speed,
          sharkId: t.sharkId,
          priority: t.priority,
          matchStatus,
          matchedRuleId,
        }
      });

      // If suspect or out of grade, automatically queue for Review
      if (matchStatus === "SUSPECT" || matchStatus === "OUT_OF_GRADE") {
        await prisma.gradeReviewItem.create({
          data: {
            playerId: player.id,
            tournamentId: playedTournament.id,
            status: "PENDING",
            isInfraction: false,
          }
        });
      }

      totalProcessed++;
    }

    // Update the import record stats
    await prisma.tournamentImport.update({
      where: { id: importRecord.id },
      data: {
        totalRows: sheetResult.tournaments.length,
        matchedInGrade,
        suspect,
        outOfGrade,
      }
    });

    summary.push(`Processado: ${player.name} (${sheetResult.tournaments.length} torneios)`);
  }

  revalidatePath("/dashboard/imports");
  revalidatePath("/dashboard/review");

  log.success("Importação concluída", {
    processed: totalProcessed,
    summaryLines: summary.length,
  });

  return {
    success: true,
    processed: totalProcessed,
    summary,
  };
  } catch (err) {
    log.error(
      "Falha na importação de torneios",
      err instanceof Error ? err : undefined,
      { fileName: file.name }
    );
    throw err;
  }
}
