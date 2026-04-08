import { prisma } from "../lib/prisma";

const PREDEFINED_GAMES = [
  { group: "Victor Hugo CL 2024", name: "Victor Hugo" },
  { group: "Fabiano CL 2022", name: "Fabiano" },
  { group: "adriano silva cl 2025", name: "Adriano" },
  { group: "Bernardo807 Cl 2025", name: "Bernardo" },
  { group: "Magno CL 2024", name: "Magno" },
  { group: "Braulio Bianchetti CL 2022", name: "Braulio" },
  { group: "Breno Lopes Cl 2024", name: "Brenin" },
  { group: "Bruno Sampaio CL 2025", name: "Bruno Sampaio" },
  { group: "pedrovier cl 2022", name: "Pedro vier" },
  { group: "joaomarcello cl 2024", name: "João Marcello" },
  { group: "mialarinha", name: "Iago Mialaret" },
  { group: "Vinicius Costa cl 2024", name: "Vinicius Costa" },
  { group: "heitor cl 2022", name: "Heitor" },
  { group: "savin cl 2025", name: "Savin" },
  { group: "joaofwebber_", name: "João Webber" },
  { group: "Bittar CL 2025", name: "Bittar" },
  { group: "Dallastra Cl 2025", name: "Dallastra" },
  { group: "Jorge Mattos CL", name: "Jorge Mattos" },
  { group: "TiagoLeonel CL", name: "Tiago Leonel" },
  { group: "kkarlinhos CL 2025", name: "KKarlinhos" },
  { group: "João lo-fi dream CL", name: "João Leão" },
  { group: "Victor.be CL2022", name: "Victor Be" },
  { group: "Guitavares ALL", name: "Gui Tavares" },
  { group: "marcio cl  2025", name: "Marcio" },
];

async function main() {
  console.log("Seeding base players with groups...");

  for (const player of PREDEFINED_GAMES) {
    const pGroup = player.group.trim();
    // Verifica se já existe para evitar duplicações se rodado duas vezes
    const ex = await prisma.player.findFirst({ where: { name: player.name }});
    if (!ex) {
      await prisma.player.create({
        data: {
          name: player.name,
          playerGroup: pGroup,
          status: "ACTIVE"
        }
      });
      console.log(`+ Jogador Criado: ${player.name} (${pGroup})`);
    } else {
      console.log(`- Jogador já existente: ${player.name}`);
    }
  }

  console.log("Sucesso! O Seed está concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
