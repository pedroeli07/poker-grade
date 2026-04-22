/**
 * Sincroniza nicks por rede a partir dos torneios agregados do Player Group (SharkScope),
 * para preencher `player_nicks` dos jogadores com `playerGroup`.
 *
 * Ignora jogadores com alerta ativo `group_not_found` (grupo não reconhecido na API).
 *
 * Uso:
 *   npx tsx scripts/sync-sharkscope-group-nicks.ts
 *   npx tsx scripts/sync-sharkscope-group-nicks.ts --dry-run
 *   npx tsx scripts/sync-sharkscope-group-nicks.ts --live
 *   npx tsx scripts/sync-sharkscope-group-nicks.ts --group "adriano silva cl 2025"
 *   npx tsx scripts/sync-sharkscope-group-nicks.ts --min-score 50
 *   npx tsx scripts/sync-sharkscope-group-nicks.ts --csv player-groups.csv
 *
 * Variáveis: DATABASE_URL, SHARKSCOPE_APP_NAME, SHARKSCOPE_APP_KEY (para --live ou cache vazio).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { sharkScopeAppKey, sharkScopeAppName } from "@/lib/constants/env";
import {
  assignSharkKeysToPlayers,
  buildNickUpsertPlans,
  getOrFetchGroupBreakdown30d,
  type PlayerLite,
} from "@/lib/sharkscope/daily-sync/sync-player-nicks-from-groups";

/** Tabela estilo Markdown (`player-groups.csv`): coluna "Grupo Shark" = nome do playerGroup. */
function readGroupFilterFromMarkdownTable(filePath: string): Set<string> {
  const abs = path.resolve(filePath);
  const text = fs.readFileSync(abs, "utf8");
  const groups = new Set<string>();
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|") || /^[\|\s:-]+$/.test(t)) continue;
    const parts = t.split("|").map((s) => s.trim());
    if (parts.length < 3) continue;
    const c0 = (parts[1] ?? "").toLowerCase();
    if (c0 === "jogador" || c0 === "grupo shark") continue;
    const g = parts[2]?.trim();
    if (g) groups.add(g);
  }
  return groups;
}

function parseArgs() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`Uso: npx tsx scripts/sync-sharkscope-group-nicks.ts [opções]

Opções:
  --dry-run          Só lista o que seria gravado (sem Prisma write)
  --live             Força fetch na API antes do cache (requer SHARKSCOPE_*)
  --group "nome"     Apenas um playerGroup
  --csv caminho      Filtra pelos grupos na 2ª coluna (tabela Markdown)
  --min-score N      Pontuação mínima para casar jogador ↔ nick Shark (default 40)
  --no-volume-fallback  Desliga fallback por volume (só grupos com 1 jogador)
`);
    process.exit(0);
  }
  const dryRun = argv.includes("--dry-run");
  const live = argv.includes("--live");
  const volumeFallback = !argv.includes("--no-volume-fallback");
  let group: string | null = null;
  let csvPath: string | null = null;
  let minScore = 40;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--group" && argv[i + 1]) {
      group = argv[i + 1]!;
      i++;
    }
    if (argv[i] === "--csv" && argv[i + 1]) {
      csvPath = argv[i + 1]!;
      i++;
    }
    if (argv[i] === "--min-score" && argv[i + 1]) {
      const n = parseInt(argv[i + 1]!, 10);
      if (Number.isFinite(n)) minScore = n;
      i++;
    }
  }
  return { dryRun, live, group, csvPath, minScore, volumeFallback };
}

