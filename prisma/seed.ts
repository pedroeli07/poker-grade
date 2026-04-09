import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function site(id: number, text: string) {
  return { item_id: id, item_text: text };
}
function item(id: number, text: string) {
  return { item_id: id, item_text: text };
}

const POKERSTARS = site(1, "PokerStars");
const GGNETWORK = site(5, "GG Network");

const SPEED_REGULAR = item(1, "Regular");
const SPEED_TURBO = item(2, "Turbo");

const VARIANT_KO = item(2, "Knockout");
const VARIANT_PKO = item(3, "Mystery Knockout");

const TYPE_REGULAR = item(1, "Regular");
const TYPE_PKO = item(5, "Progressive KO");

// ──────────────────────────────────────────────
// Realistic tournament pools
// ──────────────────────────────────────────────

const TOURNAMENTS_GG_LOW = [
  { name: "$32,00 Bounty Hunters Special $32", buyIn: 32, site: "GG Network", speed: "Regular" },
  { name: "$54,00 Bounty Hunters Special $54", buyIn: 54, site: "GG Network", speed: "Regular" },
  { name: "$21,60 Bounty Hunters Special $21.60", buyIn: 21.6, site: "GG Network", speed: "Regular" },
  { name: "GMasters $25, $35K GTD", buyIn: 25, site: "GG Network", speed: "Regular" },
  { name: "$32,00 Bounty Hunters Deepstack Turbo $32", buyIn: 32, site: "GG Network", speed: "Turbo" },
  { name: "Bounty Hunters Special $54 — Re-Entry", buyIn: 54, site: "GG Network", speed: "Regular" },
  { name: "$44,00 GGMasters $44, $2M GTD", buyIn: 44, site: "GG Network", speed: "Regular" },
  { name: "$27,00 Zodiac Championship $27", buyIn: 27, site: "GG Network", speed: "Regular" },
];

const TOURNAMENTS_GG_MICRO = [
  { name: "$10,80 Bounty Hunters Special $10.80", buyIn: 10.8, site: "GG Network", speed: "Regular" },
  { name: "$10,00 Daily Special $10", buyIn: 10, site: "GG Network", speed: "Regular" },
  { name: "$16,50 Bounty Hunters $16.50", buyIn: 16.5, site: "GG Network", speed: "Regular" },
  { name: "GMasters Asia $10, $10K GTD", buyIn: 10, site: "GG Network", speed: "Regular" },
  { name: "$21,60 Bounty Hunters Special $21.60", buyIn: 21.6, site: "GG Network", speed: "Regular" },
  { name: "$5,25 Bounty Hunters $5.25", buyIn: 5.25, site: "GG Network", speed: "Regular" },
];

const TOURNAMENTS_STARS_LOW = [
  { name: "$44,00 BOUNTY BUILDER 44", buyIn: 44, site: "PokerStars", speed: "Regular" },
  { name: "$33,00 BOUNTY BUILDER 33", buyIn: 33, site: "PokerStars", speed: "Regular" },
  { name: "$55,00 MINI BOUNTY BUILDER HR", buyIn: 55, site: "PokerStars", speed: "Regular" },
  { name: "$22,00 BOUNTY BUILDER 22", buyIn: 22, site: "PokerStars", speed: "Regular" },
  { name: "$44,00 Bounty Builder $44, $2K Gtd", buyIn: 44, site: "PokerStars", speed: "Regular" },
  { name: "$55,00 SCOOP 01: $55 NLHE [Phase 1], $750K Gtd", buyIn: 55, site: "PokerStars", speed: "Regular" },
  { name: "$33,00 SCOOP 02: $33 NLHE [8-Max], $200K Gtd", buyIn: 33, site: "PokerStars", speed: "Regular" },
  { name: "$16,50 BOUNTY BUILDER 16,50", buyIn: 16.5, site: "PokerStars", speed: "Regular" },
];

const TOURNAMENTS_STARS_MICRO = [
  { name: "$11,00 BOUNTY BUILDER 11", buyIn: 11, site: "PokerStars", speed: "Regular" },
  { name: "$16,50 BOUNTY BUILDER 16,50", buyIn: 16.5, site: "PokerStars", speed: "Regular" },
  { name: "$5,50 BOUNTY BUILDER 5,50", buyIn: 5.5, site: "PokerStars", speed: "Regular" },
  { name: "$16,50 SCOOP 5-L: $16.50 NLHE [7-Max]", buyIn: 16.5, site: "PokerStars", speed: "Regular" },
  { name: "$11,00 SCOOP 1-L: $11 NLHE [Phase 1]", buyIn: 11, site: "PokerStars", speed: "Regular" },
  { name: "$8,80 Turbo Bounty Builder", buyIn: 8.8, site: "PokerStars", speed: "Turbo" },
];

