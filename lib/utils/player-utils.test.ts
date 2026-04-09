import { describe, expect, it } from "vitest";
import { NONE } from "@/lib/constants";
import {
  buildAbiByPlayer,
  buildAssignedPlayersByGrade,
  formatAbiAlvo,
  initials,
  isAbiAlvoTargetName,
  parseAbiAlvoInput,
  schedulingCategory,
  toTableRows,
} from "./player-utils";

describe("formatAbiAlvo", () => {
  it("prefixo moeda", () => {
    expect(formatAbiAlvo(10, "$")).toBe("$10");
    expect(formatAbiAlvo(5, "€")).toBe("€5");
  });
  it("sufixo", () => {
    expect(formatAbiAlvo(12, "BB")).toBe("12 BB");
  });
  it("sem unidade", () => {
    expect(formatAbiAlvo(3, null)).toBe("3");
  });
});

describe("isAbiAlvoTargetName", () => {
  it("detecta ABI", () => {
    expect(isAbiAlvoTargetName("ABI alvo")).toBe(true);
    expect(isAbiAlvoTargetName("meta abi")).toBe(true);
  });
  it("não confunde", () => {
    expect(isAbiAlvoTargetName("ROI")).toBe(false);
  });
});

describe("parseAbiAlvoInput", () => {
  it("vazio ok", () => {
    expect(parseAbiAlvoInput("", "")).toEqual({ ok: true, value: null, unit: null });
  });
  it("valor válido", () => {
    expect(parseAbiAlvoInput("10,5", "BB")).toMatchObject({ ok: true, value: 10.5, unit: "BB" });
  });
  it("unit none → null", () => {
    expect(parseAbiAlvoInput("1", "none")).toMatchObject({ ok: true, unit: null });
  });
  it("inválido", () => {
    expect(parseAbiAlvoInput("x", "")).toMatchObject({ ok: false });
  });
});

describe("buildAbiByPlayer", () => {
  it("primeiro ABI por jogador", () => {
    const m = buildAbiByPlayer([
      { playerId: "a", name: "ABI alvo", numericValue: 1, unit: "$" },
      { playerId: "a", name: "ABI alvo", numericValue: 99, unit: null },
      { playerId: "b", name: "ROI", numericValue: 2, unit: null },
    ]);
    expect(m.get("a")).toEqual({ numericValue: 1, unit: "$" });
    expect(m.has("b")).toBe(false);
  });
});

describe("toTableRows", () => {
  it("monta linha mínima", () => {
    const rows = toTableRows(
      [
        {
          id: "p1",
          name: "João",
          nickname: "j",
          email: null,
          coachId: null,
          coach: null,
          status: "ACTIVE",
          playerGroup: null,
          gradeAssignments: [],
          nicks: [],
        },
      ],
      new Map(),
    );
    expect(rows[0]).toMatchObject({
      id: "p1",
      coachKey: NONE,
      gradeKey: NONE,
      abiLabel: "—",
    });
  });
});

describe("buildAssignedPlayersByGrade", () => {
  it("agrupa e ordena nomes", () => {
    const m = buildAssignedPlayersByGrade([
      { gradeId: "g1", player: { id: "2", name: "B" } },
      { gradeId: "g1", player: { id: "1", name: "Á" } },
    ]);
    expect(m.get("g1")?.map((p) => p.name)).toEqual(["Á", "B"]);
  });
});

describe("initials", () => {
  it("duas palavras", () => {
    expect(initials("Ana Maria")).toBe("AM");
  });
});

describe("schedulingCategory", () => {
  it.each([
    ["extra play", "extra"],
    ["played", "played"],
    ["jogado", "played"],
    ["", "missed"],
  ] as const)("«%s» → %s", (input, expected) => {
    expect(schedulingCategory(input)).toBe(expected);
  });
});
