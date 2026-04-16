"use server";

import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseExcelBuffer, parseLobbyzeDate } from "@/lib/excel-parser";
import { matchTournamentToGrade } from "@/lib/grade-matcher";
import { ErrorTypes, MatchResult } from "@/lib/types";
import { requireSession, type AppSession } from "@/lib/auth/session";
import { canDeleteImports, IMPORT_ROLES } from "@/lib/auth/rbac";
import { notifyImportDone } from "@/lib/queries/db/notification";
import { notifyImportBatchExternal } from "@/lib/notify-import-external";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { limitImportsDelete, limitImportsUpload } from "@/lib/rate-limit";
import { importsQueryRead } from "@/lib/queries/db/query-pipeline";
import { deleteImportIdsSchema } from "@/lib/schemas";
import { getImportsListRowsForSession } from "@/lib/data/imports";
import type { Err, ImportListRow, Ok } from "@/lib/types";
import { fail, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { importsQueriesLog } from "@/lib/constants/queries-mutations";
import { revalidateImports } from "@/lib/constants/revalidate-app";
import { coachPlayerFilter } from "../shared";
import { GradeType, PlayerStatus, ReviewStatus, TournamentMatchStatus, UserRole } from "@prisma/client";

// ─── Pipeline guards ──────────────────────────────────────────────────────────

async function withMutation(
  guard: (s: AppSession) => void | boolean,
  rateLimit: typeof limitImportsDelete,
  fn: (s: AppSession) => Promise<string[] | void>
): Promise<Ok | Err> {
  const session = await requireSession();
  const allowed = guard(session);
  if (allowed === false) return fail(ErrorTypes.FORBIDDEN);
  
  const rl = await rateLimit(session.userId);
  if (!rl.ok) return fail(`Muitas requisições. Aguarde ${rl.retryAfterSec}s.`);
  try {
    const extra = await fn(session);
    revalidateImports(...(extra ?? []));
    return { ok: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    importsQueriesLog.error("Erro na mutation de import", err instanceof Error ? err : undefined);
    return fail(err instanceof Error ? err.message : ErrorTypes.OPERATION_FAILED);
  }
}

function classifyScheduling(scheduling: string | null) {
  const s = (scheduling ?? "").toLowerCase().trim();
  if (s.includes("extra")) return "extra" as const;
  if (s === "played") return "played" as const;
  return "missed" as const;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getImportsForSession(session: AppSession) {
  const take = 50;
  const orderBy = { createdAt: "desc" as const };
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER || session.role === UserRole.VIEWER) {
    return prisma.tournamentImport.findMany({ orderBy, take });
  }
  if (session.role === UserRole.COACH && session.coachId) {
    const players = await prisma.player.findMany({ where: coachPlayerFilter(session.coachId), select: { name: true, nickname: true } });
    const names = [...new Set(players.flatMap((p) => [p.name, p.nickname].filter(Boolean) as string[]))];
    if (names.length === 0) return [];
    return prisma.tournamentImport.findMany({
      where: { OR: names.map((n) => ({ playerName: { equals: n, mode: "insensitive" as const } })) },
      orderBy, take,
    });
  }
  if (session.role === UserRole.PLAYER && session.playerId) {
    const p = await prisma.player.findUnique({ where: { id: session.playerId }, select: { name: true, nickname: true } });
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
    const players = await prisma.player.findMany({ where: coachPlayerFilter(session.coachId), select: { name: true, nickname: true } });
    const nameSet = new Set(players.flatMap((p) => [p.name, p.nickname].filter(Boolean) as string[]).map((n) => n.toLowerCase()));
    if (nameSet.size === 0) return [];
    const imports = await prisma.tournamentImport.findMany({
      where: { id: { in: unique }, OR: [...nameSet].map((n) => ({ playerName: { equals: n, mode: "insensitive" as const } })) },
      select: { id: true },
    });
    return imports.map((i) => i.id);
  }
  return [];
}

export async function getImportDetailForSession(session: AppSession, importId: string) {
  const importRecord = await prisma.tournamentImport.findUnique({
    where: { id: importId },
    include: { tournaments: { include: { reviewItem: { select: { id: true, status: true, isInfraction: true } } }, orderBy: { date: "asc" } } },
  });
  if (!importRecord) return null;
  if (session.role === UserRole.PLAYER && session.playerId) {
    const player = await prisma.player.findUnique({ where: { id: session.playerId }, select: { name: true, nickname: true } });
    if (!player) return null;
    const pn = importRecord.playerName?.toLowerCase() ?? "";
    if (pn !== player.name?.toLowerCase() && pn !== player.nickname?.toLowerCase()) return null;
  }
  if (session.role === UserRole.COACH && session.coachId) {
    const players = await prisma.player.findMany({ where: coachPlayerFilter(session.coachId), select: { name: true, nickname: true } });
    const names = players.flatMap((p) => [p.name, p.nickname].filter(Boolean) as string[]).map((n) => n.toLowerCase());
    const pn = importRecord.playerName?.toLowerCase() ?? "";
    if (!names.includes(pn)) return null;
  }
  return importRecord;
}

export async function getImportsListRowsAction(): Promise<{ ok: true; rows: ImportListRow[] } | Err> {
  const result = await importsQueryRead.readData(getImportsListRowsForSession);
  return result.ok ? { ok: true, rows: result.data } : result;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function deleteImports(ids: string[]): Promise<{ success: boolean; error?: string }> {
  const parsed = deleteImportIdsSchema.safeParse(ids);
  if (!parsed.success) return { success: false, error: ErrorTypes.INVALID_DATA };

  const res = await withMutation(
    s => canDeleteImports(s),
    limitImportsDelete,
    async (session) => {
      const requested = [...new Set(parsed.data)];
      const allowed = await filterImportIdsDeletableBySession(session, requested);
      
      if (allowed.length !== requested.length) {
        throw new Error("Uma ou mais importações não existem ou você não tem permissão para removê-las.");
      }

      await prisma.playedTournament.deleteMany({ where: { importId: { in: allowed } } });
      await prisma.tournamentImport.deleteMany({ where: { id: { in: allowed } } });
      importsQueriesLog.success("Importações excluídas", { count: allowed.length });
    }
  );
  
  if (!res.ok) return { success: false, error: res.error };
  return { success: true };
}

type UploadResult =
  | { success: true; processed: number; summary: string[] }
  | { success: false; error: string };

export async function uploadTournaments(formData: FormData): Promise<UploadResult> {
  const session = await requireSession();

  if (!IMPORT_ROLES.includes(session.role)) {
    return { success: false, error: "Sem permissão para importar torneios." };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: ErrorTypes.NOT_FOUND };

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

  importsQueriesLog.sep("INÍCIO DA IMPORTAÇÃO");
  importsQueriesLog.info("Arquivo recebido", { fileName: file.name, sizeKB: Math.round(file.size / 1024) });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parseResults = parseExcelBuffer(arrayBuffer);

    importsQueriesLog.info("Excel parseado", {
      abas: parseResults.length,
      totalLinhas: parseResults.reduce((s, r) => s + r.tournaments.length, 0),
    });

    const allPlayers = await prisma.player.findMany({
      include: {
        gradeAssignments: {
          where: { isActive: true },
          include: { gradeProfile: { include: { rules: true } } },
        },
      },
    });

    let totalProcessed = 0;
    const summary: string[] = [];
    let importSheetsProcessed = 0;
    let totalExtraPlaysAll = 0;

    for (const sheetResult of parseResults) {
      importsQueriesLog.sep(sheetResult.playerName);

      if (sheetResult.tournaments.length === 0) {
        importsQueriesLog.warn("Aba vazia — ignorada", { sheet: sheetResult.playerName });
        continue;
      }

      // ── Pre-analyze scheduling from Lobbyze
      const schedulingStats = sheetResult.tournaments.reduce(
        (acc, t) => {
          const cat = classifyScheduling(t.scheduling);
          acc[cat]++;
          return acc;
        },
        { played: 0, extra: 0, missed: 0 }
      );

      importsQueriesLog.info("Scheduling Lobbyze (antes de qualquer matching)", {
        sheet: sheetResult.playerName,
        played: schedulingStats.played,
        extraPlay: schedulingStats.extra,
        didntPlay: schedulingStats.missed,
        total: sheetResult.tournaments.length,
      });

      // ── Find or create player
      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
      const target = normalize(sheetResult.playerName);

      let player = allPlayers.find(
        (p) => normalize(p.name) === target || (p.nickname && normalize(p.nickname) === target)
      );

      if (!player) {
        if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER) {
          importsQueriesLog.warn("Jogador não encontrado — criando automaticamente", { sheetName: sheetResult.playerName });
          player = await prisma.player.create({
            data: { name: sheetResult.playerName, nickname: sheetResult.playerName, status: PlayerStatus.ACTIVE },
            include: {
              gradeAssignments: { where: { isActive: true }, include: { gradeProfile: { include: { rules: true } } } },
            },
          });
          importsQueriesLog.success("Novo jogador criado", { id: player.id, name: player.name });
          summary.push(`Novo jogador criado: ${player.name}`);
          allPlayers.push(player);
        } else {
          importsQueriesLog.warn("Jogador não encontrado — aba ignorada", { sheet: sheetResult.playerName });
          summary.push(`Jogador não encontrado: ${sheetResult.playerName}`);
          continue;
        }
      } else {
        importsQueriesLog.debug("Jogador encontrado", { id: player.id, name: player.name });
      }

      // ── Permission check
      if (session.role === UserRole.PLAYER) {
        if (!session.playerId || player.id !== session.playerId) {
          importsQueriesLog.warn("Permissão negada — jogador não é o próprio", { sheet: sheetResult.playerName });
          summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
          continue;
        }
      } else if (session.role === UserRole.COACH && session.coachId) {
        if (player.coachId !== session.coachId && player.driId !== session.coachId) {
          importsQueriesLog.warn("Permissão negada — jogador não é da carteira", { sheet: sheetResult.playerName });
          summary.push(`Sem permissão para a aba: ${sheetResult.playerName}`);
          continue;
        }
      }

      // ── Grade matching
      const mainGrade = player.gradeAssignments.find((a) => a.gradeType === GradeType.MAIN)?.gradeProfile;

      if (!mainGrade) {
        importsQueriesLog.warn("Sem grade principal", { player: player.name });
      } else {
        importsQueriesLog.info("Grade principal", { player: player.name, grade: mainGrade.name, regras: mainGrade.rules.length });
      }

      // ── Create import record
      const importRecord = await prisma.tournamentImport.create({
        data: { fileName: file.name, importType: "excel", playerName: player.name, importedBy: session.userId },
      });

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
        playerId: string; tournamentId: string; status: ReviewStatus; isInfraction: boolean;
      }> = [];

      for (const t of sheetResult.tournaments) {
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
          id: tournamentId, playerId: player.id, importId: importRecord.id,
          date: dateObj, site: t.site, buyInCurrency: t.buyInCurrency,
          buyInValue: buyInNumeric, buyInUsd: Number(t.buyInUsd) || buyInNumeric,
          tournamentName: t.tournamentName, scheduling: t.scheduling ?? "",
          rebuy: t.rebuy, speed: t.speed, sharkId: t.sharkId || null,
          priority: t.priority, matchStatus, matchedRuleId,
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
          totalRows:      sheetResult.tournaments.length,
          matchedInGrade: playedCount,
          outOfGrade:     extraPlayCount,
          suspect:        didntPlayCount,
        },
      });

      totalProcessed += tournamentRows.length;
      importSheetsProcessed += 1;
      totalExtraPlaysAll += extraPlayCount;
      void notifyImportDone(player.name, player.id, importRecord.id, extraPlayCount);

      summary.push(
        `${player.name}: ${sheetResult.tournaments.length} torneios — ${playedCount} jogados, ${extraPlayCount} extra play, ${didntPlayCount} não jogados`
      );
    }

    revalidateImports();

    if (importSheetsProcessed > 0) {
      void notifyImportBatchExternal({
        fileName: file.name,
        sheetsProcessed: importSheetsProcessed,
        totalExtraPlays: totalExtraPlaysAll,
        summaryLines: summary,
      });
    }

    importsQueriesLog.success("Importação finalizada", { file: file.name, processed: totalProcessed });
    return { success: true, processed: totalProcessed, summary };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    importsQueriesLog.error("Falha na importação", err instanceof Error ? err : undefined, { file: file.name });
    return {
      success: false,
      error: "Não foi possível processar o arquivo. Verifique o formato e tente novamente.",
    };
  }
}
