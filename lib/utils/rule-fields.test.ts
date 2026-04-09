import { describe, expect, it } from "vitest";
import { normalizeArray, parseValue } from "./rule-fields";

describe("parseValue", () => {
  it("não string retorna valor", () => {
    expect(parseValue("float", 3)).toBe(3);
  });
  it("float", () => {
    expect(parseValue("float", "2,5")).toBe(2.5);
  });
  it("int", () => {
    expect(parseValue("int", "7")).toBe(7);
  });
  it("outros tipos de string retornam string", () => {
    expect(parseValue("string", "a")).toBe("a");
  });
});

describe("normalizeArray", () => {
  it("mapeia item_id e item_text", () => {
    expect(
      normalizeArray([
        { item_id: 1, item_text: "A", extra: 1 },
        { item_id: 2, item_text: "B", foo: "x" },
      ]),
    ).toEqual([
      { item_id: 1, item_text: "A" },
      { item_id: 2, item_text: "B" },
    ]);
  });
});