const TOURNAMENTS_STARS_MID = [
  { name: "$109,00 SCOOP 68-L: $109 NLHE [Progressive KO, Mini Thursday Thrill], $250K Gtd", buyIn: 109, site: "PokerStars", speed: "Regular" },
  { name: "$55,00 SCOOP 5-M: $55 NLHE [Deep Stacks], $100K Gtd", buyIn: 55, site: "PokerStars", speed: "Regular" },
  { name: "$109,00 BOUNTY BUILDER HR 109", buyIn: 109, site: "PokerStars", speed: "Regular" },
  { name: "$215,00 SCOOP 68-H: $215 NLHE [Progressive KO], $1M Gtd", buyIn: 215, site: "PokerStars", speed: "Regular" },
  { name: "$109,00 Sunday Special SE", buyIn: 109, site: "PokerStars", speed: "Regular" },
  { name: "$55,00 MicroMillions 11: $55 NLHE [Progressive KO]", buyIn: 55, site: "PokerStars", speed: "Regular" },
];

const TOURNAMENTS_OUT_OF_GRADE_LOW = [
  { name: "$109,00 SCOOP Edition: StackOsaurus $109 [8-Max, Progressive KO], $60K Gtd", buyIn: 109, site: "PokerStars", speed: "Regular" },
  { name: "$150,00 C2: Boosted: Zodiac Grand Deepstack ¥150", buyIn: 150, site: "GG Network", speed: "Regular" },
  { name: "$215,00 SCOOP 68-H: $215 NLHE [Progressive KO], $1M Gtd", buyIn: 215, site: "PokerStars", speed: "Regular" },
];

const TOURNAMENTS_OUT_OF_GRADE_MICRO = [
  { name: "$55,00 MINI BOUNTY BUILDER HR", buyIn: 55, site: "PokerStars", speed: "Regular" },
  { name: "$32,00 Bounty Hunters Special $32", buyIn: 32, site: "GG Network", speed: "Regular" },
  { name: "$44,00 Bounty Builder $44, $2K Gtd", buyIn: 44, site: "PokerStars", speed: "Regular" },
];

// ──────────────────────────────────────────────
// Date helpers
// ──────────────────────────────────────────────

function daysAgo(n: number, hour = 14, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d;
}

// ──────────────────────────────────────────────
// Build tournament rows for a player's import
// ──────────────────────────────────────────────

interface TournamentRow {
  name: string;
  buyIn: number;
  site: string;
  speed: string;
  scheduling: string; // "Played" | "Didn't play" | "Extra play"
  rebuy: boolean;
  dayOffset: number;
  hour: number;
  priority: string;
}

function buildSchedule(
  inGrade: Array<{ name: string; buyIn: number; site: string; speed: string }>,
  outOfGrade: Array<{ name: string; buyIn: number; site: string; speed: string }>,
  opts: { extraPlayCount?: number; rebuyCount?: number; dontPlayCount?: number } = {}
): TournamentRow[] {
  const { extraPlayCount = 2, rebuyCount = 1, dontPlayCount = 4 } = opts;
  const rows: TournamentRow[] = [];
  const pool = [...inGrade];

  const hour = 13;
  for (let i = 0; i < pool.length; i++) {
    const t = pool[i % pool.length];
    const dayOffset = Math.floor(i / 4);
    const isRebuy = rows.filter((r) => r.rebuy).length < rebuyCount && i === 3;
    const isDontPlay = i < dontPlayCount && i % 5 === 0;

    rows.push({
      ...t,
      scheduling: isDontPlay ? "Didn't play" : "Played",
      rebuy: isRebuy,
      dayOffset,
      hour: hour + (i % 3) * 2,
      priority: t.buyIn >= 55 ? "HIGH" : t.buyIn >= 30 ? "MEDIUM" : "None",
    });
  }

  // Add extra plays
  for (let i = 0; i < Math.min(extraPlayCount, outOfGrade.length); i++) {
    const t = outOfGrade[i];
    rows.push({
      ...t,
      scheduling: "Extra play",
      rebuy: false,
      dayOffset: i + 1,
      hour: 19 + i,
      priority: t.buyIn >= 109 ? "HIGH" : "MEDIUM",
    });
  }

  return rows.sort((a, b) => a.dayOffset - b.dayOffset || a.hour - b.hour);
}

