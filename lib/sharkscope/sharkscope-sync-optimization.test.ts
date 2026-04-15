import { describe, it, expect } from "vitest";
import {
  computeStatsFromRows,
  filterTournamentRows,
  type TournamentRow,
} from "./completed-tournaments-aggregate";

function baseRow(
  date: number,
  opts: Partial<Omit<TournamentRow, "date">> = {},
): TournamentRow {
  return {
    date,
    network: "PokerStars",
    networkKey: "pokerstars",
    stake: 10,
    rake: 0,
    investment: 10,
    prize: 0,
    position: 60,
    entrants: 100,
    playerName: "player",
    flags: "",
    tournamentType: "vanilla",
    gameClass: "",
    tournamentId: `t-${date}`,
    ...opts,
  };
}

describe("sync SharkScope otimizado: 1× CT + janelas 10d/30d/90d só em memória", () => {
  it("filtra 10d e 30d a partir do mesmo array (simula um único fetch Date:90D)", () => {
    const now = Math.floor(Date.now() / 1000);
    const cutoff10 = now - 10 * 86400;
    const cutoff30 = now - 30 * 86400;

    const rOlderThan30d = baseRow(cutoff30 - 2 * 86400);
    const rIn30dNot10d = baseRow(cutoff30 + 5 * 86400);
    const rIn10d = baseRow(now - 2 * 86400);

    const allRows = [rOlderThan30d, rIn30dNot10d, rIn10d];
    const rows10d = filterTournamentRows(allRows, { afterTimestamp: cutoff10 });
    const rows30d = filterTournamentRows(allRows, { afterTimestamp: cutoff30 });

    expect(rows10d).toHaveLength(1);
    expect(rows10d[0]!.date).toBe(rIn10d.date);
    expect(rows30d).toHaveLength(2);
    expect(computeStatsFromRows(allRows).count).toBe(3);
    expect(computeStatsFromRows(rows10d).count).toBe(1);
    expect(computeStatsFromRows(rows30d).count).toBe(2);
  });

  it("breakdown bounty/sat/vanilla usa só rows30d (não refetch API)", () => {
    const now = Math.floor(Date.now() / 1000);
    const rows30d = [
      baseRow(now - 86400, { flags: "B", tournamentType: "bounty" }),
      baseRow(now - 2 * 86400, { flags: "SAT", tournamentType: "satellite" }),
      baseRow(now - 3 * 86400, { tournamentType: "vanilla" }),
    ];
    const bountyRows30 = filterTournamentRows(rows30d, { tournamentType: "bounty" });
    const satRows30 = filterTournamentRows(rows30d, { tournamentType: "satellite" });
    const vanillaRows30 = filterTournamentRows(rows30d, { tournamentType: "vanilla" });

    expect(bountyRows30).toHaveLength(1);
    expect(satRows30).toHaveLength(1);
    expect(vanillaRows30).toHaveLength(1);
    expect(computeStatsFromRows(bountyRows30).entries).toBe(1);
    expect(computeStatsFromRows(satRows30).entries).toBe(1);
    expect(computeStatsFromRows(vanillaRows30).entries).toBe(1);
  });

  it("stats_90d no código = computeStatsFromRows(allRows) (mesmo array do CT)", () => {
    const rows = [baseRow(Math.floor(Date.now() / 1000) - 86400)];
    const s = computeStatsFromRows(rows);
    expect(s.count).toBe(rows.length);
    expect(s.entries).toBeGreaterThan(0);
  });
});
