/**
 * Sincroniza SharkScope só para um `playerGroup` (1× statistics lifetime + CT 90d + stats 10/30/90d),
 * sem rodar o sync de stats por nick×rede (economiza buscas na API).
 *
 * Uso:
 *   npx tsx scripts/sync-sharkscope-single-group.ts joaofwebber_
 *   npx tsx scripts/sync-sharkscope-single-group.ts --group joaofwebber_
 *   npx tsx scripts/sync-sharkscope-single-group.ts --group "nome exato" --cache
 *
 * `--cache` usa TTL do cache (menos chamadas à API; pode estar desatualizado).
 * Sem `--cache`: força refresh como o botão "Sincronizar".
 *
 * Requer: DATABASE_URL, SHARKSCOPE_APP_NAME, SHARKSCOPE_APP_KEY
 */
import "dotenv/config";

import { runDailySyncSharkScope } from "@/lib/sharkscope/daily-sync/run-daily-sync";

function parseArgs(): { group: string; forceRefresh: boolean } {
  const argv = process.argv.slice(2);
  let group: string | undefined;
  let forceRefresh = true;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--group" && argv[i + 1]) {
      group = argv[++i]!;
    } else if (a === "--cache") {
      forceRefresh = false;
    } else if (a && !a.startsWith("-") && group === undefined) {
      group = a;
    }
  }
  return { group: group ?? "joaofwebber_", forceRefresh };
}

async function main() {
  const { group, forceRefresh } = parseArgs();
  console.log(`SharkScope (grupo único): "${group}" | forceRefresh=${forceRefresh}`);
  const result = await runDailySyncSharkScope(forceRefresh, { onlyPlayerGroup: group });
  console.log(JSON.stringify(result, null, 2));
  if (result.processed === 0 && result.errors === 0) {
    console.error(
      "Nenhum jogador ativo com esse playerGroup no banco. Confira o nome (ex.: joaofwebber_)."
    );
    process.exitCode = 1;
  }
  if (result.errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
