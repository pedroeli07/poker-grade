import { prisma } from "@/lib/prisma";

async function main() {
  const caches = await prisma.sharkScopeCache.findMany({
    where: { dataType: "stats_10d", expiresAt: { gt: new Date() } },
    take: 3,
    select: { rawData: true, playerNick: { select: { nick: true } } },
  });
  
  for (const c of caches) {
    console.log("=== Nick:", c.playerNick.nick);
    const raw = c.rawData as Record<string, unknown>;
    
    // Tentamos buscar as estatísticas em todos os caminhos conhecidos do 10d
    let statArray: any = null;
    
    const resp = raw.Response as Record<string, any>;
    const pResponse = resp?.PlayerResponse;
    const pView = pResponse?.PlayerView;
    const pGroup = pView?.PlayerGroup;
    
    if (pGroup?.Statistics?.Statistic) {
      statArray = pGroup.Statistics.Statistic;
      console.log("Achou em PlayerView.PlayerGroup.Statistics.Statistic");
    } else if (pResponse?.PlayerView?.PlayerGroup?.Statistics) {
        statArray = pResponse.PlayerView.PlayerGroup.Statistics;
        console.log("Achou em blabla");
    }

    if (statArray) {
        if (!Array.isArray(statArray)) statArray = [statArray]; // As vezes o XML/JSON parse de 1 item não é array
        const early = statArray.find((s: any) => s["@id"] === "EarlyFinish");
        const late = statArray.find((s: any) => s["@id"] === "LateFinish");
        const roi = statArray.find((s: any) => s["@id"] === "AvROI");
        console.log("EarlyFinish:", early ? early["$"] : "NÃO VEIO");
        console.log("LateFinish:", late ? late["$"] : "NÃO VEIO");
        console.log("ROI:", roi ? roi["$"] : "NÃO VEIO");
    } else {
        console.log("Nenhum array de estatisticas encontrado na estrutura de dados", Object.keys(raw));
    }
    console.log("---");
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