async function main() {
  const { dryRun, live, group: onlyGroup, csvPath, minScore, volumeFallback } = parseArgs();
  const csvGroups = csvPath ? readGroupFilterFromMarkdownTable(csvPath) : null;
  if (csvPath && (!csvGroups || csvGroups.size === 0)) {
    console.error(`Nenhum grupo lido de ${csvPath} (esperada tabela Markdown com coluna Grupo Shark).`);
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("Defina DATABASE_URL.");
    process.exit(1);
  }

  const notFoundRows = await prisma.alertLog.findMany({
    where: { alertType: "group_not_found", acknowledged: false },
    select: { playerId: true },
    distinct: ["playerId"],
  });
  const skipIds = new Set(notFoundRows.map((r) => r.playerId));

  const groupWhere =
    onlyGroup != null
      ? { playerGroup: onlyGroup }
      : csvGroups
        ? { playerGroup: { in: [...csvGroups] } }
        : { playerGroup: { not: null } };

  const players = await prisma.player.findMany({
    where: {
      status: "ACTIVE",
      ...groupWhere,
    },
    select: { id: true, name: true, nickname: true, playerGroup: true },
    orderBy: [{ playerGroup: "asc" }, { name: "asc" }],
  });

  const eligible = players.filter((p) => !skipIds.has(p.id));
  if (eligible.length === 0) {
    console.log("Nenhum jogador elegível (ativo com playerGroup, sem alerta group_not_found).");
    return;
  }

  const skipped = players.length - eligible.length;
  if (skipped > 0) {
    console.log(`Ignorados ${skipped} jogador(es) com grupo SharkScope não encontrado.`);
  }

  const byGroup = new Map<string, PlayerLite[]>();
  for (const p of eligible) {
    const g = p.playerGroup!.trim();
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push({ id: p.id, name: p.name, nickname: p.nickname });
  }

  if (live && (!sharkScopeAppName || !sharkScopeAppKey)) {
    console.error("Para --live defina SHARKSCOPE_APP_NAME e SHARKSCOPE_APP_KEY.");
    process.exit(1);
  }

  let totalPlans = 0;
  let written = 0;

  for (const [groupName, members] of byGroup) {
    console.log(`\n── Grupo: "${groupName}" (${members.length} jogador(es))`);

    const payload = await getOrFetchGroupBreakdown30d(groupName, live);
    if (!payload?.byPlayerNick || Object.keys(payload.byPlayerNick).length === 0) {
      console.log(`  Sem dados byPlayerNick (cache 30d vazio e/ou API). Rode o cron ou use --live com credenciais.`);
      continue;
    }

    const sharkKeys = Object.keys(payload.byPlayerNick);
    const { assignments, unmatchedKeys, unmatchedPlayers } = assignSharkKeysToPlayers(
      members,
      sharkKeys,
      minScore,
      groupName,
      {
        volumeFallback,
        byPlayerNick: payload.byPlayerNick,
      }
    );

    if (unmatchedKeys.length) {
      console.log(`  Chaves SharkScope não associadas (${unmatchedKeys.length}): ${unmatchedKeys.slice(0, 12).join(", ")}`);
    }
    if (unmatchedPlayers.length) {
      console.log(
        `  Jogadores sem par (${unmatchedPlayers.length}): ${unmatchedPlayers.map((p) => p.name).join(", ")}`
      );
    }

    const plans = buildNickUpsertPlans(members, assignments, payload.byPlayerNick);
    totalPlans += plans.length;

    for (const plan of plans) {
      const line = `  ${plan.playerName} → [${plan.network}] nick="${plan.nick}" (shark: ${plan.sharkKey})`;
      if (dryRun) {
        console.log(`[dry-run] ${line}`);
        continue;
      }
      await prisma.playerNick.upsert({
        where: {
          playerId_nick_network: {
            playerId: plan.playerId,
            nick: plan.nick,
            network: plan.network,
          },
        },
        update: { isActive: true },
        create: {
          playerId: plan.playerId,
          nick: plan.nick,
          network: plan.network,
          isActive: true,
        },
      });
      written++;
      console.log(line);
    }
  }

  console.log(`\nResumo: ${totalPlans} nick(s) planejado(s)${dryRun ? " (dry-run)" : `, ${written} gravado(s)`}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
