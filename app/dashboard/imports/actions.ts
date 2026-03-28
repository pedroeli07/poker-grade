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
import { notifyImportBatchExternal } from "@/lib/notify-import-external";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const log = createLogger("imports.actions");

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

type UploadResult =
  | { success: true; processed: number; summary: string[] }
  | { success: false; error: string };

function generateCuid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/** Classify the Lobbyze scheduling field */
function classifyScheduling(scheduling: string | null) {
  const s = (scheduling ?? "").toLowerCase().trim();
  if (s.includes("extra")) return "extra" as const;
  if (s === "played") return "played" as const;
  return "missed" as const; // "Didn't play" or anything else
}

export async function deleteImports(ids: string[]): Promise<{ success: boolean; error?: string }> {
  const session = await requireSession();

  if (!["ADMIN", "MANAGER", "COACH"].includes(session.role)) {
    return { success: false, error: "Sem permissão para excluir importações." };
  }
  if (!ids.length) return { success: false, error: "Nenhuma importação selecionada." };

  try {
    await prisma.playedTournament.deleteMany({ where: { importId: { in: ids } } });
    await prisma.tournamentImport.deleteMany({ where: { id: { in: ids } } });

    revalidatePath("/dashboard/imports");
    revalidatePath("/dashboard/review");
    revalidatePath("/dashboard");

    log.success("Importações excluídas", { count: ids.length });
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    log.error("Erro ao excluir importações", err instanceof Error ? err : undefined);
    return { success: false, error: "Erro ao excluir importações." };
  }
}

