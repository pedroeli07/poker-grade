import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { sharkscopeNetworkToAppKey } from "@/lib/sharkscope/completed-tournaments-aggregate";

export type CsvNickRow = { redeRaw: string; jogador: string; appNetwork: string | null };

function normalizeHeader(h: string): string {
  return h.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function pickColumn(row: Record<string, unknown>, candidates: string[]): string {
  const cand = candidates.map((c) => normalizeHeader(c));
  for (const [k, v] of Object.entries(row)) {
    const nk = normalizeHeader(String(k));
    if (cand.includes(nk)) {
      return String(v ?? "").trim();
    }
  }
  for (const [k, v] of Object.entries(row)) {
    const nk = normalizeHeader(String(k));
    if (cand.some((c) => nk.includes(c) || c.includes(nk))) {
      return String(v ?? "").trim();
    }
  }
  return "";
}

/**
 * Lê CSV/XLSX export "Player Group tournaments" do SharkScope.
 * Retorna pares únicos (rede, jogador) com mapeamento para chave do app quando possível.
 */
export function parsePlayerGroupTournamentsFile(absPath: string): CsvNickRow[] {
  const ext = path.extname(absPath).toLowerCase();
  const wb =
    ext === ".csv"
      ? XLSX.read(fs.readFileSync(absPath, "utf8"), { type: "string", raw: false })
      : XLSX.readFile(absPath, { type: "file", raw: false });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
  if (rows.length === 0) return [];

  const first = rows[0]!;
  const headers = Object.keys(first);
  const hasRede = headers.some((h) => normalizeHeader(h).includes("rede"));
  const hasJogador = headers.some((h) => normalizeHeader(h).includes("jogador"));
  if (!hasRede || !hasJogador) {
    throw new Error(`CSV sem colunas Rede/Jogador. Cabeçalhos: ${headers.join(", ")}`);
  }

  const seen = new Set<string>();
  const out: CsvNickRow[] = [];

  for (const row of rows) {
    const redeRaw = pickColumn(row, ["Rede", "rede", "Network", "network"]);
    const jogador = pickColumn(row, ["Jogador", "jogador", "Player", "player"]);
    if (!redeRaw || !jogador) continue;
    const dedupe = `${redeRaw}\0${jogador}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    const appNetwork = sharkscopeNetworkToAppKey(redeRaw);
    out.push({ redeRaw, jogador, appNetwork });
  }

  return out;
}

export function filterRowsByNickAllowlist(rows: CsvNickRow[], allow: Set<string>): CsvNickRow[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const allowNorm = new Set([...allow].map(norm));
  return rows.filter((r) => allowNorm.has(norm(r.jogador)));
}