// ──────────────────────────────────────────────
// Main seed
// ──────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed completo...\n");

  // ── 1. Limpar dados (exceto auth admin) ──────
  console.log("🗑️  Limpando dados anteriores...");
  await prisma.auditLog.deleteMany();
  await prisma.gradeReviewItem.deleteMany();
  await prisma.playedTournament.deleteMany();
  await prisma.tournamentImport.deleteMany();
  await prisma.limitChangeHistory.deleteMany();
  await prisma.playerTarget.deleteMany();
  await prisma.playerGradeAssignment.deleteMany();
  await prisma.gradeRule.deleteMany();
  await prisma.gradeProfile.deleteMany();
  await prisma.player.deleteMany();
  await prisma.coach.deleteMany();
  // Remove sessions of non-admin users
  const admin = await prisma.authUser.findFirst({ where: { role: "ADMIN" } });
  await prisma.authSession.deleteMany(
    admin ? { where: { userId: { not: admin.id } } } : undefined
  );
  await prisma.authUser.deleteMany(admin ? { where: { id: { not: admin.id } } } : undefined);
  console.log("✅ Limpeza concluída\n");

  // ── 2. Admin ─────────────────────────────────
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim() || "admin@clteam.com";
  const adminPwd = process.env.BOOTSTRAP_ADMIN_PASSWORD || "ChangeMeNow!123";
  let adminUser = await prisma.authUser.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = await prisma.authUser.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(adminPwd),
        role: "ADMIN",
        displayName: "Admin CL Team",
      },
    });
    console.log("👤 Admin criado:", adminEmail);
  } else {
    console.log("👤 Admin já existe:", adminEmail);
  }

  // ── 3. Grade Profiles ────────────────────────
  console.log("\n📊 Criando grades...");

  const gradeMicro = await prisma.gradeProfile.create({
    data: {
      name: "Grade Micro — $5 a $22",
      description:
        "Você está na grade micro enquanto desenvolve consistência em volume e resultado.\n\nO foco agora é: jogar a grade completa, manter disciplina rigorosa com reentradas (máx. 1 por torneio) e dedicar pelo menos 8h semanais de estudo.\n\nQuando atingir os targets abaixo, você será promovido para a Grade Low.",
      rules: {
        create: [
          {
            filterName: "PKO $5-$16 PokerStars",
            lobbyzeFilterId: 1001,
            sites: [POKERSTARS],
            buyInMin: 5,
            buyInMax: 16.5,
            speed: [SPEED_REGULAR, SPEED_TURBO],
            variant: [VARIANT_KO, VARIANT_PKO],
            tournamentType: [TYPE_PKO],
          },
          {
            filterName: "Bounty Hunters $5-$22 GG Network",
            lobbyzeFilterId: 1002,
            sites: [GGNETWORK],
            buyInMin: 5,
            buyInMax: 22,
            speed: [SPEED_REGULAR, SPEED_TURBO],
            variant: [VARIANT_KO],
            tournamentType: [TYPE_REGULAR],
          },
        ],
      },
    },
  });

  const gradeLow = await prisma.gradeProfile.create({
    data: {
      name: "Grade Low — $22 a $55",
      description:
        "Parabéns pela promoção para a Grade Low! Este é um marco importante.\n\nNesta grade, o volume ideal é de 100-120 torneios por semana. Reentradas são permitidas apenas nos torneios marcados como HIGH priority.\n\nMantenha o ABI alvo de $35-$40 e o ROI acima de 2% por pelo menos 3 semanas consecutivas para avançar para a Grade Mid.",
      rules: {
        create: [
          {
            filterName: "PKO $22-$55 PokerStars",
            lobbyzeFilterId: 2001,
            sites: [POKERSTARS],
            buyInMin: 22,
            buyInMax: 55,
            speed: [SPEED_REGULAR, SPEED_TURBO],
            variant: [VARIANT_KO, VARIANT_PKO],
            tournamentType: [TYPE_PKO, TYPE_REGULAR],
          },
          {
            filterName: "Bounty Hunters $22-$55 GG Network",
            lobbyzeFilterId: 2002,
            sites: [GGNETWORK],
            buyInMin: 22,
            buyInMax: 55,
            speed: [SPEED_REGULAR, SPEED_TURBO],
            variant: [VARIANT_KO],
            tournamentType: [TYPE_REGULAR],
          },
        ],
      },
    },
  });

  const gradeLowLS = await prisma.gradeProfile.create({
    data: {
      name: "Grade Low LS (Especial)",
      description:
        "Grade customizada para o seu perfil de jogo. Os filtros foram ajustados para maximizar ROI com base na sua análise de mãos e spots com maior edge.\n\nFoco em torneios Regular speed com campos menores. Evite Turbos até o coach reavaliar seus números nesse formato.\n\nReentradas: apenas em torneios com GTD acima de $50K.",
      rules: {
        create: [
          {
            filterName: "PKO $22-$44 Stars LS",
            lobbyzeFilterId: 3001,
            sites: [POKERSTARS],
            buyInMin: 22,
            buyInMax: 44,
            speed: [SPEED_REGULAR],
            variant: [VARIANT_KO, VARIANT_PKO],
            tournamentType: [TYPE_PKO],
            prizePoolMin: 10000,
          },
          {
            filterName: "Bounty Hunters $22-$44 GG LS",
            lobbyzeFilterId: 3002,
            sites: [GGNETWORK],
            buyInMin: 22,
            buyInMax: 44,
            speed: [SPEED_REGULAR],
            variant: [VARIANT_KO],
            tournamentType: [TYPE_REGULAR],
          },
        ],
      },
    },
  });

  const gradeMid = await prisma.gradeProfile.create({
    data: {
      name: "Grade Mid — $55 a $109",
      description:
        "Você chegou ao mid stakes — excelente evolução! Este é um nível onde consistência e equilíbrio emocional são fundamentais.\n\nVolume ideal: 60-80 torneios/semana. Foque em qualidade de decisões, não só quantidade. Reentradas liberadas em torneios de campo acima de 200 entrants.\n\nMantenha contato semanal com o coach para análise de spots-chave.",
      rules: {
        create: [
          {
            filterName: "PKO $55-$109 PokerStars",
            lobbyzeFilterId: 4001,
            sites: [POKERSTARS],
            buyInMin: 55,
            buyInMax: 109,
            speed: [SPEED_REGULAR, SPEED_TURBO],
            variant: [VARIANT_KO, VARIANT_PKO],
            tournamentType: [TYPE_PKO, TYPE_REGULAR],
            prizePoolMin: 50000,
          },
          {
            filterName: "NLHE $55-$109 GG Network",
            lobbyzeFilterId: 4002,
            sites: [GGNETWORK],
            buyInMin: 55,
            buyInMax: 109,
            speed: [SPEED_REGULAR],
            variant: [VARIANT_KO],
            tournamentType: [TYPE_REGULAR],
          },
        ],
      },
    },
  });

  const gradeHigh = await prisma.gradeProfile.create({
    data: {
      name: "Grade High — $109+",
      description:
        "Grade de alto stakes. Cada torneio deve ser pré-aprovado pelo coach.\n\nAny deviation from this grade must be immediately communicated. Reentradas: apenas mediante autorização explícita.\n\nFoco total em ROI — volume secundário neste nível.",
      rules: {
        create: [
          {
            filterName: "PKO $109-$215 PokerStars",
            lobbyzeFilterId: 5001,
            sites: [POKERSTARS],
            buyInMin: 109,
            buyInMax: 215,
            speed: [SPEED_REGULAR],
            variant: [VARIANT_KO, VARIANT_PKO],
            tournamentType: [TYPE_PKO],
            prizePoolMin: 100000,
          },
        ],
      },
    },
  });

  console.log("  ✅ 5 grades criadas");

  // ── 4. Players ───────────────────────────────
  console.log("\n👥 Criando jogadores...");

  interface PlayerConfig {
    name: string;
    nickname: string;
    email: string;
    /** Opcional — seed não inclui coaches mock */
    coachId?: string | null;
    mainGrade: typeof gradeMicro;
    aboveGrade?: typeof gradeMicro;
    belowGrade?: typeof gradeMicro;
    inGradePool: Array<{ name: string; buyIn: number; site: string; speed: string }>;
    outGradePool: Array<{ name: string; buyIn: number; site: string; speed: string }>;
    extraPlays?: number;
    rebuys?: number;
    dontPlay?: number;
    targets: Array<{
      name: string;
      category: string;
      numericValue: number;
      numericCurrent: number;
      unit: string;
      greenThreshold: number;
      yellowThreshold: number;
    }>;
    limitChanges?: Array<{
      action: "UPGRADE" | "MAINTAIN" | "DOWNGRADE";
      fromGrade: string;
      toGrade: string;
      reason: string;
      daysBack: number;
    }>;
  }

  const playersConfig: PlayerConfig[] = [
    // ── Rafael's players ──
    {
      name: "Fabiano Alvarez",
      nickname: "Fabiano",
      email: "fabiano@clteam.com",
      mainGrade: gradeLow,
      aboveGrade: gradeMid,
      belowGrade: gradeMicro,
      inGradePool: [...TOURNAMENTS_STARS_LOW, ...TOURNAMENTS_GG_LOW],
      outGradePool: TOURNAMENTS_OUT_OF_GRADE_LOW,
      extraPlays: 3,
      rebuys: 2,
      dontPlay: 3,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 35, numericCurrent: 32.4, unit: "$", greenThreshold: 33, yellowThreshold: 28 },
        { name: "Volume Semanal", category: "volume", numericValue: 120, numericCurrent: 95, unit: "torneios", greenThreshold: 110, yellowThreshold: 80 },
        { name: "Estudo Semanal", category: "study", numericValue: 10, numericCurrent: 8, unit: "horas", greenThreshold: 9, yellowThreshold: 6 },
        { name: "ROI (últimos 30d)", category: "performance", numericValue: 3, numericCurrent: 1.8, unit: "%", greenThreshold: 2.5, yellowThreshold: 1 },
      ],
      limitChanges: [
        { action: "UPGRADE", fromGrade: "Grade Micro", toGrade: "Grade Low", reason: "ROI sustentado acima de 3% por 4 semanas + volume consistente", daysBack: 45 },
      ],
    },
    {
      name: "Adriana Silva",
      nickname: "Adriana",
      email: "adriana@clteam.com",
      mainGrade: gradeMicro,
      aboveGrade: gradeLow,
      inGradePool: [...TOURNAMENTS_STARS_MICRO, ...TOURNAMENTS_GG_MICRO],
      outGradePool: TOURNAMENTS_OUT_OF_GRADE_MICRO,
      extraPlays: 2,
      rebuys: 1,
      dontPlay: 5,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 18, numericCurrent: 15.2, unit: "$", greenThreshold: 16, yellowThreshold: 12 },
        { name: "Volume Semanal", category: "volume", numericValue: 100, numericCurrent: 85, unit: "torneios", greenThreshold: 90, yellowThreshold: 65 },
        { name: "ROI (últimos 30d)", category: "performance", numericValue: 2, numericCurrent: 1.2, unit: "%", greenThreshold: 1.8, yellowThreshold: 0.5 },
      ],
    },
    {
      name: "Pedro Victor",
      nickname: "PedroV",
      email: "pedro@clteam.com",
      mainGrade: gradeMicro,
      aboveGrade: gradeLow,
      inGradePool: [...TOURNAMENTS_STARS_MICRO, ...TOURNAMENTS_GG_MICRO],
      outGradePool: TOURNAMENTS_OUT_OF_GRADE_MICRO,
      extraPlays: 4,
      rebuys: 0,
      dontPlay: 7,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 15, numericCurrent: 11.5, unit: "$", greenThreshold: 14, yellowThreshold: 10 },
        { name: "Volume Semanal", category: "volume", numericValue: 90, numericCurrent: 58, unit: "torneios", greenThreshold: 80, yellowThreshold: 55 },
        { name: "Estudo Semanal", category: "study", numericValue: 8, numericCurrent: 3, unit: "horas", greenThreshold: 7, yellowThreshold: 4 },
      ],
    },
    {
      name: "Victor Santos",
      nickname: "VictorBc",
      email: "victor@clteam.com",
      mainGrade: gradeMicro,
      aboveGrade: gradeLow,
      inGradePool: [...TOURNAMENTS_STARS_MICRO, ...TOURNAMENTS_GG_MICRO],
      outGradePool: TOURNAMENTS_OUT_OF_GRADE_MICRO,
      extraPlays: 1,
      rebuys: 1,
      dontPlay: 4,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 16, numericCurrent: 14.8, unit: "$", greenThreshold: 15, yellowThreshold: 11 },
        { name: "Volume Semanal", category: "volume", numericValue: 95, numericCurrent: 88, unit: "torneios", greenThreshold: 88, yellowThreshold: 60 },
      ],
    },
    // ── Ana's players ──
    {
      name: "Bernardo Gomes",
      nickname: "Bernardo",
      email: "bernardo@clteam.com",
      mainGrade: gradeLowLS,
      aboveGrade: gradeMid,
      belowGrade: gradeMicro,
      inGradePool: [...TOURNAMENTS_STARS_LOW, ...TOURNAMENTS_GG_LOW],
      outGradePool: TOURNAMENTS_OUT_OF_GRADE_LOW,
      extraPlays: 2,
      rebuys: 2,
      dontPlay: 3,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 30, numericCurrent: 28.1, unit: "$", greenThreshold: 28, yellowThreshold: 22 },
        { name: "Volume Semanal", category: "volume", numericValue: 100, numericCurrent: 112, unit: "torneios", greenThreshold: 95, yellowThreshold: 70 },
        { name: "Spots Estudados (semanal)", category: "study", numericValue: 15, numericCurrent: 16, unit: "spots", greenThreshold: 14, yellowThreshold: 8 },
      ],
      limitChanges: [
        { action: "DOWNGRADE", fromGrade: "Grade Low", toGrade: "Grade Low LS", reason: "Ajuste estratégico — foco em formato Regular com menor campo", daysBack: 20 },
        { action: "UPGRADE", fromGrade: "Grade Micro", toGrade: "Grade Low", reason: "Resultados consistentes por 6 semanas no micro", daysBack: 65 },
      ],
    },
    {
      name: "Magno Ferreira",
      nickname: "Magno",
      email: "magno@clteam.com",
      mainGrade: gradeLowLS,
      aboveGrade: gradeMid,
      belowGrade: gradeMicro,
      inGradePool: [...TOURNAMENTS_STARS_LOW, ...TOURNAMENTS_GG_LOW],
      outGradePool: TOURNAMENTS_OUT_OF_GRADE_LOW,
      extraPlays: 1,
      rebuys: 1,
      dontPlay: 2,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 28, numericCurrent: 31.5, unit: "$", greenThreshold: 27, yellowThreshold: 20 },
        { name: "Volume Semanal", category: "volume", numericValue: 80, numericCurrent: 78, unit: "torneios", greenThreshold: 75, yellowThreshold: 55 },
        { name: "ROI (últimos 30d)", category: "performance", numericValue: 4, numericCurrent: 5.2, unit: "%", greenThreshold: 3.5, yellowThreshold: 1.5 },
      ],
    },
    {
      name: "Bruno Bianchini",
      nickname: "BrunoBi",
      email: "bianchini@clteam.com",
      mainGrade: gradeLow,
      aboveGrade: gradeMid,
      belowGrade: gradeMicro,
      inGradePool: [...TOURNAMENTS_STARS_LOW, ...TOURNAMENTS_GG_LOW],
      outGradePool: TOURNAMENTS_OUT_OF_GRADE_LOW,
      extraPlays: 3,
      rebuys: 3,
      dontPlay: 3,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 35, numericCurrent: 29.4, unit: "$", greenThreshold: 33, yellowThreshold: 25 },
        { name: "Volume Semanal", category: "volume", numericValue: 110, numericCurrent: 72, unit: "torneios", greenThreshold: 100, yellowThreshold: 70 },
        { name: "Estudo (horas/semana)", category: "study", numericValue: 10, numericCurrent: 5, unit: "horas", greenThreshold: 9, yellowThreshold: 5 },
      ],
    },
    {
      name: "João Marcello",
      nickname: "JMarcello",
      email: "joao@clteam.com",
      mainGrade: gradeMid,
      aboveGrade: gradeHigh,
      belowGrade: gradeLow,
      inGradePool: [...TOURNAMENTS_STARS_MID, ...TOURNAMENTS_GG_LOW],
      outGradePool: [{ name: "$215,00 SCOOP 68-H: $215 NLHE [PKO], $1M Gtd", buyIn: 215, site: "PokerStars", speed: "Regular" }],
      extraPlays: 1,
      rebuys: 1,
      dontPlay: 2,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 75, numericCurrent: 72.3, unit: "$", greenThreshold: 70, yellowThreshold: 55 },
        { name: "Volume Semanal", category: "volume", numericValue: 60, numericCurrent: 58, unit: "torneios", greenThreshold: 55, yellowThreshold: 40 },
        { name: "ROI (últimos 30d)", category: "performance", numericValue: 5, numericCurrent: 6.1, unit: "%", greenThreshold: 4, yellowThreshold: 2 },
      ],
      limitChanges: [
        { action: "UPGRADE", fromGrade: "Grade Low", toGrade: "Grade Mid", reason: "Excelente ROI por 5 semanas consecutivas + volume dentro do target", daysBack: 30 },
      ],
    },
    // ── Bruno's players ──
    {
      name: "Savin Weber",
      nickname: "Savin",
      email: "savin@clteam.com",
      mainGrade: gradeMid,
      aboveGrade: gradeHigh,
      belowGrade: gradeLow,
      inGradePool: [...TOURNAMENTS_STARS_MID, ...TOURNAMENTS_GG_LOW],
      outGradePool: [{ name: "$215,00 Sunday Warm-Up SE: $215 NLHE [PKO]", buyIn: 215, site: "PokerStars", speed: "Regular" }],
      extraPlays: 2,
      rebuys: 2,
      dontPlay: 3,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 75, numericCurrent: 68.2, unit: "$", greenThreshold: 70, yellowThreshold: 55 },
        { name: "Volume Semanal", category: "volume", numericValue: 60, numericCurrent: 55, unit: "torneios", greenThreshold: 56, yellowThreshold: 40 },
        { name: "ROI (últimos 30d)", category: "performance", numericValue: 5, numericCurrent: 4.3, unit: "%", greenThreshold: 4.5, yellowThreshold: 2 },
      ],
    },
    {
      name: "mlalarina Lopez",
      nickname: "mlalarina",
      email: "mlalarina@clteam.com",
      mainGrade: gradeMid,
      aboveGrade: gradeHigh,
      belowGrade: gradeLow,
      inGradePool: [...TOURNAMENTS_STARS_MID],
      outGradePool: [{ name: "$215,00 SCOOP 68-H: $215 NLHE [PKO], $1M Gtd", buyIn: 215, site: "PokerStars", speed: "Regular" }],
      extraPlays: 2,
      rebuys: 1,
      dontPlay: 2,
      targets: [
        { name: "ABI Alvo", category: "performance", numericValue: 80, numericCurrent: 85.4, unit: "$", greenThreshold: 75, yellowThreshold: 60 },
        { name: "ROI (últimos 30d)", category: "performance", numericValue: 6, numericCurrent: 7.2, unit: "%", greenThreshold: 5, yellowThreshold: 3 },
        { name: "Volume Semanal", category: "volume", numericValue: 50, numericCurrent: 48, unit: "torneios", greenThreshold: 45, yellowThreshold: 30 },
      ],
      limitChanges: [
        { action: "UPGRADE", fromGrade: "Grade Mid", toGrade: "Grade High (trial)", reason: "Dois meses com ROI acima de 7% — autorizado trial nos High stakes", daysBack: 10 },
        { action: "UPGRADE", fromGrade: "Grade Low", toGrade: "Grade Mid", reason: "Promoção por resultados excepcionais no Low", daysBack: 90 },
      ],
    },
  ];

  // ── 5. Create players + assignments + targets + imports ──
  for (const cfg of playersConfig) {
    console.log(`\n  ▸ Criando jogador: ${cfg.name} (${cfg.nickname})`);

    const player = await prisma.player.create({
      data: {
        name: cfg.name,
        nickname: cfg.nickname,
        email: cfg.email,
        coachId: cfg.coachId ?? null,
        status: "ACTIVE",
      },
    });

    // Grade assignments
    await prisma.playerGradeAssignment.create({
      data: {
        playerId: player.id,
        gradeId: cfg.mainGrade.id,
        gradeType: "MAIN",
        isActive: true,
        assignedBy: "admin",
        notes: "Grade principal atribuída pelo coach.",
      },
    });
    if (cfg.aboveGrade) {
      await prisma.playerGradeAssignment.create({
        data: {
          playerId: player.id,
          gradeId: cfg.aboveGrade.id,
          gradeType: "ABOVE",
          isActive: true,
          assignedBy: "admin",
          notes: "Grade acima — disponível mediante autorização.",
        },
      });
    }
    if (cfg.belowGrade) {
      await prisma.playerGradeAssignment.create({
        data: {
          playerId: player.id,
          gradeId: cfg.belowGrade.id,
          gradeType: "BELOW",
          isActive: true,
          assignedBy: "admin",
          notes: "Grade abaixo — usada em downturn ou período de ajuste.",
        },
      });
    }

    // Targets
    for (const tgt of cfg.targets) {
      const current = tgt.numericCurrent;
      const status =
        current >= tgt.greenThreshold
          ? "ON_TRACK"
          : current >= tgt.yellowThreshold
            ? "ATTENTION"
            : "OFF_TRACK";
      await prisma.playerTarget.create({
        data: {
          playerId: player.id,
          name: tgt.name,
          category: tgt.category,
          targetType: "NUMERIC",
          numericValue: tgt.numericValue,
          numericCurrent: tgt.numericCurrent,
          unit: tgt.unit,
          greenThreshold: tgt.greenThreshold,
          yellowThreshold: tgt.yellowThreshold,
          status,
          isActive: true,
          coachNotes: `Meta definida pelo coach para o ciclo atual.`,
        },
      });
    }

    // Limit change history
    if (cfg.limitChanges) {
      for (const lc of cfg.limitChanges) {
        await prisma.limitChangeHistory.create({
          data: {
            playerId: player.id,
            action: lc.action,
            fromGrade: lc.fromGrade,
            toGrade: lc.toGrade,
            reason: lc.reason,
            decidedBy: "coach",
            createdAt: daysAgo(lc.daysBack),
          },
        });
      }
    }

    // Tournament import — week 1 (7-14 days ago)
    const schedule1 = buildSchedule(cfg.inGradePool, cfg.outGradePool, {
      extraPlayCount: cfg.extraPlays ?? 2,
      rebuyCount: cfg.rebuys ?? 1,
      dontPlayCount: cfg.dontPlay ?? 3,
    });

    const importW1 = await prisma.tournamentImport.create({
      data: {
        fileName: `${cfg.nickname}_semana1.xlsx`,
        importType: "excel",
        playerName: cfg.nickname,
        importedBy: adminUser!.id,
        totalRows: schedule1.length,
        matchedInGrade: schedule1.filter((t) => t.scheduling === "Played").length,
        suspect: 0,
        outOfGrade: schedule1.filter((t) => t.scheduling === "Extra play").length,
        createdAt: daysAgo(8),
      },
    });

    for (const t of schedule1) {
      const date = daysAgo(7 + t.dayOffset, t.hour, 0);
      const isExtra = t.scheduling === "Extra play";
      const matchStatus = isExtra ? "OUT_OF_GRADE" : "IN_GRADE";

      const pt = await prisma.playedTournament.create({
        data: {
          playerId: player.id,
          importId: importW1.id,
          date,
          site: t.site,
          buyInCurrency: "$",
          buyInValue: t.buyIn,
          buyInUsd: t.buyIn,
          tournamentName: t.name,
          scheduling: t.scheduling,
          rebuy: t.rebuy,
          speed: t.speed,
          sharkId: isExtra ? String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000) : null,
          priority: t.priority,
          matchStatus,
        },
      });

      if (isExtra) {
        await prisma.gradeReviewItem.create({
          data: {
            playerId: player.id,
            tournamentId: pt.id,
            status: "PENDING",
            isInfraction: false,
          },
        });
      }
    }

    // Tournament import — week 2 (0-7 days ago) with fewer extra plays
    const schedule2 = buildSchedule(cfg.inGradePool, cfg.outGradePool, {
      extraPlayCount: Math.max(0, (cfg.extraPlays ?? 2) - 1),
      rebuyCount: cfg.rebuys ?? 1,
      dontPlayCount: cfg.dontPlay ?? 3,
    });

    const importW2 = await prisma.tournamentImport.create({
      data: {
        fileName: `${cfg.nickname}_semana2.xlsx`,
        importType: "excel",
        playerName: cfg.nickname,
        importedBy: adminUser!.id,
        totalRows: schedule2.length,
        matchedInGrade: schedule2.filter((t) => t.scheduling === "Played").length,
        suspect: 0,
        outOfGrade: schedule2.filter((t) => t.scheduling === "Extra play").length,
        createdAt: daysAgo(1),
      },
    });

    for (const t of schedule2) {
      const date = daysAgo(t.dayOffset, t.hour, 0);
      const isExtra = t.scheduling === "Extra play";
      const matchStatus = isExtra ? "OUT_OF_GRADE" : "IN_GRADE";

      const pt = await prisma.playedTournament.create({
        data: {
          playerId: player.id,
          importId: importW2.id,
          date,
          site: t.site,
          buyInCurrency: "$",
          buyInValue: t.buyIn,
          buyInUsd: t.buyIn,
          tournamentName: t.name,
          scheduling: t.scheduling,
          rebuy: t.rebuy,
          speed: t.speed,
          sharkId: isExtra ? String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000) : null,
          priority: t.priority,
          matchStatus,
        },
      });

      if (isExtra) {
        await prisma.gradeReviewItem.create({
          data: {
            playerId: player.id,
            tournamentId: pt.id,
            status: "PENDING",
            isInfraction: false,
          },
        });
      }
    }

    // One already-reviewed item (APPROVED) from an older import for realistic history
    const extraItems = await prisma.gradeReviewItem.findMany({
      where: { playerId: player.id },
      take: 1,
    });
    if (extraItems.length > 0) {
      await prisma.gradeReviewItem.update({
        where: { id: extraItems[0].id },
        data: {
          status: "APPROVED",
          reviewedBy: adminUser!.id,
          reviewedAt: daysAgo(6),
          reviewNotes: "Torneio autorizado pelo coach — campo especial este dia.",
        },
      });
    }

    const counts = {
      played: [...schedule1, ...schedule2].filter((t) => t.scheduling === "Played").length,
      extra: [...schedule1, ...schedule2].filter((t) => t.scheduling === "Extra play").length,
      missed: [...schedule1, ...schedule2].filter((t) => t.scheduling === "Didn't play").length,
      rebuy: [...schedule1, ...schedule2].filter((t) => t.rebuy).length,
    };
    console.log(
      `    📋 Torneios: ${counts.played} jogados · ${counts.extra} extra play · ${counts.missed} não jogados · ${counts.rebuy} rebuys`
    );
  }

  // ── 6. Summary ───────────────────────────────
  const [totalPlayers, totalGrades, totalImports, totalTournaments, totalReviews] =
    await Promise.all([
      prisma.player.count(),
      prisma.gradeProfile.count(),
      prisma.tournamentImport.count(),
      prisma.playedTournament.count(),
      prisma.gradeReviewItem.count(),
    ]);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Seed concluído com sucesso!\n");
  console.log(`   👥 Jogadores:      ${totalPlayers}`);
  console.log(`   📊 Grades:         ${totalGrades}`);
  console.log(`   📁 Importações:    ${totalImports}`);
  console.log(`   🎯 Torneios:       ${totalTournaments}`);
  console.log(`   🔍 Revisões:       ${totalReviews}`);
  console.log("\n   Login de teste:");
  console.log(`   Admin:  ${adminEmail} / (BOOTSTRAP_ADMIN_PASSWORD ou ChangeMeNow!123)`);
  console.log("   Coaches: cadastre via Usuários / convite (não há mais coaches mock no seed).");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
