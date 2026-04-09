import { describe, expect, it } from "vitest";
import { groupByPlayer, importRowDateLabel } from "./notification";
import type { ImportListRow, ReviewItem } from "@/lib/types";

describe("importRowDateLabel", () => {
  it("formata data ISO", () => {
    const row = { createdAt: "2024-06-15T14:30:00.000Z" } as ImportListRow;
    const s = importRowDateLabel(row);
    expect(s).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(s).toContain("•");
  });
});

describe("groupByPlayer", () => {
  it("agrupa por player.id e ordena por quantidade", () => {
    const p = { id: "p1", name: "A" };
    const reviews = [
      { id: "1", player: p },
      { id: "2", player: p },
      { id: "3", player: { id: "p2", name: "B" } },
    ] as ReviewItem[];
    const g = groupByPlayer(reviews);
    expect(g[0].reviews.length).toBe(2);
    expect(g[1].reviews.length).toBe(1);
    expect(g[0].player.id).toBe("p1");
  });
});
