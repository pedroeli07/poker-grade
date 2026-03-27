"use server";

import { prisma } from "@/lib/prisma";
import { parseExcelBuffer, parseLobbyzeDate } from "@/lib/excel-parser";
import { matchTournamentToGrade } from "@/lib/grade-matcher";
import { revalidatePath } from "next/cache";
import { MatchResult } from "@/lib/types";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import { IMPORT_ROLES } from "@/lib/auth/rbac";
import { notifyImportDone } from "@/lib/notifications";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const log = createLogger("imports.actions");

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

type UploadResult =
  | { success: true; processed: number; summary: string[] }
  | { success: false; error: string };

function generateCuid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function uploadTournaments(formData: FormData): Promise<UploadResult> {
  const session = await requireSession();

  if (!IMPORT_ROLES.includes(session.role)) {
    return { success: false, error: "Sem permissão para importar torneios." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Arquivo não encontrado." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { success: false, error: "Arquivo muito grande (máx. 12 MB)." };
  }

  log.info("Iniciando processamento de importação", {
    fileName: file.name,
    size: file.size,
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parseResults = parseExcelBuffer(arrayBuffer);
    log.info("Excel parseado", { sheets: parseResults.length, file: file.name });

    let totalProcessed = 0;
    const summary: string[] = [];

    for (const sheetResult of parseResults) {
      if (sheetResult.tournaments.length === 0) continue;

      log.info("Processando aba", {
        sheet: sheetResult.playerName,
        rows: sheetResult.tournaments.length,
      });

      const allPlayers = await prisma.player.findMany({
        include: {
          gradeAssignments: {
            where: { isActive: true },
            include: { gradeProfile: { include: { rules: true } } },
          },
        },
      });

      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
      const target = normalize(sheetResult.playerName);

      let player = allPlayers.find(
        (p) =>
          normalize(p.name) === target ||
          (p.nickname && normalize(p.nickname) === target)
      );

      if (!player) {
        if (session.role === "ADMIN" || session.role === "MANAGER") {
          log.info("Jogador não encontrado — criando", { sheet: sheetResult.playerName });
          player = await prisma.player.create({
            data: { name: sheetResult.playerName, nickname: sheetResult.playerName, status: "ACTIVE" },
            include: {
              gradeAssignments: {
                where: { isActive: true },
                include: { gradeProfile: { include: { rules: true } } },
              },
            },
          });
          summary.push(`Novo jogador criado: ${player.name}`);
        } else {
          summary.push(`Jogador não encontrado: ${sheetResult.playerName}`);
          continue;
        }
      }

      if (session.role === "PLAYER") {
        if (!session.playerId || player.id !== session.playerId) {
          summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
          continue;
        }
      } else if (session.role === "COACH" && session.coachId) {
        if (player.coachId !== session.coachId && player.driId !== session.coachId) {
          summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
          continue;
        }
      }

      const mainGrade = player.gradeAssignments.find((a) => a.gradeType === "MAIN")?.gradeProfile;
      if (!mainGrade) {
        log.warn("Jogador sem grade principal — matching desativado", { player: player.name });
      }

      const importRecord = await prisma.tournamentImport.create({
        data: { fileName: file.name, importType: "excel", playerName: player.name, importedBy: session.userId },
      });

      // ── Batch processing: prepare all data in-memory, then insert in bulk ──
      let matchedInGrade = 0;
      let suspect = 0;
      let outOfGrade = 0;

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
        speed: string;
        sharkId: string | null;
        priority: string;
        matchStatus: MatchResult;
        matchedRuleId: string | null;
      }> = [];

      const reviewRows: Array<{
        playerId: string;
        tournamentId: string;
        status: "PENDING";
        isInfraction: boolean;
      }> = [];

      for (const t of sheetResult.tournaments) {
        const dateObj = parseLobbyzeDate(t.date) ?? new Date();
        const buyInNumeric = Number(t.buyInValue) || 0;

        let matchStatus: MatchResult = "OUT_OF_GRADE";
        let matchedRuleId: string | null = null;

        if (mainGrade && mainGrade.rules.length > 0) {
          const matchResult = matchTournamentToGrade(
            { site: t.site, buyInValue: buyInNumeric, tournamentName: t.tournamentName, speed: t.speed },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mainGrade.rules as any
          );
          matchStatus = matchResult.result;
          matchedRuleId = matchResult.matchedRuleId;
        }

        if (matchStatus === "IN_GRADE") matchedInGrade++;
        else if (matchStatus === "SUSPECT") suspect++;
        else outOfGrade++;

        const tournamentId = generateCuid();

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
          speed: t.speed,
          sharkId: t.sharkId || null,
          priority: t.priority,
          matchStatus,
          matchedRuleId,
        });

        const isExtraPlay = (t.scheduling ?? "").toLowerCase().includes("extra");
        if (isExtraPlay || matchStatus === "SUSPECT" || matchStatus === "OUT_OF_GRADE") {
          reviewRows.push({
            playerId: player.id,
            tournamentId,
            status: "PENDING",
            isInfraction: false,
          });
        }
      }

      // Batch insert tournaments (single query)
      await prisma.playedTournament.createMany({ data: tournamentRows });
      log.info("Torneios inseridos em batch", { count: tournamentRows.length });

      // Batch insert review items (single query)
      if (reviewRows.length > 0) {
        await prisma.gradeReviewItem.createMany({ data: reviewRows });
        log.info("Review items inseridos em batch", { count: reviewRows.length });
      }

      // Update import stats
      await prisma.tournamentImport.update({
        where: { id: importRecord.id },
        data: { totalRows: sheetResult.tournaments.length, matchedInGrade, suspect, outOfGrade },
      });

      totalProcessed += tournamentRows.length;

      log.success("Aba processada", {
        player: player.name,
        total: sheetResult.tournaments.length,
        inGrade: matchedInGrade,
        suspect,
        outOfGrade,
      });

      void notifyImportDone(player.name, player.id, importRecord.id, outOfGrade);

      summary.push(
        `${player.name}: ${sheetResult.tournaments.length} torneios (${outOfGrade} extra play)`
      );
    }

    revalidatePath("/dashboard/imports");
    revalidatePath("/dashboard/review");
    revalidatePath("/dashboard");

    log.success("Importação concluída", { file: file.name, processed: totalProcessed });
    return { success: true, processed: totalProcessed, summary };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : "Erro desconhecido ao processar arquivo";
    log.error("Falha na importação", err instanceof Error ? err : undefined, { file: file.name });
    return { success: false, error: msg };
  }
}
