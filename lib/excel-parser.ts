/**
 * Excel/CSV Parser for Tournament Data
 *
 * Parses Lobbyze exported Excel files with columns:
 * Date | Site | Currency | Buy-In | $ Buy-In | Tournament | Scheduling | Rebuy | Speed | Shark | Priority
 *
 * The sheet tab name represents the player name/nickname.
 */

import * as XLSX from "xlsx";
import type { ExcelTournamentRow, ExcelParseResult } from "@/lib/types";
import { createLogger } from "./logger";

const log = createLogger("excel-parser");

/**
 * Parse an Excel buffer into tournament data
 */
export function parseExcelBuffer(buffer: ArrayBuffer): ExcelParseResult[] {
  log.info("Iniciando parse do Excel", { byteLength: buffer.byteLength });
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const results: ExcelParseResult[] = [];

  log.debug("Abas encontradas", { sheets: workbook.SheetNames });

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      dateNF: "yyyy-mm-dd HH:mm",
    });

    if (rawData.length < 2) {
      log.warn("Planilha sem dados suficientes", { sheet: sheetName });
      results.push({
        playerName: sheetName,
        tournaments: [],
        errors: ["Planilha vazia ou sem dados"],
        totalRows: 0,
      });
      continue;
    }

    const tournaments: ExcelTournamentRow[] = [];
    const errors: string[] = [];

    // Skip header row (index 0)
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!Array.isArray(row) || row.length < 6) continue;

      try {
        const dateStr = String(row[0] || "").trim();
        if (!dateStr) continue;

        const site = String(row[1] || "").trim();
        const buyInCurrency = String(row[2] || "$").trim();
        const buyInValue = parseFloat(String(row[3] || "0").replace(",", "."));
        const buyInUsd = parseFloat(String(row[4] || "0").replace(/[^0-9.,]/g, "").replace(",", "."));
        const tournamentName = String(row[5] || "").trim();
        const scheduling = String(row[6] || "").trim();
        const rebuy = row[7] === 1 || row[7] === "1" || row[7] === true;
        const speed = String(row[8] || "").trim();
        const sharkId = String(row[9] || "").trim();
        const priority = String(row[10] || "None").trim();

        if (!site || !tournamentName) {
          errors.push(`Linha ${i + 1}: site ou nome do torneio vazio`);
          continue;
        }

        tournaments.push({
          date: dateStr,
          site,
          buyInCurrency,
          buyInValue: isNaN(buyInValue) ? 0 : buyInValue,
          buyInUsd: isNaN(buyInUsd) ? buyInValue : buyInUsd,
          tournamentName,
          scheduling,
          rebuy,
          speed,
          sharkId,
          priority,
        });
      } catch (err) {
        errors.push(`Linha ${i + 1}: erro ao processar - ${String(err)}`);
      }
    }

    results.push({
      playerName: sheetName,
      tournaments,
      errors,
      totalRows: rawData.length - 1,
    });
    log.info("Aba processada", {
      sheet: sheetName,
      rows: tournaments.length,
      parseErrors: errors.length,
    });
  }

  const totalRows = results.reduce((n, r) => n + r.tournaments.length, 0);
  log.success("Parse Excel concluído", {
    sheets: results.length,
    tournamentRows: totalRows,
  });

  return results;
}

/**
 * Parse date string from Lobbyze Excel format
 * Format: "quinta-feira, março 12, 2026 - 2:30 PM"
 */
export function parseLobbyzeDate(dateStr: string): Date | null {
  try {
    // Try ISO format first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) return isoDate;

    // Try Portuguese format: "dia-da-semana, mês DD, YYYY - HH:MM AM/PM"
    const monthMap: Record<string, number> = {
      janeiro: 0, fevereiro: 1, março: 2, abril: 3,
      maio: 4, junho: 5, julho: 6, agosto: 7,
      setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
    };

    // Remove day-of-week and parse
    const parts = dateStr.replace(/^[^,]+,\s*/, "");
    const match = parts.match(
      /(\w+)\s+(\d+),\s*(\d{4})\s*-\s*(\d+):(\d+)\s*(AM|PM)?/i
    );

    if (match) {
      const month = monthMap[match[1].toLowerCase()] ?? 0;
      const day = parseInt(match[2]);
      const year = parseInt(match[3]);
      let hours = parseInt(match[4]);
      const minutes = parseInt(match[5]);
      const ampm = match[6];

      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
      }

      return new Date(year, month, day, hours, minutes);
    }

    return null;
  } catch {
    log.debug("parseLobbyzeDate falhou", { dateStr: dateStr.slice(0, 80) });
    return null;
  }
}
