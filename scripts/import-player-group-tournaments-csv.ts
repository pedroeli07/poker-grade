/**
 * Importa nicks por rede a partir do CSV exportado no SharkScope (Player Group → torneios).
 * Um jogador pode ter um nick diferente em cada rede; o sync por API só gravava uma “chave” agregada.
 *
 * Uso:
 *   npx tsx scripts/import-player-group-tournaments-csv.ts --file "Bruno Sampaio CL 2025-Player Group-tournaments.csv" --player-name "Bruno Sampaio"
 *   npx tsx scripts/import-player-group-tournaments-csv.ts --file bruno.csv --player-name "Bruno Sampaio" --dry-run
 *   npx tsx scripts/import-player-group-tournaments-csv.ts --file bruno.csv --player-name "Bruno Sampaio" --nicks "$ampaioBruno,noname2323,Tbspurin,runnerB,bicAA demAissss"
 *
 * Se o CSV for do grupo inteiro (vários jogadores), use --nicks com a lista exata dos screen names
 * do jogador em cada site; caso contrário todos os "Jogador" distintos serão importados para o mesmo
 * playerId (só use --all-identities com consciência).
 */
import "dotenv/config";
import path from "node:path";

import { prisma } from "@/lib/prisma";
export type CsvNickRow = { redeRaw: string; jogador: string; appNetwork?: string };

import * as XLSX from "xlsx";
import fs from "node:fs";
import { sharkscopeNetworkToAppKey } from "@/lib/sharkscope/completed-tournaments-aggregate";

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

function parsePlayerGroupTournamentsFile(absPath: string): CsvNickRow[] {
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
    out.push({ redeRaw, jogador, appNetwork: appNetwork ?? undefined });
  }

  return out;
}

function filterRowsByNickAllowlist(rows: CsvNickRow[], allow: Set<string>): CsvNickRow[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const allowNorm = new Set([...allow].map(norm));
  return rows.filter((r) => allowNorm.has(norm(r.jogador)));
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let file: string | null = null;
  let playerName: string | null = null;
  let playerId: string | null = null;
  let nicksAllowlist: string | null = null;
  let dryRun = false;
  let allIdentities = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--file" && argv[i + 1]) {
      file = argv[i + 1]!;
      i++;
    }
    if (argv[i] === "--player-name" && argv[i + 1]) {
      playerName = argv[i + 1]!;
      i++;
    }
    if (argv[i] === "--player-id" && argv[i + 1]) {
      playerId = argv[i + 1]!;
      i++;
    }
    if (argv[i] === "--nicks" && argv[i + 1]) {
      nicksAllowlist = argv[i + 1]!;
      i++;
    }
    if (argv[i] === "--dry-run") dryRun = true;
    if (argv[i] === "--all-identities") allIdentities = true;
  }

  return { file, playerName, playerId, nicksAllowlist, dryRun, allIdentities };
}

async function main() {
  const { file, playerName, playerId, nicksAllowlist, dryRun, allIdentities } = parseArgs();

  if (!process.env.DATABASE_URL) {
    console.error("Defina DATABASE_URL.");
    process.exit(1);
  }
  if (!file) {
    console.error("Use --file caminho/para/arquivo.csv");
    process.exit(1);
  }
  if (!playerId && !playerName) {
    console.error("Use --player-id ou --player-name \"Nome\"");
    process.exit(1);
  }

  const abs = path.resolve(file);
  let rows: CsvNickRow[];
  try {
    rows = parsePlayerGroupTournamentsFile(abs);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  const player = playerId
    ? await prisma.player.findUnique({ where: { id: playerId }, select: { id: true, name: true } })
    : await prisma.player.findFirst({
        where: { name: { equals: playerName!, mode: "insensitive" }, status: "ACTIVE" },
        select: { id: true, name: true },
      });

  if (!player) {
    console.error("Jogador não encontrado.");
    process.exit(1);
  }

  const distinctJogadores = [...new Set(rows.map((r) => r.jogador))];
  console.log(`Arquivo: ${abs}`);
  console.log(`Jogador no app: ${player.name} (${player.id})`);
  console.log(`Linhas únicas (rede+jogador): ${rows.length}; nomes distintos na coluna Jogador: ${distinctJogadores.length}`);

  let toImport = rows;

  if (nicksAllowlist) {
    const allow = new Set(
      nicksAllowlist
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    toImport = filterRowsByNickAllowlist(rows, allow);
    console.log(`Filtro --nicks: ${toImport.length} par(es) para importar.`);
  } else if (!allIdentities && distinctJogadores.length > 1) {
    console.warn(
      "\nHá vários valores em \"Jogador\" no CSV (típico do grupo inteiro). Para não associar nicks de outros membros ao mesmo jogador,"
    );
    console.warn(
      "passe --nicks \"nick1,nick2,...\" com os screen names do jogador ou --all-identities para importar todos os pares (use só se o CSV for só desse jogador).\n"
    );
    console.warn("Jogadores distintos no arquivo:", distinctJogadores.slice(0, 20).join(", "));
    process.exit(1);
  }

  const unknown = toImport.filter((r) => r.appNetwork == null);
  if (unknown.length) {
    const uniq = [...new Set(unknown.map((r) => r.redeRaw))];
    console.warn("Redes não mapeadas no app (ignoradas). Adicione em sharkscopeNetworkToAppKey + poker-networks:", uniq.join(", "));
  }

  let written = 0;
  for (const r of toImport) {
    if (!r.appNetwork) continue;
    const nick = r.jogador.trim();
    if (!nick) continue;

    const line = `  [${r.appNetwork}] ${nick}  (${r.redeRaw})`;
    if (dryRun) {
      console.log(`[dry-run] ${line}`);
      continue;
    }

    await prisma.playerNick.upsert({
      where: {
        playerId_nick_network: {
          playerId: player.id,
          nick,
          network: r.appNetwork,
        },
      },
      update: { isActive: true },
      create: {
        playerId: player.id,
        nick,
        network: r.appNetwork,
        isActive: true,
      },
    });
    written++;
    console.log(line);
  }

  console.log(`\n${dryRun ? "" : ""}Concluído${dryRun ? " (dry-run)" : `: ${written} nick(s) gravado(s)`}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
