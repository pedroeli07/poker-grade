import { describe, it, expect } from "vitest";
import {
  aggregateRows,
  emptyNetworkAggBucket,
  roiFromAgg,
  type TournamentRow,
} from "./completed-tournaments-aggregate";

describe("roiFromAgg", () => {
  it("retorna 100 * profit / investimento (campo stake no bucket)", () => {
    const b = { ...emptyNetworkAggBucket(), profit: 25, stake: 100 };
    expect(roiFromAgg(b)).toBe(25);
  });

  it("null se investimento zero", () => {
    const b = { ...emptyNetworkAggBucket(), profit: 10, stake: 0 };
    expect(roiFromAgg(b)).toBeNull();
  });
});

describe("aggregateRows", () => {
  function row(partial: Partial<TournamentRow> & Pick<TournamentRow, "date" | "prize">): TournamentRow {
    return {
      network: "GGNetwork",
      networkKey: "gg",
      stake: 9,
      rake: 1,
      investment: 10,
      position: 50,
      entrants: 100,
      playerName: "p",
      flags: "",
      tournamentType: "vanilla",
      gameClass: "",
      tournamentId: "t1",
      ...partial,
    };
  }

  it("soma lucro e investimento (stake+rake) por linha", () => {
    const rows: TournamentRow[] = [
      row({ date: 1, prize: 20, investment: 10, stake: 9, rake: 1 }),
      row({ date: 2, prize: -5, investment: 10, stake: 9, rake: 1 }),
    ];
    const { totals } = aggregateRows(rows);
    expect(totals.profit).toBe(15);
    expect(totals.stake).toBe(20);
    expect(roiFromAgg(totals)).toBe(75);
  });

  it("sem investment no row usa stake + rake", () => {
    const rows: TournamentRow[] = [
      {
        date: 1,
        network: "x",
        networkKey: "gg",
        stake: 5,
        rake: 5,
        investment: 0,
        prize: 2,
        position: 40,
        entrants: 200,
        playerName: "a",
        flags: "",
        tournamentType: "vanilla",
        gameClass: "",
        tournamentId: "t",
      },
    ];
    const { totals } = aggregateRows(rows);
    expect(totals.stake).toBe(10);
    expect(roiFromAgg(totals)).toBe(20);
  });
});
