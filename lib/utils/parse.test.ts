import { describe, expect, it } from "vitest";
import { parseJson, parseOptionalFloat, parseOptionalInt, toPrismaJson, toPrismaJsonOptional } from "./parse";

describe("parseOptionalFloat", () => {
  it("vazio → null", () => {
    expect(parseOptionalFloat("")).toBeNull();
    expect(parseOptionalFloat("   ")).toBeNull();
  });
  it("aceita vírgula decimal", () => {
    expect(parseOptionalFloat("1,5")).toBe(1.5);
  });
  it("rejeita negativo e não finito", () => {
    expect(Number.isNaN(parseOptionalFloat("-1"))).toBe(true);
    expect(Number.isNaN(parseOptionalFloat("abc"))).toBe(true);
  });
});

describe("parseOptionalInt", () => {
  it("parse int base 10", () => {
    expect(parseOptionalInt("42")).toBe(42);
  });
  it("trunca para int", () => {
    expect(parseOptionalInt("3.9")).toBe(3);
  });
});

describe("parseJson", () => {
  it("array passa direto", () => {
    expect(parseJson<{ a: number }>([{ a: 1 }])).toEqual([{ a: 1 }]);
  });
  it("string JSON array", () => {
    expect(parseJson<string>('["x"]')).toEqual(["x"]);
  });
  it("string inválida ou não-array → []", () => {
    expect(parseJson("{}")).toEqual([]);
    expect(parseJson("oops")).toEqual([]);
  });
  it("outros tipos → []", () => {
    expect(parseJson(null)).toEqual([]);
    expect(parseJson(1)).toEqual([]);
  });
});

describe("toPrismaJson", () => {
  it("preserva referência de tipo", () => {
    const o = { x: 1 };
    expect(toPrismaJson(o)).toBe(o);
  });
  it("optional undefined", () => {
    expect(toPrismaJsonOptional(null)).toBeUndefined();
    expect(toPrismaJsonOptional(undefined)).toBeUndefined();
  });
});