export async function uploadTournaments(formData: FormData): Promise<UploadResult> {
  const session = await requireSession();

  if (!IMPORT_ROLES.includes(session.role)) {
    return { success: false, error: "Sem permissão para importar torneios." };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "Arquivo não encontrado." };

  if (file.size > MAX_UPLOAD_BYTES) {
    return { success: false, error: "Arquivo muito grande (máx. 12 MB)." };
  }

  log.sep("INÍCIO DA IMPORTAÇÃO");
  log.info("Arquivo recebido", { fileName: file.name, sizeKB: Math.round(file.size / 1024) });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parseResults = parseExcelBuffer(arrayBuffer);

    log.info("Excel parseado", {
      abas: parseResults.length,
      totalLinhas: parseResults.reduce((s, r) => s + r.tournaments.length, 0),
    });

    let totalProcessed = 0;
    const summary: string[] = [];
    let importSheetsProcessed = 0;
    let totalExtraPlaysAll = 0;

    for (const sheetResult of parseResults) {
      log.sep(sheetResult.playerName);

      if (sheetResult.tournaments.length === 0) {
        log.warn("Aba vazia — ignorada", { sheet: sheetResult.playerName });
        continue;
      }

      // ── Pre-analyze scheduling from Lobbyze (source of truth) ──────────────
      const schedulingStats = sheetResult.tournaments.reduce(
        (acc, t) => {
          const cat = classifyScheduling(t.scheduling);
          acc[cat]++;
          return acc;
        },
        { played: 0, extra: 0, missed: 0 }
      );

      log.info("Scheduling Lobbyze (antes de qualquer matching)", {
        sheet: sheetResult.playerName,
        played: schedulingStats.played,
        extraPlay: schedulingStats.extra,
        didntPlay: schedulingStats.missed,
        total: sheetResult.tournaments.length,
      });

      // ── Find or create player ───────────────────────────────────────────────
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
        (p) => normalize(p.name) === target || (p.nickname && normalize(p.nickname) === target)
      );

      if (!player) {
        if (session.role === "ADMIN" || session.role === "MANAGER") {
          log.warn("Jogador não encontrado — criando automaticamente", {
            sheetName: sheetResult.playerName,
          });
          player = await prisma.player.create({
            data: { name: sheetResult.playerName, nickname: sheetResult.playerName, status: "ACTIVE" },
            include: {
              gradeAssignments: {
                where: { isActive: true },
                include: { gradeProfile: { include: { rules: true } } },
              },
            },
          });
          log.success("Novo jogador criado", { id: player.id, name: player.name });
          summary.push(`Novo jogador criado: ${player.name}`);
        } else {
          log.warn("Jogador não encontrado — aba ignorada", { sheet: sheetResult.playerName });
          summary.push(`Jogador não encontrado: ${sheetResult.playerName}`);
          continue;
        }
      } else {
        log.debug("Jogador encontrado", { id: player.id, name: player.name });
      }

      // ── Permission check ────────────────────────────────────────────────────
      if (session.role === "PLAYER") {
        if (!session.playerId || player.id !== session.playerId) {
          log.warn("Permissão negada — jogador não é o próprio", { sheet: sheetResult.playerName });
          summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
          continue;
        }
      } else if (session.role === "COACH" && session.coachId) {
        if (player.coachId !== session.coachId && player.driId !== session.coachId) {
          log.warn("Permissão negada — jogador não é da carteira do coach", {
            sheet: sheetResult.playerName,
            coachId: session.coachId,
          });
          summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
          continue;
        }
      }

      // ── Grade matching ──────────────────────────────────────────────────────
      const mainGrade = player.gradeAssignments.find((a) => a.gradeType === "MAIN")?.gradeProfile;

      if (!mainGrade) {
        log.warn("Sem grade principal — grade matching desativado (stats baseados em scheduling)", {
          player: player.name,
        });
      } else {
        log.info("Grade principal encontrada", {
          player: player.name,
          grade: mainGrade.name,
          regras: mainGrade.rules.length,
        });
      }

      // ── Create import record ────────────────────────────────────────────────
      const importRecord = await prisma.tournamentImport.create({
        data: { fileName: file.name, importType: "excel", playerName: player.name, importedBy: session.userId },
      });

      log.debug("Import record criado", { importId: importRecord.id });

      // ── Build tournament rows in memory ─────────────────────────────────────
      //
      // STATS STRATEGY:
      //   • matchedInGrade = scheduling "Played"   (Lobbyze says it's in schedule)
      //   • outOfGrade     = scheduling "Extra play" (Lobbyze says outside schedule)
      //   • suspect        = scheduling "Didn't play" (in schedule but not played)
      //
      // This ensures stats reflect Lobbyze's ground truth, not just our grade matching.
      // Grade matching (matchStatus) is stored per-tournament for filtering but does NOT
      // override the primary stats.

      let playedCount = 0;
      let extraPlayCount = 0;
      let didntPlayCount = 0;

      const tournamentRows: Array<{
        id: string; playerId: string; importId: string; date: Date;
        site: string; buyInCurrency: string; buyInValue: number; buyInUsd: number;
        tournamentName: string; scheduling: string; rebuy: boolean; speed: string;
        sharkId: string | null; priority: string; matchStatus: MatchResult; matchedRuleId: string | null;
      }> = [];

      const reviewRows: Array<{
        playerId: string; tournamentId: string; status: "PENDING"; isInfraction: boolean;
      }> = [];

      for (const t of sheetResult.tournaments) {
        const dateObj = parseLobbyzeDate(t.date) ?? new Date();
        const buyInNumeric = Number(t.buyInValue) || 0;
        const schedulingCat = classifyScheduling(t.scheduling);

        // ── Count by Lobbyze scheduling ───────────────────────────────────
        if (schedulingCat === "played") playedCount++;
        else if (schedulingCat === "extra") extraPlayCount++;
        else didntPlayCount++;

        // ── Grade matching (only informational when grade exists) ─────────
        let matchStatus: MatchResult = schedulingCat === "played" ? "IN_GRADE" : "OUT_OF_GRADE";
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

        const tournamentId = generateCuid();

        tournamentRows.push({
          id: tournamentId, playerId: player.id, importId: importRecord.id,
          date: dateObj, site: t.site, buyInCurrency: t.buyInCurrency,
          buyInValue: buyInNumeric, buyInUsd: Number(t.buyInUsd) || buyInNumeric,
          tournamentName: t.tournamentName, scheduling: t.scheduling ?? "",
          rebuy: t.rebuy, speed: t.speed, sharkId: t.sharkId || null,
          priority: t.priority, matchStatus, matchedRuleId,
        });

        // ── Review items: ONLY for actual Extra play from Lobbyze ─────────
        if (schedulingCat === "extra") {
          reviewRows.push({
            playerId: player.id,
            tournamentId,
            status: "PENDING",
            isInfraction: false,
          });
        }
      }

      log.info("Processamento in-memory concluído", {
        player: player.name,
        played: playedCount,
        extraPlay: extraPlayCount,
        didntPlay: didntPlayCount,
        reviewItems: reviewRows.length,
      });

      // ── Batch insert ────────────────────────────────────────────────────────
      await prisma.playedTournament.createMany({ data: tournamentRows });
      log.debug("Torneios inseridos no banco", { count: tournamentRows.length });

      if (reviewRows.length > 0) {
        await prisma.gradeReviewItem.createMany({ data: reviewRows });
        log.debug("Review items inseridos", { count: reviewRows.length });
      } else {
        log.debug("Nenhum review item necessário (sem extra plays)");
      }

      // ── Update import stats ─────────────────────────────────────────────────
      // matchedInGrade → played count
      // outOfGrade     → extra play count
      // suspect        → didn't play count
      await prisma.tournamentImport.update({
        where: { id: importRecord.id },
        data: {
          totalRows:      sheetResult.tournaments.length,
          matchedInGrade: playedCount,
          outOfGrade:     extraPlayCount,
          suspect:        didntPlayCount,
        },
      });

      totalProcessed += tournamentRows.length;

      log.success("✔ Aba processada com sucesso", {
        player: player.name,
        total: sheetResult.tournaments.length,
        played: playedCount,
        extraPlay: extraPlayCount,
        didntPlay: didntPlayCount,
      });

      importSheetsProcessed += 1;
      totalExtraPlaysAll += extraPlayCount;
      void notifyImportDone(player.name, player.id, importRecord.id, extraPlayCount);

      summary.push(
        `${player.name}: ${sheetResult.tournaments.length} torneios — ` +
        `${playedCount} jogados, ${extraPlayCount} extra play, ${didntPlayCount} não jogados`
      );
    }

    revalidatePath("/dashboard/imports");
    revalidatePath("/dashboard/review");
    revalidatePath("/dashboard");

    if (importSheetsProcessed > 0) {
      void notifyImportBatchExternal({
        fileName: file.name,
        sheetsProcessed: importSheetsProcessed,
        totalExtraPlays: totalExtraPlaysAll,
        summaryLines: summary,
      });
    }

    log.sep("IMPORTAÇÃO CONCLUÍDA");
    log.success("Importação finalizada", { file: file.name, processed: totalProcessed });
    return { success: true, processed: totalProcessed, summary };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : "Erro desconhecido ao processar arquivo";
    log.error("Falha na importação", err instanceof Error ? err : undefined, { file: file.name });
    return { success: false, error: msg };
  }
}
